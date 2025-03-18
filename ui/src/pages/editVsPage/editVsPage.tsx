import React from 'react'
import { useParams } from 'react-router-dom'

interface IEditVsPageProps {
	title?: string
}

const EditVsPage: React.FC<IEditVsPageProps> = ({ title }) => {
	const { uid } = useParams()
	return (
		<>
			{title}
			editPage {uid}
		</>
	)
}

export default EditVsPage
