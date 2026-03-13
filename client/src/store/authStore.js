import { create } from 'zustand'

const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isLoggedIn: false,

  setAccessToken: (token) => set({ accessToken: token, isLoggedIn: !!token }),

  setUser: (user) => set({ user }),

  logout: () => set({ accessToken: null, user: null, isLoggedIn: false }),
}))

export default useAuthStore