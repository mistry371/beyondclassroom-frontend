import { createSlice } from '@reduxjs/toolkit'
import { invalidateCache } from '@/lib/apiCache'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Clear any promoter session too so a shared device is fully signed out.
        localStorage.removeItem('promoterToken')
        localStorage.removeItem('promoter')
        invalidateCache('')
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    // Merge fresh user fields (e.g. purchasedCourses after a purchase) and persist
    updateUser: (state, action) => {
      state.user = { ...(state.user || {}), ...action.payload }
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    // Action to restore state from localStorage
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const token = localStorage.getItem('token')
          const user = localStorage.getItem('user')
          if (token && user) {
            state.user = JSON.parse(user)
            state.token = token
            state.isAuthenticated = true
          }
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    },
  },
})

export const { setCredentials, logout, setLoading, restoreAuth, updateUser } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectToken = (state) => state.auth.token
