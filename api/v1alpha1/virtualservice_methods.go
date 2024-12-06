package v1alpha1

import (
	"encoding/json"
	"fmt"
	"github.com/kaasops/envoy-xds-controller/internal/merge"
	"strings"
)

const (
	annotationKeyEnvoyKaaSopsIoNodeID = "envoy.kaasops.io/node-id"
)

func (vs *VirtualService) GetNodeIDs() []string {
	annotations := vs.GetAnnotations()
	nodeIDsAnnotation, _ := annotations[annotationKeyEnvoyKaaSopsIoNodeID]
	if nodeIDsAnnotation == "" {
		return nil
	}
	keys := make(map[string]struct{})
	var list []string
	for _, entry := range strings.Split(nodeIDsAnnotation, ",") {
		entry = strings.TrimSpace(entry)
		if _, value := keys[entry]; !value {
			keys[entry] = struct{}{}
			list = append(list, entry)
		}
	}
	return list
}

func (vs *VirtualService) FillFromTemplate(vst *VirtualServiceTemplate, templateOpts ...TemplateOpts) error {
	baseData, err := json.Marshal(vst.Spec.VirtualServiceCommonSpec)
	if err != nil {
		return err
	}
	svcData, err := json.Marshal(vs.Spec.VirtualServiceCommonSpec)
	if err != nil {
		return err
	}
	var tOpts []merge.Opt
	if len(templateOpts) > 0 {
		tOpts = make([]merge.Opt, 0, len(templateOpts))
		for _, opt := range templateOpts {
			if opt.Field == "" {
				return fmt.Errorf("template option field is empty")
			}
			var op merge.OperationType
			switch opt.Modifier {
			case ModifierMerge:
				op = merge.OperationMerge
			case ModifierReplace:
				op = merge.OperationReplace
			case ModifierDelete:
				op = merge.OperationDelete
			default:
				return fmt.Errorf("template option modifier is invalid")
			}
			tOpts = append(tOpts, merge.Opt{
				Path:      opt.Field,
				Operation: op,
			})
		}
	}
	mergedDate := merge.JSONRawMessages(baseData, svcData, tOpts)
	err = json.Unmarshal(mergedDate, &vs.Spec.VirtualServiceCommonSpec)
	if err != nil {
		return err
	}
	return nil
}

func (vs *VirtualService) IsEqual(other *VirtualService) bool {
	if vs == nil && other == nil {
		return true
	}
	if vs == nil || other == nil {
		return false
	}
	if vs.Annotations[annotationKeyEnvoyKaaSopsIoNodeID] != other.Annotations[annotationKeyEnvoyKaaSopsIoNodeID] {
		return false
	}
	if !vs.Spec.VirtualServiceCommonSpec.IsEqual(&other.Spec.VirtualServiceCommonSpec) {
		return false
	}
	if vs.Spec.Template == nil && other.Spec.Template != nil {
		return false
	}
	if vs.Spec.Template != nil && other.Spec.Template == nil {
		return false
	}
	if vs.Spec.Template != nil && other.Spec.Template != nil {
		if vs.Spec.Template.Name != other.Spec.Template.Name {
			return false
		}
		if vs.Spec.Template.Namespace != other.Spec.Template.Namespace {
			return false
		}
		if len(vs.Spec.TemplateOptions) != len(other.Spec.TemplateOptions) {
			return false
		}
		for i, opt := range vs.Spec.TemplateOptions {
			if other.Spec.TemplateOptions[i].Field != opt.Field {
				return false
			}
			if other.Spec.TemplateOptions[i].Modifier != opt.Modifier {
				return false
			}
		}
	}
	return true
}
