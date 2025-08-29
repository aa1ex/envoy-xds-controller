package httpapi

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/kaasops/envoy-xds-controller/internal/gateway"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/resolver"
	"github.com/kaasops/envoy-xds-controller/internal/gateway/store"
)

//go:embed ui/*
var uiFS embed.FS

type API struct {
	store    *store.Store
	resolver *resolver.Resolver
	token    string
}

func NewAPI(s *store.Store, r *resolver.Resolver, bearerToken string) *API {
	return &API{store: s, resolver: r, token: bearerToken}
}

func (a *API) authMiddleware(c *gin.Context) {
	if a.token == "" {
		c.Next()
		return
	}
	h := c.GetHeader("Authorization")
	if !strings.HasPrefix(h, "Bearer ") || strings.TrimPrefix(h, "Bearer ") != a.token {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	c.Next()
}

func (a *API) RegisterRoutes(r *gin.Engine) {
	// Static UI from embedded FS
	sub, err := fs.Sub(uiFS, "ui")
	if err == nil {
		// Serve assets under /ui/*
		r.StaticFS("/ui", http.FS(sub))
		// Serve index at root
		r.GET("/", func(c *gin.Context) {
			b, err := uiFS.ReadFile("ui/index.html")
			if err != nil {
				c.String(http.StatusInternalServerError, "index load error")
				return
			}
			c.Data(http.StatusOK, "text/html; charset=utf-8", b)
		})
		// SPA fallback for non-API routes
		r.NoRoute(func(c *gin.Context) {
			p := c.Request.URL.Path
			if strings.HasPrefix(p, "/api/") || p == "/healthz" || p == "/readyz" {
				c.Status(http.StatusNotFound)
				return
			}
			b, err := uiFS.ReadFile("ui/index.html")
			if err != nil {
				c.Status(http.StatusNotFound)
				return
			}
			c.Data(http.StatusOK, "text/html; charset=utf-8", b)
		})
	}

	// health
	r.GET("/healthz", func(c *gin.Context) { c.String(200, "ok") })
	r.GET("/readyz", func(c *gin.Context) { c.String(200, "ready") })

	api := r.Group("/api/v1", a.authMiddleware)
	{
		// planes
		api.PUT("/planes/:plane_id", a.putPlane)
		api.GET("/planes", a.listPlanes)
		api.GET("/planes/:plane_id", a.getPlane)
		api.DELETE("/planes/:plane_id", a.deletePlane)

		// client routes
		api.GET("/clients", a.listClientRoutes)
		api.PUT("/clients/:client_key", a.putClientRoute)
		api.DELETE("/clients/:client_key", a.deleteClientRoute)
		api.GET("/clients/:client_key", a.getClientInfo)

		// cohorts
		api.GET("/cohorts", a.listCohorts)
		api.PUT("/cohorts/:name", a.putCohortRoute)
		api.DELETE("/cohorts/:name", a.deleteCohortRoute)
		api.PUT("/clients/:client_key/cohort", a.putClientCohort)
		api.DELETE("/clients/:client_key/cohort", a.deleteClientCohort)

		// default
		api.PUT("/defaults/route", a.putDefaultRoute)
		api.GET("/resolve/:client_key", a.resolveClient)
	}
}

func (a *API) listClientRoutes(c *gin.Context) {
	m, err := a.store.ListClientRoutes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

type planeBody struct {
	Address string `json:"address"`
	Port    int    `json:"port"`
	Enabled bool   `json:"enabled"`
	Region  string `json:"region"`
	Weight  int    `json:"weight"`
}

type targetBody struct {
	Target string `json:"target"`
}

type cohortBody struct {
	Name string `json:"name"`
}

func (a *API) putPlane(c *gin.Context) {
	var b planeBody
	if err := c.ShouldBindJSON(&b); err != nil || b.Address == "" || b.Port <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	p := gateway.Plane{Address: b.Address, Port: b.Port, Enabled: b.Enabled, Region: b.Region, Weight: b.Weight}
	if err := a.store.PutPlane(c.Request.Context(), c.Param("plane_id"), p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) listPlanes(c *gin.Context) {
	ps, err := a.store.ListPlanes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ps)
}

func (a *API) getPlane(c *gin.Context) {
	p, err := a.store.GetPlane(c.Request.Context(), c.Param("plane_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if p == nil {
		c.Status(http.StatusNotFound)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (a *API) deletePlane(c *gin.Context) {
	if err := a.store.DeletePlane(c.Request.Context(), c.Param("plane_id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) putClientRoute(c *gin.Context) {
	var b targetBody
	if err := c.ShouldBindJSON(&b); err != nil || b.Target == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if err := a.store.PutClientRoute(c.Request.Context(), c.Param("client_key"), b.Target); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) deleteClientRoute(c *gin.Context) {
	if err := a.store.DeleteClientRoute(c.Request.Context(), c.Param("client_key")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) getClientInfo(c *gin.Context) {
	clientKey := c.Param("client_key")
	ctx := c.Request.Context()
	target, err := a.store.GetClientRoute(ctx, clientKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	cohort, err := a.store.GetClientCohort(ctx, clientKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	res, err := a.resolver.Resolve(ctx, clientKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	out := gin.H{"resolved": res.Resolved.PlaneID, "source": res.Resolved.Source, "plane_enabled": res.Resolved.PlaneEnabled}
	if target != "" {
		out["target"] = target
	}
	if cohort != "" {
		out["cohort"] = cohort
	}
	c.JSON(http.StatusOK, out)
}

func (a *API) putCohortRoute(c *gin.Context) {
	var b targetBody
	if err := c.ShouldBindJSON(&b); err != nil || b.Target == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if err := a.store.PutCohortRoute(c.Request.Context(), c.Param("name"), b.Target); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) deleteCohortRoute(c *gin.Context) {
	if err := a.store.DeleteCohortRoute(c.Request.Context(), c.Param("name")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) putClientCohort(c *gin.Context) {
	var b cohortBody
	if err := c.ShouldBindJSON(&b); err != nil || b.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if err := a.store.PutClientCohort(c.Request.Context(), c.Param("client_key"), b.Name); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) deleteClientCohort(c *gin.Context) {
	if err := a.store.DeleteClientCohort(c.Request.Context(), c.Param("client_key")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) putDefaultRoute(c *gin.Context) {
	var b targetBody
	if err := c.ShouldBindJSON(&b); err != nil || b.Target == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if err := a.store.SetDefaultRoute(c.Request.Context(), b.Target); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (a *API) resolveClient(c *gin.Context) {
	clientKey := c.Param("client_key")
	res, err := a.resolver.Resolve(c.Request.Context(), clientKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res.Resolved)
}

func (a *API) listCohorts(c *gin.Context) {
	cs, err := a.store.ListCohortRoutes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, cs)
}
