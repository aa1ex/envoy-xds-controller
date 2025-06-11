import { Control, UseFormSetValue, useWatch } from 'react-hook-form'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'
import { useEffect } from 'react'
import { IVirtualServiceForm } from '../../components/virtualServiceForm/types.ts'
import { FillTemplateResponse } from '../../gen/virtual_service_template/v1/virtual_service_template_pb.ts'

interface UseAccessLogTemplateOptionsProps {
	control: Control<IVirtualServiceForm>
	setValue?: UseFormSetValue<IVirtualServiceForm>
	fillTemplate?: FillTemplateResponse
}

export const useAccessLogTemplateOptions = ({
	control,
	setValue,
	fillTemplate
}: UseAccessLogTemplateOptionsProps): void => {
	const readMode = useViewModeStore(state => state.viewMode) === 'read'

	const accessLogField = useWatch({ control, name: 'accessLogConfigUid' })

	useEffect(() => {
		if (!fillTemplate?.raw || readMode || !accessLogField || !setValue) return

		try {
			const parsed = JSON.parse(fillTemplate.raw)
			if ('accessLog' in parsed) {
				setValue('templateOptions', [{ field: 'accessLog', modifier: 3 }], {
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true
				})
			}
		} catch (e) {
			console.error('Error parse fillTemplate.raw:', e)
		}
	}, [fillTemplate, readMode, accessLogField, setValue])
}
