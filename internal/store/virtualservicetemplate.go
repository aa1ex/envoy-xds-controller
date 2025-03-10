package store

import (
	"github.com/kaasops/envoy-xds-controller/api/v1alpha1"
	"github.com/kaasops/envoy-xds-controller/internal/helpers"
	"maps"
)

func (s *Store) SetVirtualServiceTemplate(vst *v1alpha1.VirtualServiceTemplate) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.virtualServiceTemplates[helpers.NamespacedName{Namespace: vst.Namespace, Name: vst.Name}] = vst
	s.updateVirtualServiceTemplateByUIDMap()
}

func (s *Store) GetVirtualServiceTemplate(name helpers.NamespacedName) *v1alpha1.VirtualServiceTemplate {
	s.mu.RLock()
	defer s.mu.RUnlock()
	vst, _ := s.virtualServiceTemplates[name]
	return vst
}

func (s *Store) DeleteVirtualServiceTemplate(name helpers.NamespacedName) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.virtualServiceTemplates, name)
	s.updateVirtualServiceTemplateByUIDMap()
}

func (s *Store) IsExistingVirtualServiceTemplate(name helpers.NamespacedName) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.virtualServiceTemplates[name]
	return ok
}

func (s *Store) MapVirtualServiceTemplates() map[helpers.NamespacedName]*v1alpha1.VirtualServiceTemplate {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return maps.Clone(s.virtualServiceTemplates)
}

func (s *Store) updateVirtualServiceTemplateByUIDMap() {
	if len(s.virtualServiceTemplates) == 0 {
		return
	}
	m := make(map[string]*v1alpha1.VirtualServiceTemplate, len(s.virtualServiceTemplates))
	for _, vst := range s.virtualServiceTemplates {
		m[string(vst.UID)] = vst
	}
	s.virtualServiceTemplateByUID = m
}

func (s *Store) GetVirtualServiceTemplateByUID(uid string) *v1alpha1.VirtualServiceTemplate {
	s.mu.RLock()
	defer s.mu.RUnlock()
	vst, _ := s.virtualServiceTemplateByUID[uid]
	return vst
}
