package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-logr/zapr"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/extproc"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/httpapi"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/resolver"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/store"
	"go.uber.org/zap/zapcore"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"

	extprocv3 "github.com/envoyproxy/go-control-plane/envoy/service/ext_proc/v3"
	"google.golang.org/grpc"
)

var (
	log = ctrl.Log.WithName("xds-gateway")
)

func getenv(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

func getenvInt(key string, def int) int {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return i
}

func getenvBool(key string, def bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return def
	}
	return b
}

func main() {
	var (
		grpcPort int
		httpAddr string
		devMode  bool
	)

	flag.IntVar(&grpcPort, "grpc-port", getenvInt("GRPC_PORT", 8081), "gRPC ExtProc listen port")
	flag.StringVar(&httpAddr, "http", getenv("HTTP_ADDR", ":8080"), "HTTP listen address")
	flag.BoolVar(&devMode, "development", getenvBool("DEBUG", false), "Enable dev mode logging and gin")

	// zap logger options
	opts := zap.Options{Development: devMode}
	opts.BindFlags(flag.CommandLine)
	flag.Parse()
	zapLevel := zap.Level(zapcore.InfoLevel)
	if devMode {
		zapLevel = zap.Level(zapcore.DebugLevel)
	}
	zapLogger := zap.NewRaw(zap.UseFlagOptions(&opts), zapLevel)
	ctrl.SetLogger(zapr.NewLogger(zapLogger))

	if !devMode {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Store options from env
	redisAddr := getenv("REDIS_ADDR", "127.0.0.1:6379")
	redisPWD := os.Getenv("REDIS_PASSWORD")
	redisDB := getenvInt("REDIS_DB", 0)

	storeClient := store.New(store.Options{Addr: redisAddr, Password: redisPWD, DB: redisDB, Timeout: 5 * time.Second})

	// Check Redis availability on startup
	pingCtx, cancelPing := context.WithTimeout(ctx, 5*time.Second)
	defer cancelPing()
	if err := storeClient.Ping(pingCtx); err != nil {
		log.Error(err, "redis ping failed", "addr", redisAddr, "db", redisDB)
		os.Exit(1)
	}

	cacheTTL := time.Duration(getenvInt("CACHE_TTL_SECONDS", 60)) * time.Second
	negTTL := time.Duration(getenvInt("NEGATIVE_CACHE_TTL_SECONDS", 10)) * time.Second
	res := resolver.New(storeClient, cacheTTL, negTTL)

	// Apply default plane if provided
	if def := os.Getenv("DEFAULT_PLANE_ID"); def != "" {
		if err := storeClient.SetDefaultRoute(ctx, def); err != nil {
			log.Error(err, "failed to set default route from env")
		}
	}

	// Start Redis events subscription for cache invalidation
	events := make(chan store.Event, 128)
	if err := storeClient.SubscribeEvents(ctx, events); err != nil {
		log.Error(err, "subscribe events failed")
	} else {
		go func() {
			var last time.Time
			for {
				select {
				case <-ctx.Done():
					return
				case <-events:
					// simple throttle to avoid storm
					now := time.Now()
					if now.Sub(last) > 100*time.Millisecond {
						res.ClearCaches()
						last = now
					}
				}
			}
		}()
	}

	// HTTP API
	token := os.Getenv("AUTH_TOKEN")
	r := gin.New()
	r.Use(gin.Recovery())
	api := httpapi.NewAPI(storeClient, res, token)
	api.RegisterRoutes(r)
	httpSrv := &http.Server{Addr: httpAddr, Handler: r}

	// gRPC ExtProc server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", grpcPort))
	if err != nil {
		log.Error(err, "failed to listen gRPC", "port", grpcPort)
		os.Exit(1)
	}
	grpcSrv := grpc.NewServer()
	extprocv3.RegisterExternalProcessorServer(grpcSrv, extproc.NewServer(res))

	// Run servers
	done := make(chan struct{})
	go func() {
		if err := httpSrv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error(err, "http server error")
		}
		close(done)
	}()
	go func() {
		if err := grpcSrv.Serve(lis); err != nil {
			log.Error(err, "grpc server error")
		}
		close(done)
	}()

	<-ctx.Done()
	// Shutdown sequence
	shCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = httpSrv.Shutdown(shCtx)
	grpcSrv.GracefulStop()
	// give a moment for goroutines
	time.Sleep(200 * time.Millisecond)
}
