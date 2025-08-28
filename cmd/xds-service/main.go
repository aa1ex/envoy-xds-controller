package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync/atomic"
	"syscall"
	"time"

	cachev3 "github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	resourcev3 "github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	"github.com/envoyproxy/go-control-plane/pkg/server/v3"
	"github.com/go-logr/zapr"
	"github.com/kaasops/envoy-xds-controller/internal/xds"
	excCache "github.com/kaasops/envoy-xds-controller/internal/xds/cache"
	"github.com/kaasops/envoy-xds-controller/internal/xds/callbacks"
	"github.com/kaasops/envoy-xds-controller/internal/xds/redisstore"
	"go.uber.org/zap/zapcore"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"
)

var (
	serviceLog = ctrl.Log.WithName("xds-service")
)

var adminTmpl = template.Must(template.New("admin").Parse(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>xDS Admin</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; margin: 2rem; }
    h1 { font-size: 1.4rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .row { margin: .5rem 0; }
    button { padding: .5rem 1rem; cursor: pointer; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>xDS Service Admin</h1>
  <div class="card">
    <div class="row"><strong>Last sync:</strong> {{.LastSyncText}}</div>
    <div class="row"><strong>Auto-sync:</strong> {{if .AutoSyncEnabled}}enabled{{else}}disabled{{end}} (interval: {{.SyncInterval}})</div>
  </div>
  <div class="card">
    <div class="row">
      <a href="/admin/sync">GET /admin/sync</a>
    </div>
    <div class="row">
      <form method="post" action="/admin/sync">
        <button type="submit">Run manual sync (POST /admin/sync)</button>
      </form>
    </div>
  </div>
  <div class="card">
    <div class="row"><strong>Auto-sync control:</strong></div>
    <div class="row" style="display:flex; gap: .5rem;">
      <form method="post" action="/admin/auto-sync?enable=true"><button type="submit">Enable</button></form>
      <form method="post" action="/admin/auto-sync?enable=false"><button type="submit">Disable</button></form>
    </div>
  </div>
  <div class="card">
    <div class="row"><strong>Snapshots:</strong></div>
    <div class="row">
      <a href="/admin/snapshots">GET /admin/snapshots</a> (JSON)
    </div>
    <div class="row">
      <form method="get" onsubmit="event.preventDefault(); var id = this.querySelector('input').value.trim(); if (id) { window.location = '/admin/snapshots/' + encodeURIComponent(id); }">
        <label>Node ID:&nbsp;<input type="text" placeholder="enter nodeId" /></label>
        <button type="submit">Open /admin/snapshots/:nodeId</button>
      </form>
    </div>
  </div>
</body>
</html>`))

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
	mux.HandleFunc("/admin", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		ns := lastSyncTime.Load()
		lastText := "no sync yet"
		if ns != 0 {
			t := time.Unix(0, ns).UTC()
			dur := time.Duration(lastSyncDuration.Load())
			lastText = fmt.Sprintf("%s, duration: %s", t.Format(time.RFC3339), dur.String())
		}
		data := struct {
			LastSyncText    string
			AutoSyncEnabled bool
			SyncInterval    string
		}{
			LastSyncText:    lastText,
			AutoSyncEnabled: autoSyncEnabled.Load(),
			SyncInterval:    syncInterval.String(),
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		if err := adminTmpl.Execute(w, data); err != nil {
			serviceLog.Error(err, "admin template execute error")
		}
	})
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

	// Admin endpoints for snapshots
	// GET /admin/snapshots -> list of nodes with versions and resource counts
	mux.HandleFunc("/admin/snapshots", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		// exact path should serve the list; if a trailing slash is present, we'll treat it via the next handler
		if r.URL.Path != "/admin/snapshots" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		keys := snapshotCache.GetStatusKeys()
		res := make([]map[string]any, 0, len(keys))
		for _, nodeID := range keys {
			snap, err := snapshotCache.GetSnapshot(nodeID)
			if err != nil {
				// skip nodes without a snapshot
				continue
			}
			info := map[string]any{
				"nodeId":   nodeID,
				"versions": map[string]string{
					"clusters":  snap.GetVersion(resourcev3.ClusterType),
					"routes":    snap.GetVersion(resourcev3.RouteType),
					"listeners": snap.GetVersion(resourcev3.ListenerType),
					"endpoints": snap.GetVersion(resourcev3.EndpointType),
					"secrets":   snap.GetVersion(resourcev3.SecretType),
				},
				"counts": map[string]int{
					"clusters":  len(snap.GetResources(resourcev3.ClusterType)),
					"routes":    len(snap.GetResources(resourcev3.RouteType)),
					"listeners": len(snap.GetResources(resourcev3.ListenerType)),
					"endpoints": len(snap.GetResources(resourcev3.EndpointType)),
					"secrets":   len(snap.GetResources(resourcev3.SecretType)),
				},
			}
			res = append(res, info)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(res)
	})
	// GET /admin/snapshots/:nodeId -> info for a specific node
	mux.HandleFunc("/admin/snapshots/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		prefix := "/admin/snapshots/"
		if len(r.URL.Path) <= len(prefix) {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		nodeID := r.URL.Path[len(prefix):]
		snap, err := snapshotCache.GetSnapshot(nodeID)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte("snapshot not found"))
			return
		}
		res := map[string]any{
			"nodeId":   nodeID,
			"versions": map[string]string{
				"clusters":  snap.GetVersion(resourcev3.ClusterType),
				"routes":    snap.GetVersion(resourcev3.RouteType),
				"listeners": snap.GetVersion(resourcev3.ListenerType),
				"endpoints": snap.GetVersion(resourcev3.EndpointType),
				"secrets":   snap.GetVersion(resourcev3.SecretType),
			},
			"counts": map[string]int{
				"clusters":  len(snap.GetResources(resourcev3.ClusterType)),
				"routes":    len(snap.GetResources(resourcev3.RouteType)),
				"listeners": len(snap.GetResources(resourcev3.ListenerType)),
				"endpoints": len(snap.GetResources(resourcev3.EndpointType)),
				"secrets":   len(snap.GetResources(resourcev3.SecretType)),
			},
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(res)
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
	srv := server.NewServer(ctx, snapshotCache, callbacks.NewCallbacks(serviceLog))
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
