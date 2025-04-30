/*
Copyright 2024.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"
	"fmt"
	xdsServer "github.com/envoyproxy/go-control-plane/pkg/server/v3"
	"github.com/envoyproxy/go-control-plane/pkg/test/v3"
	"github.com/kaasops/envoy-xds-controller/internal/xds"
	"github.com/kaasops/envoy-xds-controller/internal/xds/cache"
	"github.com/kaasops/envoy-xds-controller/internal/xds/updater"
	v1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/utils/ptr"
	"time"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	envoyv1alpha1 "github.com/kaasops/envoy-xds-controller/api/v1alpha1"
)

// VirtualServiceReconciler reconciles a VirtualService object
type VirtualServiceReconciler struct {
	client.Client
	Scheme  *runtime.Scheme
	Updater *updater.CacheUpdater
}

// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=virtualservices,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=virtualservices/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=virtualservices/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the VirtualService object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.19.1/pkg/reconcile
func (r *VirtualServiceReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	rlog := log.FromContext(ctx).WithName("virtualService-reconciler").WithValues("virtualService", req.NamespacedName)
	rlog.Info("Reconciling VirtualService")

	var vs envoyv1alpha1.VirtualService
	if err := r.Get(ctx, req.NamespacedName, &vs); err != nil {
		if client.IgnoreNotFound(err) != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, r.Updater.DeleteVirtualService(ctx, req.NamespacedName)
	}

	if vs.IsNewOrChanged() {
		res, err := r.validate(ctx, &vs)
		if err != nil {
			return ctrl.Result{}, err
		}
		if res.Valid {
			vs.Status.Valid = true
			vs.Status.Message = ""
			vs.Status.LastAppliedHash = vs.GetHashSum()
		} else {
			vs.Status.Valid = false
			vs.Status.Message = res.Message
			vs.Status.LastAppliedHash = vs.GetHashSum()
		}
		if err := r.Status().Update(ctx, &vs); err != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, nil
	}

	if vs.Status.Valid {
		if err := r.Updater.UpsertVirtualService(ctx, &vs); err != nil {
			return ctrl.Result{}, err
		}
	}

	rlog.Info("Finished Reconciling VirtualService")

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *VirtualServiceReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&envoyv1alpha1.VirtualService{}).
		Named("virtualservice").
		Complete(r)
}

const (
	envoyPort = 14300
)

type validationResult struct {
	Valid   bool
	Message string
}

func (r *VirtualServiceReconciler) validate(ctx context.Context, vs *envoyv1alpha1.VirtualService) (*validationResult, error) {
	snapshotCache := cache.NewSnapshotCache()
	cacheUpdater := updater.NewCacheUpdater(snapshotCache, r.Updater.CloneStore())
	if err := cacheUpdater.UpsertVirtualService(ctx, vs); err != nil {
		return nil, err
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	var srv *xds.Server

	defer func() {
		if srv != nil {
			srv.Stop()
		}
	}()

	go func() {
		fmt.Println("================= XDS_VALIDATE_START")
		srv = xds.NewServer(xdsServer.NewServer(ctx, snapshotCache, &test.Callbacks{Debug: true}))
		err := srv.Serve(envoyPort) // TODO: hardcode
		if err != nil {
			fmt.Println("================= XDS_VALIDATE_ERROR:", err)
			return
		}
	}()

	nodeIDs := vs.GetNodeIDs()
	if len(nodeIDs) == 1 && nodeIDs[0] == "*" {
		nodeIDs = r.Updater.GetNodeIDs()
	}

	for _, nodeID := range nodeIDs {
		if err := r.createEnvoyConfigMap(ctx, nodeID); err != nil {
			return nil, err
		}
		if err := r.createEnvoyDeployment(ctx); err != nil {
			return nil, err
		}

		time.Sleep(time.Minute)

		if err := r.Client.Delete(ctx, &v1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: "envoy-deployment", Namespace: "default"}}); err != nil {
			return nil, err
		}
		if err := r.Client.Delete(ctx, &corev1.ConfigMap{ObjectMeta: metav1.ObjectMeta{Name: "envoy-config", Namespace: "default"}}); err != nil {
			return nil, err
		}
		// check status
	}

	return &validationResult{Valid: true}, nil
}

func (r *VirtualServiceReconciler) createEnvoyConfigMap(ctx context.Context, nodeID string) error {
	configMap := &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "envoy-config",
			Namespace: "default",
			Labels: map[string]string{
				"app": "envoy",
			},
		},
		Data: map[string]string{
			"envoy.yaml": fmt.Sprintf(`
admin:
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 19001
dynamic_resources:
  ads_config:
    api_type: DELTA_GRPC
    transport_api_version: V3
    set_node_on_first_message_only: true
    grpc_services:
      - envoy_grpc:
          cluster_name: xds_cluster
  lds_config:
    resource_api_version: V3
    ads: {}
  cds_config:
    resource_api_version: V3
    ads: {}
node:
  cluster: check
  id: %s
static_resources:
  clusters:
    - typed_extension_protocol_options:
        envoy.extensions.upstreams.http.v3.HttpProtocolOptions:
          "@type": type.googleapis.com/envoy.extensions.upstreams.http.v3.HttpProtocolOptions
          explicit_http_config:
            http2_protocol_options:
              connection_keepalive:
                interval: 30s
                timeout: 50s
      connect_timeout: 100s
      load_assignment:
        cluster_name: xds_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: localhost
                      port_value: %d
      http2_protocol_options: {}
      name: xds_cluster
      type: LOGICAL_DNS
`, nodeID, envoyPort),
		},
	}

	err := r.Client.Create(ctx, configMap)
	if err != nil {
		return fmt.Errorf("failed to create config map: %w", err)
	}
	return nil
}

func (r *VirtualServiceReconciler) createEnvoyDeployment(ctx context.Context) error {
	deployment := &v1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "envoy-deployment",
			Namespace: "default",
			Labels: map[string]string{
				"app": "envoy",
			},
		},
		Spec: v1.DeploymentSpec{
			Replicas: ptr.To[int32](1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "envoy",
				},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "envoy",
					},
				},
				Spec: corev1.PodSpec{
					Volumes: []corev1.Volume{
						{
							Name: "envoy-config",
							VolumeSource: corev1.VolumeSource{
								ConfigMap: &corev1.ConfigMapVolumeSource{
									LocalObjectReference: corev1.LocalObjectReference{
										Name: "envoy-config",
									},
								},
							},
						},
					},
					Containers: []corev1.Container{
						{
							Name:  "envoy",
							Image: "envoyproxy/envoy:v1.34.0",
							Ports: []corev1.ContainerPort{
								{
									ContainerPort: 14000,
									Protocol:      corev1.ProtocolTCP,
								},
							},
							VolumeMounts: []corev1.VolumeMount{
								{
									Name:      "envoy-config",
									MountPath: "/etc/envoy/",
									ReadOnly:  true,
								},
							},
						},
					},
				},
			},
		},
	}

	err := r.Client.Create(ctx, deployment)
	if err != nil {
		return fmt.Errorf("failed to create deployment: %w", err)
	}
	return nil
}
