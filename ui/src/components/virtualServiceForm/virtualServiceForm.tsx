import React, { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { SubmitHandler, useForm } from 'react-hook-form'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { debounce } from '@mui/material'

import {
	CreateVirtualServiceRequest,
	UpdateVirtualServiceRequest
} from '../../gen/virtual_service/v1/virtual_service_pb'
import { ResourceRef, VirtualHost } from '../../gen/common/v1/common_pb.ts'

import { useCreateVs, useFillTemplate, useListVs, useUpdateVs } from '../../api/grpc/hooks/useVirtualService.ts'

import { CodeBlockVs } from '../codeBlockVs/codeBlockVs.tsx'
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

export const VirtualServiceForm: React.FC<IVirtualServiceFormProps> = ({ virtualServiceInfo }) => {
	const navigate = useNavigate()
	const { groupId } = useParams()
	const isCreate = useLocation().pathname.split('/').pop() === 'createVs'
	const viewMode = useViewModeStore(state => state.viewMode)
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
		formState: { errors, isSubmitting },
		setValue,
		control,
		setError,
		clearErrors,
		watch,
		getValues,
		reset
	} = useForm<IVirtualServiceForm>({
		mode: 'onChange',
		defaultValues: {
			nodeIds: [],
			virtualHostDomains: [],
			accessGroup: isCreate ? groupId : '',
			additionalHttpFilterUids: [],
			additionalRouteUids: [],
			useRemoteAddress: undefined,
			templateOptions: [{ field: '', modifier: 0 }]
		}
	})
	console.log(errors)
	const { fillTemplate, rawData, isLoadingFillTemplate } = useFillTemplate()

	const transformForm = (formValues: any) => {
		const { nodeIds, virtualHostDomains, templateOptions, accessLogConfigUid, ...rest } = formValues

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
			templateOptions: templateOptions
		}
	}

	useEffect(() => {
		const debouncedFillTemplate = debounce(formValues => {
			void fillTemplate(transformForm(formValues))
		}, 500)

		const subscription = watch((_formValues, { name: changedField }) => {
			const fullForm = getValues()
			const templateUid = fullForm.templateUid
			if (!templateUid) return
			console.log(transformForm(fullForm))
			if (changedField === 'name' || changedField === 'virtualHostDomains') {
				debouncedFillTemplate(fullForm)
			} else {
				void fillTemplate(transformForm(fullForm))
			}
		})

		return () => {
			subscription.unsubscribe()
			debouncedFillTemplate.clear()
		}
	}, [watch, getValues, fillTemplate])

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
			additionalRouteUids: virtualServiceInfo.additionalRoutes?.map(router => router.uid) || []
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
	}

	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		const virtualHostData: VirtualHost = {
			$typeName: 'common.v1.VirtualHost',
			domains: data.virtualHostDomains || []
		}

		const baseVSData = {
			...data,
			virtualHost: virtualHostData,
			templateOptions: data.templateOptions?.some(option => option.field !== '' || option.modifier !== 0)
				? data.templateOptions.map(option => ({
						...option,
						$typeName: 'virtual_service_template.v1.TemplateOption' as const
					}))
				: [],
			accessLogConfig: data.accessLogConfigUid
				? { case: 'accessLogConfigUid' as const, value: data.accessLogConfigUid }
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
					successMessage: `Virtual Service ${data.name.toUpperCase()} created successfully`
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
					successMessage: `Virtual Service ${data.name.toUpperCase()} update successfully`
				}
			})
		}
		// navigate(`/accessGroups/${groupId}/virtualServices`)
		await refetch()
	}
	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
				<Box display='flex' height='100%' overflow='auto' flexGrow={1} className='vsForm'>
					<Tabs
						orientation='vertical'
						value={tabIndex}
						onChange={handleChangeTabIndex}
						aria-label='formTabMEnu'
						sx={{ borderRight: 1, borderColor: 'divider' }}
					>
						<Tab label='General' {...a11yProps(0, 'vertical')} />
						<Tab label='Domains' {...a11yProps(1, 'vertical')} />
						<Tab label='Settings' {...a11yProps(2, 'vertical')} />
						<Tab label='Template' {...a11yProps(3, 'vertical')} />
					</Tabs>
					<Box
						display='flex'
						flexDirection='column'
						flexGrow={1}
						justifyContent='space-between'
						className='vsFormWrapper'
					>
						<Box display='flex' className='vsColumnWrapper' gap={1.5} height='100%'>
							<Box
								display='flex'
								className='vsLeftColumn'
								width='60%'
								height='100%'
								flexDirection='column'
								justifyContent='space-between'
							>
								<Box
									className='boxForm'
									display='flex'
									flexDirection='column'
									height='90%'
									flexGrow={1}
								>
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
										<SettingsTabVs
											control={control}
											setValue={setValue}
											errors={errors}
											watch={watch}
										/>
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
								<Box display='flex' justifyContent='space-between'>
									<Box
										display='flex'
										alignItems='center'
										justifyContent='flex-start'
										gap={3}
										marginX={2}
									>
										<Button
											variant='outlined'
											loading={isFetchingCreateVs || isFetchingUpdateVs}
											disabled={virtualServiceInfo?.isEditable === false || viewMode === 'read'}
											onClick={() => navigate(-1)}
										>
											Back to Table
										</Button>
										<Button
											variant='contained'
											type='submit'
											loading={isFetchingCreateVs || isFetchingUpdateVs}
											disabled={virtualServiceInfo?.isEditable === false || viewMode === 'read'}
										>
											{isCreate
												? 'Create Virtual Service'
												: viewMode === 'read'
													? 'Read-Only Virtual Service'
													: 'Update Virtual Service'}
										</Button>
										<Button
											variant='outlined'
											color='warning'
											loading={isFetchingCreateVs || isFetchingUpdateVs}
											disabled={virtualServiceInfo?.isEditable === false || viewMode === 'read'}
											onClick={handleResetForm}
										>
											Reset form
										</Button>
									</Box>

									{viewMode === 'read' && (
										<Button variant='outlined' color='warning' onClick={() => setViewMode('edit')}>
											Enable Edit Form
										</Button>
									)}
								</Box>
							</Box>

							<Divider orientation='vertical' flexItem sx={{ height: '100%' }} />
							<Box
								display='flex'
								className='vsLeftLeft'
								width='40%'
								p={1}
								justifyContent='center'
								alignItems='center'
								minHeight={200}
							>
								{!watch('templateUid') ? (
									<Typography align='center' variant='h3'>
										To display, select Template in the form
									</Typography>
								) : isLoadingFillTemplate ? (
									<CircularProgress />
								) : rawData ? (
									<Fade in timeout={300}>
										<div style={{ width: '100%', height: '100%' }}>
											<CodeBlockVs raw={rawData} />
										</div>
									</Fade>
								) : null}
							</Box>
						</Box>
					</Box>
				</Box>
				<ErrorSnackBarVs
					errors={errors}
					errorCreateVs={errorCreateVs}
					errorUpdateVs={errorUpdateVs}
					isSubmitted={isSubmitting}
				/>
			</form>
		</>
	)
}
