package v1alpha1

import (
	listenerv3 "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	"github.com/kaasops/envoy-xds-controller/internal/protoutil"
)

func (l *Listener) UnmarshalV3() (*listenerv3.Listener, error) {
	return l.unmarshalV3()
}

func (l *Listener) unmarshalV3() (*listenerv3.Listener, error) {
	if l.Spec == nil {
		return nil, ErrSpecNil
	}
	var listener listenerv3.Listener
	if err := protoutil.Unmarshaler.Unmarshal(l.Spec.Raw, &listener); err != nil {
		return nil, err
	}
	return &listener, nil
}

func (l *Listener) UnmarshalV3AndValidate() (*listenerv3.Listener, error) {
	listener, err := l.unmarshalV3()
	if err != nil {
		return nil, err
	}
	return nil, listener.ValidateAll()
}
