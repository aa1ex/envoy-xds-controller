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

	"github.com/kaasops/envoy-xds-controller/internal/xds/updater"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	envoyv1alpha1 "github.com/kaasops/envoy-xds-controller/api/v1alpha1"
)

// RouteReconciler reconciles a Route object
type RouteReconciler struct {
	client.Client
	Scheme         *runtime.Scheme
	Updater        *updater.CacheUpdater
	CacheReadyChan chan struct{}
}

// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=routes,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=routes/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=routes/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Route object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.19.1/pkg/reconcile
func (r *RouteReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	<-r.CacheReadyChan

	rlog := log.FromContext(ctx).WithName("route-reconciler").WithValues("route", req.NamespacedName)
	rlog.Info("Reconciling Route")

	var route envoyv1alpha1.Route
	if err := r.Get(ctx, req.NamespacedName, &route); err != nil {
		if client.IgnoreNotFound(err) != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, r.Updater.DeleteRoute(ctx, req.NamespacedName)
	}

	if err := r.Updater.ApplyRoute(ctx, &route); err != nil {
		return ctrl.Result{}, err
	}

	rlog.Info("Finished Reconciling Route")
	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *RouteReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&envoyv1alpha1.Route{}).
		Named("route").
		Complete(r)
}
