import React, { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { SubmitHandler, useForm } from 'react-hook-form'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import { debounce, Tab } from '@mui/material'

import {
	CreateVirtualServiceRequest,
	UpdateVirtualServiceRequest
} from '../../gen/virtual_service/v1/virtual_service_pb'
import { ResourceRef, VirtualHost } from '../../gen/common/v1/common_pb.ts'

import { useCreateVs, useFillTemplate, useListVs, useUpdateVs } from '../../api/grpc/hooks/useVirtualService.ts'
import CustomTabPanel from '../customTabPanel/CustomTabPanel.tsx'
import { a11yProps } from '../customTabPanel/style.ts'
import { ErrorSnackBarVs } from '../errorSnackBarVs/errorSnackBarVs.tsx'
import { GeneralTabVs } from '../generalTabVS/generalTabVS.tsx'
import { SettingsTabVs } from '../settingsTabVs/settingsTabVs.tsx'
import { TemplateOptionsFormVs } from '../templateOptionsFormVs/templateOptionsFormVs.tsx'
import { VirtualHostDomains } from '../virtualHostDomains/virtualHostDomains.tsx'

import { useTabStore } from '../../store/tabIndexStore.ts'
import { useViewModeStore } from '../../store/viewModeVsStore.ts'

import { IVirtualServiceForm, IVirtualServiceFormProps } from './types.ts'
import { CodeBlockVs } from '../codeBlockVs/codeBlockVs.tsx'
import { boxForm, tabsStyle, vsForm, vsFormLeftColumn, vsFormWrapper } from './style.ts'
import { ActionButtonsVs } from '../actionButtonsVs/actionButtonsVs.tsx'

export const VirtualServiceForm: React.FC<IVirtualServiceFormProps> = ({ virtualServiceInfo }) => {
	const navigate = useNavigate()
	const { groupId } = useParams()
	const isCreate = useLocation().pathname.split('/').pop() === 'createVs'

	const setViewMode = useViewModeStore(state => state.setViewMode)

	useEffect(() => {
		if (isCreate) {
			setViewMode('edit')
		}
	}, [isCreate, setViewMode])

	const tabIndex = useTabStore(state => state.tabIndex)
	const setTabIndex = useTabStore(state => state.setTabIndex)

	const { refetch } = useListVs(false, groupId)
	const { createVirtualService, isFetchingCreateVs, errorCreateVs } = useCreateVs()
	const { updateVS, isFetchingUpdateVs, errorUpdateVs, resetQueryUpdateVs } = useUpdateVs()

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid, isSubmitted },
		setValue,
		control,
		setError,
		clearErrors,
		watch,
		getValues,
		reset,
		trigger
	} = useForm<IVirtualServiceForm>({
		mode: 'onChange',
		defaultValues: {
			name: '',
			nodeIds: [],
			virtualHostDomains: [],
			accessGroup: isCreate ? groupId : '',
			additionalHttpFilterUids: [],
			additionalRouteUids: [],
			useRemoteAddress: undefined,
			templateOptions: [],
			viewTemplateMode: false
		},
		shouldUnregister: false
	})

	const { fillTemplate, rawData, isLoadingFillTemplate, errorFillTemplate } = useFillTemplate()

	const [name, nodeIds, templateUid] = watch(['name', 'nodeIds', 'templateUid'])

	const isFormReady =
		isValid && Boolean(name?.length) && Array.isArray(nodeIds) && nodeIds.length > 0 && Boolean(templateUid)

	const prepareTemplateRequestData = useCallback((formValues: any) => {
		const { nodeIds, virtualHostDomains, templateOptions, accessLogConfigUid, viewTemplateMode, ...rest } =
			formValues || {}

		const cleanedTemplateOptions =
			Array.isArray(templateOptions) && templateOptions.some(opt => opt.field === '' && opt.modifier === 0)
				? []
				: templateOptions

		return {
			...rest,
			virtualHost: {
				$typeName: 'common.v1.VirtualHost',
				domains: virtualHostDomains || []
			},
			accessLogConfig: {
				value: accessLogConfigUid || '',
				case: 'accessLogConfigUid'
			},
			templateOptions: cleanedTemplateOptions,
			expandReferences: viewTemplateMode
		}
	}, [])

	useEffect(() => {
		if (tabIndex === 0 && isSubmitted) {
			void trigger('name')
		}
	}, [tabIndex, trigger, isSubmitted])

	useEffect(() => {
		const debouncedFillTemplate = debounce((formValues: IVirtualServiceForm) => {
			void fillTemplate(prepareTemplateRequestData(formValues))
		}, 500)

		const subscription = watch((_formValues, { name: changedField }) => {
			const fullForm = getValues()
			const { templateUid, templateOptions } = fullForm

			const allOptionsValid = templateOptions?.every(opt => opt.field && opt.modifier && opt.modifier !== 0)

			if (!templateUid) return

			if (changedField === 'name' || changedField === 'virtualHostDomains') {
				debouncedFillTemplate(fullForm)
			} else if (changedField?.startsWith('templateOptions')) {
				if (allOptionsValid) {
					debouncedFillTemplate(fullForm)
				}
			} else {
				void fillTemplate(prepareTemplateRequestData(fullForm))
			}
		})

		return () => {
			subscription.unsubscribe()
			debouncedFillTemplate.clear()
		}
	}, [watch, getValues, fillTemplate, setTabIndex, prepareTemplateRequestData])

	const handleSetDefaultValues = useCallback(() => {
		if (isCreate || !virtualServiceInfo) return

		const vhDomains = virtualServiceInfo?.virtualHost?.domains || []

		reset({
			name: virtualServiceInfo.name,
			nodeIds: virtualServiceInfo.nodeIds || [],
			accessGroup: virtualServiceInfo.accessGroup,
			templateUid: virtualServiceInfo.template?.uid,
			listenerUid: virtualServiceInfo.listener?.uid,
			accessLogConfigUid: (virtualServiceInfo.accessLog?.value as ResourceRef)?.uid || '',
			useRemoteAddress: virtualServiceInfo.useRemoteAddress,
			templateOptions: virtualServiceInfo.templateOptions,
			virtualHostDomains: vhDomains,
			additionalHttpFilterUids: virtualServiceInfo.additionalHttpFilters?.map(filter => filter.uid) || [],
			additionalRouteUids: virtualServiceInfo.additionalRoutes?.map(router => router.uid) || [],
			description: virtualServiceInfo.description
		})
	}, [reset, isCreate, virtualServiceInfo])

	useEffect(() => {
		handleSetDefaultValues()
	}, [handleSetDefaultValues])

	const handleChangeTabIndex = (_e: React.SyntheticEvent, newTabIndex: number) => {
		setTabIndex(newTabIndex)
	}

	const handleResetForm = () => {
		isCreate ? reset() : handleSetDefaultValues()
		setTabIndex(0)
	}

	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		if (!isFormReady) return

		const { viewTemplateMode, ...cleanedData } = data

		const virtualHostData: VirtualHost = {
			$typeName: 'common.v1.VirtualHost',
			domains: cleanedData.virtualHostDomains || []
		}

		const baseVSData = {
			...cleanedData,
			virtualHost: virtualHostData,
			templateOptions: cleanedData.templateOptions?.some(option => option.field !== '' || option.modifier !== 0)
				? cleanedData.templateOptions.map(option => ({
						...option,
						$typeName: 'virtual_service_template.v1.TemplateOption' as const
					}))
				: [],
			accessLogConfig: cleanedData.accessLogConfigUid
				? { case: 'accessLogConfigUid' as const, value: cleanedData.accessLogConfigUid }
				: { case: undefined }
		}

		if (isCreate) {
			const createVSData: CreateVirtualServiceRequest = {
				...baseVSData,
				$typeName: 'virtual_service.v1.CreateVirtualServiceRequest' as const
			}

			// console.log('data for create', createVSData)
			await createVirtualService(createVSData)
			navigate(`/accessGroups/${groupId}/virtualServices`, {
				state: {
					successMessage: `Virtual Service ${cleanedData.name.toUpperCase()} created successfully`
				}
			})
		}
		if (!isCreate && virtualServiceInfo) {
			const { name, ...baseVSDataWithoutName } = baseVSData
			const updateVSData: UpdateVirtualServiceRequest = {
				...baseVSDataWithoutName,
				uid: virtualServiceInfo?.uid,
				$typeName: 'virtual_service.v1.UpdateVirtualServiceRequest' as const
			}

			// console.log('data for Update', updateVSData)
			await updateVS(updateVSData)
			resetQueryUpdateVs()
			navigate(`/accessGroups/${groupId}/virtualServices`, {
				state: {
					successMessage: `Virtual Service ${cleanedData.name.toUpperCase()} update successfully`
				}
			})
		}

		await refetch()
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
			<Box className='vsForm' sx={{ ...vsForm }}>
				<Tabs
					orientation='vertical'
					value={tabIndex}
					onChange={handleChangeTabIndex}
					aria-label='formTabMEnu'
					sx={{ ...tabsStyle }}
				>
					<Tab label='General' {...a11yProps(0, 'vertical')} />
					<Tab label='Domains' {...a11yProps(1, 'vertical')} />
					<Tab label='Settings' {...a11yProps(2, 'vertical')} />
					<Tab label='Template' {...a11yProps(3, 'vertical')} />
				</Tabs>
				<Box className='vsFormWrapper' sx={{ ...vsFormWrapper }}>
					<Box display='flex' className='vsColumnWrapper' gap={1.5} height='100%'>
						<Box className='vsFormLeftColumn' sx={{ ...vsFormLeftColumn }}>
							<Box className='boxForm' sx={{ boxForm }}>
								<CustomTabPanel value={tabIndex} index={0} variant={'vertical'}>
									<GeneralTabVs
										register={register}
										control={control}
										errors={errors}
										isEdit={!isCreate}
									/>
								</CustomTabPanel>

								<CustomTabPanel value={tabIndex} index={1} variant={'vertical'}>
									<VirtualHostDomains
										control={control}
										setValue={setValue}
										errors={errors}
										setError={setError}
										clearErrors={clearErrors}
										watch={watch}
									/>
								</CustomTabPanel>

								<CustomTabPanel value={tabIndex} index={2} variant={'vertical'}>
									<SettingsTabVs control={control} setValue={setValue} errors={errors} />
								</CustomTabPanel>

								<CustomTabPanel value={tabIndex} index={3} variant={'vertical'}>
									<TemplateOptionsFormVs
										register={register}
										control={control}
										errors={errors}
										getValues={getValues}
										clearErrors={clearErrors}
									/>
								</CustomTabPanel>
							</Box>

							<ActionButtonsVs
								isCreateMode={isCreate}
								isEditable={isCreate ? true : !!virtualServiceInfo?.isEditable}
								isFetchingCreateVs={isFetchingCreateVs}
								isFetchingUpdateVs={isFetchingUpdateVs}
								handleResetForm={handleResetForm}
							/>
						</Box>
						<Divider orientation='vertical' flexItem sx={{ height: '100%' }} />
						<CodeBlockVs
							rawDataTemplate={rawData?.raw}
							rawDataPreview={virtualServiceInfo?.raw}
							control={control}
							isLoadingFillTemplate={isLoadingFillTemplate}
							isCreateMode={isCreate}
							setValue={setValue}
						/>
					</Box>
				</Box>
			</Box>

			<ErrorSnackBarVs
				errors={errors}
				isFormReady={isFormReady}
				errorCreateVs={errorCreateVs}
				errorUpdateVs={errorUpdateVs}
				errorFillTemplate={errorFillTemplate}
				isSubmitting={isSubmitting}
			/>
		</form>
	)
}
