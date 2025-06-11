import { Control, UseFormSetValue, useWatch } from 'react-hook-form'
import { IVirtualServiceForm } from '../../components/virtualServiceForm/types.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'
import { useEffect } from 'react'

interface IUseRouteTemplateOptions {
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
}

export const useRouteTemplateOptions = ({ control, setValue }: IUseRouteTemplateOptions) => {
	{
		const readMode = useViewModeStore(state => state.viewMode) === 'read'

		const isReplaceMode = useWatch({ control, name: 'additionalRouteMode' })
		const routeField = useWatch({ control, name: 'additionalRouteUids' })

		useEffect(() => {
			if (readMode || !routeField) return

			if (isReplaceMode) {
				setValue('templateOptions', [{ field: 'additionalRoutes', modifier: 2 }], {
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
		}, [isReplaceMode, readMode, setValue, routeField])
	}
}
