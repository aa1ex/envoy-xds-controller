import React from 'react'
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { IVirtualServiceForm } from '../virtualServiceForm/types.ts'
import { TextFieldFormVs } from '../textFieldFormVs/textFieldFormVs.tsx'
import { SelectNodeVs } from '../selectNodeVs/selectNodeVs.tsx'
import { SelectFormVs } from '../selectFormVs/selectFormVs.tsx'
import {
	useAccessGroupsVs,
	useListenerVs,
	useNodeListVs,
	useTemplatesVs
} from '../../api/grpc/hooks/useVirtualService.ts'

interface IGeneralTabVsProps {
	register: UseFormRegister<IVirtualServiceForm>
	control: Control<IVirtualServiceForm>
	errors: FieldErrors<IVirtualServiceForm>
	isEdit?: boolean | undefined
	isDisabledEdit: boolean
}

export const GeneralTabVs: React.FC<IGeneralTabVsProps> = ({ register, control, errors, isEdit, isDisabledEdit }) => {
	const { data: nodeList, isFetching: isFetchingNodeList, isError: isErrorNodeList } = useNodeListVs()
	const { data: accessGroups, isFetching: isFetchingAccessGroups, isError: isErrorAccessGroups } = useAccessGroupsVs()
	const { data: templates, isFetching: isFetchingTemplates, isError: isErrorTemplates } = useTemplatesVs()
	const { data: listeners, isFetching: isFetchingListeners, isError: isErrorListeners } = useListenerVs()

	return (
		<>
			<TextFieldFormVs register={register} nameField='name' errors={errors} isDisabled={isEdit} />
			<SelectNodeVs
				nameField={'nodeIds'}
				dataNodes={nodeList}
				control={control}
				errors={errors}
				isFetching={isFetchingNodeList}
				isErrorFetch={isErrorNodeList}
			/>
			<SelectFormVs
				nameField={'accessGroup'}
				data={accessGroups}
				control={control}
				errors={errors}
				isFetching={isFetchingAccessGroups}
				isErrorFetch={isErrorAccessGroups}
				isDisabledEdit={isDisabledEdit}
			/>
			<SelectFormVs
				nameField={'templateUid'}
				data={templates}
				control={control}
				errors={errors}
				isFetching={isFetchingTemplates}
				isErrorFetch={isErrorTemplates}
				isDisabledEdit={isDisabledEdit}
			/>
			<SelectFormVs
				nameField={'listenerUid'}
				data={listeners}
				control={control}
				errors={errors}
				isFetching={isFetchingListeners}
				isErrorFetch={isErrorListeners}
				isDisabledEdit={isDisabledEdit}
			/>
		</>
	)
}
