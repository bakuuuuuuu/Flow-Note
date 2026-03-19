import { create } from 'zustand'

const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isLoggedIn: false,
  justLoggedIn: false,

  setAccessToken: (token) => set({ accessToken: token, isLoggedIn: !!token, justLoggedIn: !!token }),

  setUser: (user) => set({ user }),

  setJustLoggedIn: (val) => set({ justLoggedIn: val }), 

  logout: () => set({ accessToken: null, user: null, isLoggedIn: false, justLoggedIn: false }),
}))

export default useAuthStore