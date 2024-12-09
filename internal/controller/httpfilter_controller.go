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

// HttpFilterReconciler reconciles a HttpFilter object
type HttpFilterReconciler struct {
	client.Client
	Scheme  *runtime.Scheme
	Updater *updater.CacheUpdater
}

// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=httpfilters,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=httpfilters/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=envoy.kaasops.io,resources=httpfilters/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the HttpFilter object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.19.1/pkg/reconcile
func (r *HttpFilterReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)
	var httpFilter envoyv1alpha1.HttpFilter
	if err := r.Get(ctx, req.NamespacedName, &httpFilter); err != nil {
		if client.IgnoreNotFound(err) != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, r.Updater.DeleteHTTPFilter(ctx, req.NamespacedName)
	}
	return ctrl.Result{}, r.Updater.UpsertHTTPFilter(ctx, &httpFilter)
}

// SetupWithManager sets up the controller with the Manager.
func (r *HttpFilterReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&envoyv1alpha1.HttpFilter{}).
		Named("httpfilter").
		Complete(r)
}