import { create } from 'zustand'

const useThemeStore = create((set) => ({
  isDark: false,

  toggleTheme: () => set((state) => {
    const next = !state.isDark
    // html 태그에 dark 클래스 토글 (Tailwind dark variant용)
    document.documentElement.classList.toggle('dark', next)
    return { isDark: next }
  }),

  initTheme: () => {
    // 나중에 유저 설정(DB)에서 불러올 때 사용
    const saved = localStorage.getItem('theme') === 'dark'
    document.documentElement.classList.toggle('dark', saved)
    set({ isDark: saved })
  }
}))

export default useThemeStore