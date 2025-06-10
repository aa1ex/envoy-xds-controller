import { Control, UseFormSetValue, useWatch } from 'react-hook-form'
import { IVirtualServiceForm } from '../../components/virtualServiceForm/types.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'
import { useEffect } from 'react'

interface UseVHDomainsTemplateOptionsProps {
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
}

export const useVHDomainsTemplateOptions = ({ control, setValue }: UseVHDomainsTemplateOptionsProps): void => {
	const readMode = useViewModeStore(state => state.viewMode) === 'read'

	const isReplaceMode = useWatch({ control, name: 'virtualHostDomainsMode' })

	useEffect(() => {
		if (readMode) return

		if (isReplaceMode) {
			setValue('templateOptions', [{ field: 'virtualHost.domains', modifier: 2 }], {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true
			})
		} else {
			setValue('templateOptions', [], {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true
			})
		}
	}, [isReplaceMode, readMode, setValue])
}
