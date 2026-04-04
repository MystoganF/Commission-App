import { useMemo } from 'react'
import api from '../api/axios' // Adjust this path to where your axios instance lives

/**
 * Decodes the stored JWT and returns user info.
 * No external deps — manual base64 decode.
 */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

/**
 * Authentication API Service
 * Handles the actual network requests to your Spring Boot /api/auth endpoints
 */
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  }
}

/**
 * The useAuth Hook
 * Manages user state, roles, and provides an easy logout mechanism
 */
export function useAuth() {
  const token = localStorage.getItem('token')

  const user = useMemo(() => {
    if (!token) return null
    const decoded = decodeToken(token)
    if (!decoded) return null

    // Your JWT subject is email; role is a custom claim
    return {
      email: decoded.sub,
      role:  decoded.role,   // 'ADMIN' | 'CLIENT'
      exp:   decoded.exp,
    }
  }, [token])

  const isExpired = user ? Date.now() / 1000 > user.exp : true
  const isAdmin   = user?.role === 'ADMIN' && !isExpired
  const isClient  = user?.role === 'CLIENT' && !isExpired

  const logout = () => {
    localStorage.removeItem('token')
    // Redirects to login or home page and clears React state
    window.location.href = '/login' 
  }

  return { 
    user, 
    isAdmin, 
    isClient, 
    isExpired, 
    logout,
    login: authService.login,       // Expose login directly through the hook if desired
    register: authService.register  // Expose register directly through the hook if desired
  }
}