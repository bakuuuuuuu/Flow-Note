import { create } from 'zustand'

const useSidebarStore = create((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (val) => set({ isOpen: val }),
}))

export default useSidebarStore