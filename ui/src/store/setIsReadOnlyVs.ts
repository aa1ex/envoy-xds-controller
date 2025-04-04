import { create } from 'zustand'

interface ISetIsReadOnlyVsStore {
	isReadOnlyVs: boolean
	setIsReadOnly: (isReadOnly: boolean) => void
}

export const useSetIsReadOnlyVsStore = create<ISetIsReadOnlyVsStore>(set => ({
	isReadOnlyVs: false,
	setIsReadOnly: isReadOnly => set({ isReadOnlyVs: isReadOnly })
}))
