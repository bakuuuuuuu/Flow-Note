import { create } from 'zustand'

const savedDark = localStorage.getItem('theme') === 'dark'
document.documentElement.classList.toggle('dark', savedDark)

const useThemeStore = create((set) => ({
  isDark: savedDark,

  toggleTheme: () => set((state) => {
    const next = !state.isDark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light') 
    return { isDark: next }
  }),

  initTheme: () => {
    const saved = localStorage.getItem('theme') === 'dark'
    document.documentElement.classList.toggle('dark', saved)
    set({ isDark: saved })
  }
}))

export default useThemeStore