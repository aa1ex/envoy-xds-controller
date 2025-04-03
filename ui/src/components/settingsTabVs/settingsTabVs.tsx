import React from 'react'
import {
	Control,
	FieldErrors,
	UseFormClearErrors,
	UseFormSetError,
	UseFormSetValue,
	UseFormWatch
} from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { SelectFormVs } from '../selectFormVs/selectFormVs.tsx'
import { DNdSelectFormVs } from '../dNdSelectFormVs/dNdSelectFormVs.tsx'
import { RemoteAddrFormVs } from '../remoteAddrFormVS/remoteAddrFormVS.tsx'
import { useAccessLogsVs, useHttpFilterVs, useRouteVs } from '../../api/grpc/hooks/useVirtualService.ts'

interface ISettingsTabVsProps {
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	watch: UseFormWatch<IVirtualServiceForm>
	setError: UseFormSetError<IVirtualServiceForm>
	clearErrors: UseFormClearErrors<IVirtualServiceForm>
}

export const SettingsTabVs: React.FC<ISettingsTabVsProps> = ({
	control,
	setValue,
	errors,
	watch,
	setError,
	clearErrors
}) => {
	const { data: accessLogs, isFetching: isFetchingAccessLogs, isError: isErrorAccessLogs } = useAccessLogsVs()
	const { data: httpFilters, isFetching: isFetchingHttpFilters, isError: isErrorHttpFilters } = useHttpFilterVs()
	const { data: routes, isFetching: isFetchingRoutes, isError: isErrorRoutes } = useRouteVs()

	return (
		<>
			<SelectFormVs
				nameField={'accessLogConfigUid'}
				data={accessLogs}
				control={control}
				errors={errors}
				isErrorFetch={isErrorAccessLogs}
				isFetching={isFetchingAccessLogs}
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
			/>
			<RemoteAddrFormVs
				nameField={'useRemoteAddress'}
				control={control}
				errors={errors}
				setError={setError}
				clearErrors={clearErrors}
				setValue={setValue}
			/>
		</>
	)
}
