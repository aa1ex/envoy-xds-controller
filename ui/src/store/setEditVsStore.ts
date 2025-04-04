import { create } from 'zustand'

interface ISetEditVsStore {
	isEditVs: boolean
	setIsEditVs: (isEditDomain: boolean) => void
}

export const useSetEditVsStore = create<ISetEditVsStore>(set => ({
	isEditVs: false,
	setIsEditVs: isEditDomain => set({ isEditVs: isEditDomain })
}))
