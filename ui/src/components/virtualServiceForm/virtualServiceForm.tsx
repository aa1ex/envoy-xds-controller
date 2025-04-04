import React, { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import {
	CreateVirtualServiceRequest,
	UpdateVirtualServiceRequest,
	VirtualHost
} from '../../gen/virtual_service/v1/virtual_service_pb'
import { ResourceRef } from '../../gen/common/v1/common_pb.ts'

import { useCreateVs, useListVs, useUpdateVs } from '../../api/grpc/hooks/useVirtualService.ts'
import { useNavigate } from 'react-router-dom'
import { IVirtualServiceForm, IVirtualServiceFormProps } from './types.ts'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { a11yProps } from '../customTabPanel/style.ts'
import CustomTabPanel from '../customTabPanel/CustomTabPanel.tsx'
import Divider from '@mui/material/Divider'
import { TemplateOptionsFormVs } from '../templateOptionsFormVs/templateOptionsFormVs.tsx'
import { useSetEditVsStore } from '../../store/setEditVsStore.ts'
import { GeneralTabVs } from '../generalTabVS/generalTabVS.tsx'
import { SettingsTabVs } from '../settingsTabVs/settingsTabVs.tsx'
import { VirtualHostDomains } from '../virtualHostDomains/virtualHostDomains.tsx'
import { useSetIsReadOnlyVsStore } from '../../store/setIsReadOnlyVs.ts'

export const VirtualServiceForm: React.FC<IVirtualServiceFormProps> = ({ virtualServiceInfo, isEdit }) => {
	const navigate = useNavigate()
	const isEditVs = useSetEditVsStore(state => state.isEditVs)
	const setEditVS = useSetEditVsStore(state => state.setIsEditVs)
	const isReadOnly = useSetIsReadOnlyVsStore(state => state.isReadOnlyVs)

	const { refetch } = useListVs(false)
	const { createVirtualService, isFetchingCreateVs } = useCreateVs()
	const { updateVS, isFetchingUpdateVs } = useUpdateVs()

	const {
		register,
		handleSubmit,
		formState: { errors },
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
			additionalHttpFilterUids: [],
			additionalRouteUids: [],
			useRemoteAddress: undefined,
			templateOptions: [{ field: '', modifier: 0 }]
		}
	})

	useEffect(() => {
		if (isEdit && virtualServiceInfo) {
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
		}
	}, [isEdit, virtualServiceInfo, reset])

	const [tabIndex, setTabIndex] = React.useState(0)
	const handleChangeTabIndex = (_e: React.SyntheticEvent, newTabIndex: number) => {
		setTabIndex(newTabIndex)
	}

	//*Для изменения только домена
	useEffect(() => {
		if (isEditVs && isEdit) {
			setTabIndex(1)
			setEditVS(false)
		}
	}, [isEdit, isEditVs, setEditVS])

	const onSubmit: SubmitHandler<IVirtualServiceForm> = async data => {
		const virtualHostData: VirtualHost = {
			$typeName: 'virtual_service.v1.VirtualHost',
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

		if (!isEdit) {
			const createVSData: CreateVirtualServiceRequest = {
				...baseVSData,
				$typeName: 'virtual_service.v1.CreateVirtualServiceRequest' as const
			}

			console.log('data for create', createVSData)
			await createVirtualService(createVSData)
		}
		if (isEdit && virtualServiceInfo) {
			const { name, ...baseVSDataWithoutName } = baseVSData

			const updateVSData: UpdateVirtualServiceRequest = {
				...baseVSDataWithoutName,
				uid: virtualServiceInfo?.uid,
				$typeName: 'virtual_service.v1.UpdateVirtualServiceRequest' as const
			}

			console.log('data for Update', updateVSData)
			await updateVS(updateVSData)
		}
		navigate('/virtualServices')
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
						<Box display='flex' className='vsColumnWrapper' gap={1.5} height='93%'>
							<Box display='flex' className='vsLeftColumn' width='60%'>
								<CustomTabPanel value={tabIndex} index={0} variant={'vertical'}>
									<GeneralTabVs
										register={register}
										control={control}
										errors={errors}
										isEdit={isEdit}
										isDisabledEdit={virtualServiceInfo?.isEditable as boolean}
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
										isDisabledEdit={virtualServiceInfo?.isEditable as boolean}
									/>
								</CustomTabPanel>

								<CustomTabPanel value={tabIndex} index={2} variant={'vertical'}>
									<SettingsTabVs
										control={control}
										setValue={setValue}
										errors={errors}
										watch={watch}
										isDisabledEdit={virtualServiceInfo?.isEditable as boolean}
									/>
								</CustomTabPanel>

								<CustomTabPanel value={tabIndex} index={3} variant={'vertical'}>
									<TemplateOptionsFormVs
										register={register}
										control={control}
										errors={errors}
										getValues={getValues}
										clearErrors={clearErrors}
										isDisabledEdit={virtualServiceInfo?.isEditable as boolean}
									/>
								</CustomTabPanel>
							</Box>
							<Divider orientation='vertical' flexItem sx={{ height: '100%' }} />
							<Box display='flex' className='vsLeftLeft' width='40%' p={1}>
								<Box border='1px solid gray' borderRadius={1} p={2} height='100%' width='100%' mr={1}>
									для наглядности
								</Box>
							</Box>
						</Box>

						<Box display='flex' alignItems='center' justifyContent='center'>
							<Button
								variant='contained'
								type='submit'
								loading={isFetchingCreateVs || isFetchingUpdateVs}
								disabled={virtualServiceInfo?.isEditable === false || isReadOnly}
							>
								{isEdit ? 'Update Virtual Service' : 'Create Virtual Service'}
							</Button>
						</Box>
					</Box>
				</Box>
			</form>
		</>
	)
}
