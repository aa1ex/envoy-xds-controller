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

package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// VirtualServiceSpec defines the desired state of VirtualService
type VirtualServiceSpec struct {
	VirtualServiceCommonSpec `json:",inline"`
	Template                 *ResourceRef   `json:"template,omitempty"`
	TemplateOptions          []TemplateOpts `json:"templateOptions,omitempty"`
}

// VirtualServiceStatus defines the observed state of VirtualService
type VirtualServiceStatus struct {
	Message     string        `json:"message,omitempty"`
	Invalid     bool          `json:"invalid"`
	UsedSecrets []ResourceRef `json:"usedSecrets,omitempty"`

	LastAppliedHash *uint32 `json:"lastAppliedHash,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:resource:shortName=vs,categories=all
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"
// +kubebuilder:printcolumn:name="Message",type="string",JSONPath=".status.message"
// +kubebuilder:printcolumn:name="Invalid",type="boolean",JSONPath=".status.invalid"
// +kubebuilder:printcolumn:name="AccessGroup",type="string",JSONPath=".metadata.labels['exc-access-group']"

// VirtualService is the Schema for the virtualservices API.
type VirtualService struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   VirtualServiceSpec   `json:"spec,omitempty"`
	Status VirtualServiceStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// VirtualServiceList contains a list of VirtualService.
type VirtualServiceList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []VirtualService `json:"items"`
}

func init() {
	SchemeBuilder.Register(&VirtualService{}, &VirtualServiceList{})
}
