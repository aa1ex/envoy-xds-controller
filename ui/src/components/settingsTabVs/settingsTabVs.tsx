import React from 'react'
import { Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { SelectFormVs } from '../selectFormVs/selectFormVs.tsx'
import { DNdSelectFormVs } from '../dNdSelectFormVs/dNdSelectFormVs.tsx'
import { RemoteAddrFormVs } from '../remoteAddrFormVS/remoteAddrFormVS.tsx'
import { useAccessLogsVs, useHttpFilterVs, useRouteVs } from '../../api/grpc/hooks/useVirtualService.ts'
import Box from '@mui/material/Box'
import { styleBox } from './style.ts'

interface ISettingsTabVsProps {
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	watch: UseFormWatch<IVirtualServiceForm>
	isDisabledEdit: boolean
}

export const SettingsTabVs: React.FC<ISettingsTabVsProps> = ({ control, setValue, errors, watch, isDisabledEdit }) => {
	const { data: accessLogs, isFetching: isFetchingAccessLogs, isError: isErrorAccessLogs } = useAccessLogsVs()
	const { data: httpFilters, isFetching: isFetchingHttpFilters, isError: isErrorHttpFilters } = useHttpFilterVs()
	const { data: routes, isFetching: isFetchingRoutes, isError: isErrorRoutes } = useRouteVs()

	return (
		<Box sx={{ ...styleBox }} overflow={'auto'}>
			<SelectFormVs
				nameField={'accessLogConfigUid'}
				data={accessLogs}
				control={control}
				errors={errors}
				isErrorFetch={isErrorAccessLogs}
				isFetching={isFetchingAccessLogs}
				isDisabledEdit={isDisabledEdit}
			/>
			<DNdSelectFormVs
				nameField={'additionalHttpFilterUids'}
				data={httpFilters}
				control={control}
				setValue={setValue}
				watch={watch}
				errors={errors}
				isErrorFetch={isErrorHttpFilters}
				isFetching={isFetchingHttpFilters}
				isDisabledEdit={isDisabledEdit}
			/>
			<DNdSelectFormVs
				nameField={'additionalRouteUids'}
				data={routes}
				control={control}
				setValue={setValue}
				watch={watch}
				errors={errors}
				isErrorFetch={isErrorRoutes}
				isFetching={isFetchingRoutes}
				isDisabledEdit={isDisabledEdit}
			/>
			<RemoteAddrFormVs
				nameField={'useRemoteAddress'}
				control={control}
				errors={errors}
				isDisabledEdit={isDisabledEdit}
			/>
		</Box>
	)
}
