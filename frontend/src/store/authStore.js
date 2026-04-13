import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      // Synchronous check prevents PrivateRoute from flashing the login screen on hard reloads
      isAuthenticated: !!localStorage.getItem('access_token'),
      isLoading: false,
      accessToken: localStorage.getItem('access_token'),

      initializeAuth: () => {
        const token = get().accessToken
        if (token) get().fetchProfile()
      },

      // Authenticates via DRF SimpleJWT and stores the token pair securely in local storage
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login/', { email, password })
          const { access, refresh, user } = response.data
          
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          
          set({ user, accessToken: access, isAuthenticated: true, isLoading: false })
          toast.success('System access granted.')
          return true
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.detail || 'Authentication failed')
          return false
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          await api.post('/auth/register/', userData)
          set({ isLoading: false })
          toast.success('Registration successful. Please initialize session.')
          return true
        } catch (error) {
          set({ isLoading: false })
          // DRF often returns validation errors as arrays keyed by the field name
          toast.error(error.response?.data?.email?.[0] || 'Registration failed')
          return false
        }
      },

      fetchProfile: async () => {
        try {
          const response = await api.get('/auth/profile/')
          set({ user: response.data })
        } catch (error) {
          // Silent catch: Axios interceptor will handle token expiration and redirects
        }
      },

      updateProfile: async (data) => {
        try {
          const response = await api.patch('/auth/profile/', data)
          set({ user: response.data })
          toast.success('Profile updated successfully')
        } catch (error) {
          toast.error('Failed to update profile')
        }
      },

      // Clears local state and tokens to fully terminate the user session
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
        toast.success('Session terminated.')
      },

      // Called automatically by the axios interceptor when a 401 response is detected
      refreshToken: async () => {
        try {
          const refresh = localStorage.getItem('refresh_token')
          if (!refresh) throw new Error('No refresh token available')
          
          const response = await api.post('/auth/refresh/', { refresh })
          const { access } = response.data
          
          localStorage.setItem('access_token', access)
          set({ accessToken: access })
          return access
        } catch (error) {
          get().logout()
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      // Prevents JWTs from syncing to Zustand storage to avoid state conflicts
      partialize: (state) => ({ user: state.user }),
    }
  )
)