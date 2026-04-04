import { useMemo } from 'react'

/**
 * Decodes the stored JWT and returns user info.
 * No external deps — manual base64 decode.
 */
function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

export function useAuth() {
  const token = localStorage.getItem('token')

  const user = useMemo(() => {
    if (!token) return null
    const decoded = decodeToken(token)
    if (!decoded) return null

    // Our JWT subject is email; role is a custom claim
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
    window.location.href = '/'
  }

  return { user, isAdmin, isClient, isExpired, logout }
}