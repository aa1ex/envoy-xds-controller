package api

import (
	"connectrpc.com/grpcreflect"
	"fmt"
	"github.com/casbin/casbin/v2"
	"github.com/kaasops/envoy-xds-controller/internal/grpcapi"
	"github.com/kaasops/envoy-xds-controller/internal/store"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_group/v1/access_groupv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/access_log_config/v1/access_log_configv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/cluster/v1/clusterv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/http_filter/v1/http_filterv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/listener/v1/listenerv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/node/v1/nodev1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/policy/v1/policyv1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/route/v1/routev1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service/v1/virtual_servicev1connect"
	"github.com/kaasops/envoy-xds-controller/pkg/api/grpc/virtual_service_template/v1/virtual_service_templatev1connect"
	"github.com/rs/cors"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"net"
	"net/http"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"strconv"
	"time"

	ginzap "github.com/gin-contrib/zap"
	"go.uber.org/zap"

	"github.com/kaasops/envoy-xds-controller/internal/xds/api/v1/middlewares"

	gincors "github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	xdscache "github.com/kaasops/envoy-xds-controller/internal/xds/cache"

	"github.com/kaasops/envoy-xds-controller/internal/xds/api/v1/handlers"

	docs "github.com/kaasops/envoy-xds-controller/docs/cacheRestAPI"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Config struct {
	EnableDevMode bool
	Auth          struct {
		Enabled             bool
		IssuerURL           string
		ClientID            string
		ACL                 map[string][]string
		AccessControlModel  string
		AccessControlPolicy string
	}
	StaticResources struct {
		AccessGroups []string `json:"excAccessGroups"`
		NodeIDs      []string `json:"nodeIds"`
	}
}

type Client struct {
	Cache   *xdscache.SnapshotCache
	cfg     *Config
	logger  *zap.Logger
	devMode bool
}

func New(cache *xdscache.SnapshotCache, cfg *Config, logger *zap.Logger, devMode bool) *Client {
	return &Client{
		Cache:   cache,
		cfg:     cfg,
		logger:  logger,
		devMode: devMode,
	}
}

func (c *Client) Run(port int, cacheAPIScheme, cacheAPIAddr string) error {
	server := gin.New()
	gin.DebugPrintRouteFunc = func(httpMethod, absolutePath, handlerName string, _ int) {
		c.logger.Debug(fmt.Sprintf("endpoint %v %v %v", httpMethod, absolutePath, handlerName))
	}
	if c.devMode {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	server.Use(ginzap.Ginzap(c.logger, time.RFC3339, true))
	server.Use(ginzap.RecoveryWithZap(c.logger, true))

	// TODO: Fix CORS policy (don't enable for all origins)
	server.Use(gincors.New(gincors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	if c.cfg.Auth.Enabled {
		authMiddleware, err := middlewares.NewAuth(c.cfg.Auth.IssuerURL, c.cfg.Auth.ClientID, c.cfg.Auth.ACL, c.cfg.EnableDevMode)
		if err != nil {
			return fmt.Errorf("failed to create auth middleware: %w", err)
		}
		server.Use(authMiddleware.HandlerFunc)
	}

	handlers.RegisterRoutes(server, c.Cache)

	// Register swagger
	docs.SwaggerInfo.Schemes = []string{cacheAPIScheme}
	docs.SwaggerInfo.Host = cacheAPIAddr
	url := ginSwagger.URL(fmt.Sprintf("%v://%v/swagger/doc.json", cacheAPIScheme, cacheAPIAddr))
	server.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	// Run server
	if err := server.Run(fmt.Sprintf(":%d", port)); err != nil {
		return err
	}

	return nil
}

func (c *Client) RunGRPC(port int, s *store.Store, mgrClient client.Client, targetNs string) error {
	mux := http.NewServeMux()

	path, handler := virtual_servicev1connect.NewVirtualServiceStoreServiceHandler(grpcapi.NewVirtualServiceStore(s, mgrClient, targetNs))
	mux.Handle(path, handler)
	path, handler = virtual_service_templatev1connect.NewVirtualServiceTemplateStoreServiceHandler(grpcapi.NewVirtualServiceTemplateStore(s))
	mux.Handle(path, handler)
	path, handler = listenerv1connect.NewListenerStoreServiceHandler(grpcapi.NewListenerStore(s))
	mux.Handle(path, handler)
	path, handler = access_log_configv1connect.NewAccessLogConfigStoreServiceHandler(grpcapi.NewAccessLogConfigStore(s))
	mux.Handle(path, handler)
	path, handler = routev1connect.NewRouteStoreServiceHandler(grpcapi.NewRouteStore(s))
	mux.Handle(path, handler)
	path, handler = http_filterv1connect.NewHTTPFilterStoreServiceHandler(grpcapi.NewHTTPFilterStore(s))
	mux.Handle(path, handler)
	path, handler = policyv1connect.NewPolicyStoreServiceHandler(grpcapi.NewPolicyStore(s))
	mux.Handle(path, handler)
	path, handler = clusterv1connect.NewClusterStoreServiceHandler(grpcapi.NewClusterStore(s))
	mux.Handle(path, handler)
	path, handler = nodev1connect.NewNodeStoreServiceHandler(grpcapi.NewNodeStore(c.cfg.StaticResources.NodeIDs))
	mux.Handle(path, handler)
	path, handler = access_groupv1connect.NewAccessGroupStoreServiceHandler(grpcapi.NewAccessGroupStore(c.cfg.StaticResources.AccessGroups))
	mux.Handle(path, handler)

	reflector := grpcreflect.NewStaticReflector()
	mux.Handle(grpcreflect.NewHandlerV1(reflector))
	mux.Handle(grpcreflect.NewHandlerV1Alpha(reflector))

	handler = mux

	if c.cfg.Auth.Enabled {
		enforcer, err := casbin.NewEnforcer(c.cfg.Auth.AccessControlModel, c.cfg.Auth.AccessControlPolicy)
		if err != nil {
			return err
		}
		middleware, err := grpcapi.NewAuthMiddleware(c.cfg.Auth.IssuerURL, c.cfg.Auth.ClientID, enforcer)
		if err != nil {
			return err
		}
		handler = middleware.Wrap(mux)
	}

	go func() {
		_ = http.ListenAndServe(
			net.JoinHostPort("", strconv.Itoa(port)),
			// Use h2c so we can serve HTTP/2 without TLS.
			h2c.NewHandler(cors.AllowAll().Handler(handler), &http2.Server{}),
		)
	}()
	return nil
}
