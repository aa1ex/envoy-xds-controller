package store

import (
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/helpers"
	"maps"
)

func (s *Store) SetVirtualService(vs *v1alpha1.VirtualService) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.virtualServices[helpers.NamespacedName{Namespace: vs.Namespace, Name: vs.Name}] = vs
}

func (s *Store) GetVirtualService(name helpers.NamespacedName) *v1alpha1.VirtualService {
	s.mu.RLock()
	defer s.mu.RUnlock()
	vs, _ := s.virtualServices[name]
	return vs
}

func (s *Store) DeleteVirtualService(name helpers.NamespacedName) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.virtualServices, name)
}

func (s *Store) IsExistingVirtualService(name helpers.NamespacedName) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.virtualServices[name]
	return ok
}

func (s *Store) MapVirtualServices() map[helpers.NamespacedName]*v1alpha1.VirtualService {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return maps.Clone(s.virtualServices)
}
