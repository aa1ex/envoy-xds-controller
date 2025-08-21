package main

import (
	"context"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync/atomic"
	"syscall"
	"time"

	cachev3 "github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	"github.com/envoyproxy/go-control-plane/pkg/server/v3"
	"github.com/go-logr/zapr"
	"github.com/kaasops/envoy-xds-controller/internal/xds"
	excCache "github.com/kaasops/envoy-xds-controller/internal/xds/cache"
	"github.com/kaasops/envoy-xds-controller/internal/xds/redisstore"
	"go.uber.org/zap/zapcore"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"
)

var (
	serviceLog = ctrl.Log.WithName("xds-service")
)

func applySnapshots(ctx context.Context, snapshotCache cachev3.SnapshotCache, client *redisstore.Client) error {
	snaps, err := client.LoadSnapshots(ctx)
	if err != nil {
		return fmt.Errorf("failed to load snapshots from redis: %w", err)
	}
	for nodeID, snapshot := range snaps {
		if err := snapshot.Consistent(); err != nil {
			serviceLog.Error(err, "snapshot inconsistency", "node", nodeID)
			continue
		}
		if err := snapshotCache.SetSnapshot(ctx, nodeID, snapshot); err != nil {
			serviceLog.Error(err, "snapshot apply error", "node", nodeID)
			continue
		}
	}
	return nil
}

func main() {
	var (
		port         int
		httpAddr     string
		autoSync     bool
		syncInterval time.Duration
	)
	// Flags
	var devMode bool
	flag.IntVar(&port, "port", 18000, "xDS management server port")
	flag.StringVar(&httpAddr, "http", ":8080", "HTTP listen address for manual sync endpoint")
	flag.BoolVar(&autoSync, "auto-sync", false, "enable automatic periodic sync from Redis")
	flag.DurationVar(&syncInterval, "sync-interval", 30*time.Second, "interval for automatic sync from Redis")
	flag.BoolVar(&devMode, "development", false, "Enable dev mode")
	// zap logger options and initialization
	opts := zap.Options{Development: devMode}
	opts.BindFlags(flag.CommandLine)
	flag.Parse()
	zapLevel := zap.Level(zapcore.InfoLevel)
	if devMode {
		zapLevel = zap.Level(zapcore.DebugLevel)
	}
	zapLogger := zap.NewRaw(zap.UseFlagOptions(&opts), zapLevel)
	ctrl.SetLogger(zapr.NewLogger(zapLogger))

	// Runtime switch for auto-sync, initialized from flag
	var autoSyncEnabled atomic.Bool
	autoSyncEnabled.Store(autoSync)

	if autoSync && syncInterval <= 0 {
		serviceLog.Error(fmt.Errorf("invalid sync-interval"), "must be > 0 when auto-sync is enabled")
		os.Exit(1)
	}

	// Root context canceled on SIGINT/SIGTERM
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Create a cache (use internal wrapper for consistency)
	var snapshotCache cachev3.SnapshotCache = excCache.NewSnapshotCache()

	client := redisstore.NewFromEnv()

	// Track last sync time and duration
	var lastSyncTime atomic.Int64     // UnixNano of last sync completion
	var lastSyncDuration atomic.Int64 // duration in nanoseconds

	// Helper to perform sync and record metrics
	syncAndRecord := func(ctx context.Context) error {
		start := time.Now()
		err := applySnapshots(ctx, snapshotCache, client)
		end := time.Now()
		dur := end.Sub(start)
		lastSyncTime.Store(end.UnixNano())
		lastSyncDuration.Store(int64(dur))
		return err
	}

	// Initial load
	if err := syncAndRecord(ctx); err != nil {
		serviceLog.Error(err, "initial sync failed")
		os.Exit(1)
	}

	// HTTP server with graceful shutdown
	mux := http.NewServeMux()
	mux.HandleFunc("/admin/sync", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			ns := lastSyncTime.Load()
			if ns == 0 {
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write([]byte("no sync yet"))
				return
			}
			t := time.Unix(0, ns).UTC()
			dur := time.Duration(lastSyncDuration.Load())
			w.WriteHeader(http.StatusOK)
			_, _ = fmt.Fprintf(w, "last sync: %s, duration: %s", t.Format(time.RFC3339), dur.String())
		case http.MethodPost:
			ctxReq, cancel := context.WithTimeout(r.Context(), 10*time.Second)
			defer cancel()
			if err := syncAndRecord(ctxReq); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				_, _ = fmt.Fprintf(w, "sync failed: %v", err)
				return
			}
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("sync ok"))
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})
	// Admin endpoint to get/set auto-sync state
	mux.HandleFunc("/admin/auto-sync", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			status := "disabled"
			if autoSyncEnabled.Load() {
				status = "enabled"
			}
			w.WriteHeader(http.StatusOK)
			_, _ = fmt.Fprintf(w, "auto-sync: %s, interval: %s", status, syncInterval.String())
		case http.MethodPost:
			enableStr := r.URL.Query().Get("enable")
			if enableStr == "" {
				w.WriteHeader(http.StatusBadRequest)
				_, _ = w.Write([]byte("missing 'enable' query param: true|false"))
				return
			}
			enable, err := strconv.ParseBool(enableStr)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				_, _ = fmt.Fprintf(w, "invalid 'enable' value: %v", err)
				return
			}
			if enable && syncInterval <= 0 {
				w.WriteHeader(http.StatusBadRequest)
				_, _ = w.Write([]byte("cannot enable auto-sync: non-positive sync-interval"))
				return
			}
			prev := autoSyncEnabled.Swap(enable)
			serviceLog.Info("admin changed auto-sync state", "enable", enable, "prev", prev)
			w.WriteHeader(http.StatusOK)
			_, _ = fmt.Fprintf(w, "auto-sync set to %t", enable)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	httpSrv := &http.Server{
		Addr:              httpAddr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	go func() {
		serviceLog.Info("starting HTTP server for manual sync", "addr", httpAddr)
		if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serviceLog.Error(err, "HTTP server error")
		}
	}()

	// Auto-sync ticker goroutine: created when interval > 0; executes only if enabled via admin flag
	if syncInterval > 0 {
		serviceLog.Info("auto-sync", "initial", autoSyncEnabled.Load(), "interval", syncInterval.String())
		go func() {
			ticker := time.NewTicker(syncInterval)
			defer ticker.Stop()
			for {
				select {
				case <-ctx.Done():
					return
				case <-ticker.C:
					if !autoSyncEnabled.Load() {
						continue
					}
					ctxTick, cancel := context.WithTimeout(ctx, 10*time.Second)
					if err := syncAndRecord(ctxTick); err != nil {
						serviceLog.Error(err, "auto-sync error")
					}
					cancel()
				}
			}
		}()
	} else {
		serviceLog.Info("auto-sync ticker disabled", "syncInterval", syncInterval.String())
	}

	// Run the xDS server in background
	srv := server.NewServer(ctx, snapshotCache, nil)
	errCh := make(chan error, 1)
	go func() {
		if err := xds.RunServer(srv, port); err != nil {
			errCh <- err
		}
	}()

	// Wait for signal or server error
	select {
	case <-ctx.Done():
		// graceful HTTP shutdown
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := httpSrv.Shutdown(shutdownCtx); err != nil {
			serviceLog.Error(err, "HTTP server shutdown error")
		}
	case err := <-errCh:
		serviceLog.Error(err, "xDS server error")
		// ensure HTTP server is shut down too
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = httpSrv.Shutdown(shutdownCtx)
	}

	// Give some time for logs to flush in some environments
	time.Sleep(100 * time.Millisecond)
}
