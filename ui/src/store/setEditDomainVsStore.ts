import { create } from 'zustand'

interface ISetEditDomainVsStore {
	isEditDomain: boolean
	setIsEditDomain: (isEditDomain: boolean) => void
}

export const useSetEditDomainVsStore = create<ISetEditDomainVsStore>(set => ({
	isEditDomain: false,
	setIsEditDomain: isEditDomain => set({ isEditDomain })
}))
