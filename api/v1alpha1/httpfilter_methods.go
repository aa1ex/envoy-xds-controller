package v1alpha1

import (
	hcmv3 "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/network/http_connection_manager/v3"
	"github.com/kaasops/envoy-xds-controller/internal/protoutil"
)

func (h *HttpFilter) UnmarshalV3() ([]*hcmv3.HttpFilter, error) {
	return h.unmarshalV3()
}

func (h *HttpFilter) UnmarshalV3AndValidate() ([]*hcmv3.HttpFilter, error) {
	httpFilters, err := h.unmarshalV3()
	if err != nil {
		return nil, err
	}
	for _, httpFilter := range httpFilters {
		if err := httpFilter.ValidateAll(); err != nil {
			return nil, err
		}
	}
	return httpFilters, nil
}

func (h *HttpFilter) unmarshalV3() ([]*hcmv3.HttpFilter, error) {
	if len(h.Spec) == 0 {
		return nil, ErrSpecNil
	}

	httpFilters := make([]*hcmv3.HttpFilter, 0, len(h.Spec))
	for _, httpFilterSpec := range h.Spec {
		var httpFilter hcmv3.HttpFilter
		if err := protoutil.Unmarshaler.Unmarshal(httpFilterSpec.Raw, &httpFilter); err != nil {
			return nil, err
		}
		httpFilters = append(httpFilters, &httpFilter)
	}
	return httpFilters, nil
}

func (h *HttpFilter) IsEqual(other *HttpFilter) bool {
	if h == nil && other == nil {
		return true
	}
	if h == nil || other == nil {
		return false
	}
	if len(h.Spec) != len(other.Spec) {
		return false
	}
	for i, httpFilterSpec := range h.Spec {
		if string(other.Spec[i].Raw) != string(httpFilterSpec.Raw) {
			return false
		}
	}
	return true
}
