import React from 'react'
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { DNdSelectFormVs } from '../dNdSelectFormVs'
import { RemoteAddrFormVs } from '../remoteAddrFormVS/remoteAddrFormVS.tsx'
import { useAccessLogsVs, useHttpFilterVs, useRouteVs } from '../../api/grpc/hooks/useVirtualService.ts'
import { useParams } from 'react-router-dom'
import { AutocompleteVs } from '../autocompleteVs'

interface ISettingsTabVsProps {
	control: Control<IVirtualServiceForm>
	setValue: UseFormSetValue<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
}

export const SettingsTabVs: React.FC<ISettingsTabVsProps> = ({ control, setValue, errors }) => {
	const { groupId: group } = useParams()
	const { data: accessLogs, isFetching: isFetchingAccessLogs, isError: isErrorAccessLogs } = useAccessLogsVs(group)
	const { data: httpFilters, isFetching: isFetchingHttpFilters, isError: isErrorHttpFilters } = useHttpFilterVs(group)
	const { data: routes, isFetching: isFetchingRoutes, isError: isErrorRoutes } = useRouteVs(group)

	return (
		<>
			<AutocompleteVs
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
				errors={errors}
				isErrorFetch={isErrorHttpFilters}
				isFetching={isFetchingHttpFilters}
			/>
			<DNdSelectFormVs
				nameField={'additionalRouteUids'}
				data={routes}
				control={control}
				setValue={setValue}
				errors={errors}
				isErrorFetch={isErrorRoutes}
				isFetching={isFetchingRoutes}
			/>
			<RemoteAddrFormVs nameField={'useRemoteAddress'} control={control} errors={errors} />
		</>
	)
}
