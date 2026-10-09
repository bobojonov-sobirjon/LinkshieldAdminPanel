import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, phoneLogin } from '@/api/client'

const ADMIN_ROLES = new Set(['admin', 'moderator'])
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ls_admin_access') || '')
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  function persistTokens(tokens) {
    setAccessToken(tokens.access_token)
    localStorage.setItem('ls_admin_access', tokens.access_token)
    localStorage.setItem('ls_admin_refresh', tokens.refresh_token)
  }

  function clearSession() {
    setAccessToken('')
    setUser(null)
    localStorage.removeItem('ls_admin_access')
    localStorage.removeItem('ls_admin_refresh')
  }

  async function login(phone, password) {
    const tokens = await phoneLogin(phone, password)
    persistTokens(tokens)
    const me = await fetchMe()
    if (!ADMIN_ROLES.has(me.role)) {
      clearSession()
      const err = new Error('FORBIDDEN_ROLE')
      err.code = 'FORBIDDEN_ROLE'
      throw err
    }
    setUser(me)
    return me
  }

  function logout() {
    clearSession()
  }

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      if (!accessToken) {
        if (!cancelled) setReady(true)
        return
      }
      try {
        const me = await fetchMe()
        if (cancelled) return
        if (!ADMIN_ROLES.has(me.role)) clearSession()
        else setUser(me)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
    // Session is restored once from the token captured on first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      isStaff: Boolean(user && ADMIN_ROLES.has(user.role)),
      login,
      logout,
    }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
