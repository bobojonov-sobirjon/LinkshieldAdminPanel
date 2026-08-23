import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchMe, phoneLogin } from '@/api/client'

const ADMIN_ROLES = new Set(['admin', 'moderator'])

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('ls_admin_access') || '')
  const refreshToken = ref(localStorage.getItem('ls_admin_refresh') || '')
  const user = ref(null)
  const bootstrapped = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const isStaff = computed(() => user.value && ADMIN_ROLES.has(user.value.role))

  function persistTokens(tokens) {
    accessToken.value = tokens.access_token
    refreshToken.value = tokens.refresh_token
    localStorage.setItem('ls_admin_access', tokens.access_token)
    localStorage.setItem('ls_admin_refresh', tokens.refresh_token)
  }

  function clearSession() {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
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
    user.value = me
    return me
  }

  async function bootstrap() {
    if (!accessToken.value) {
      bootstrapped.value = true
      return
    }
    try {
      const me = await fetchMe()
      if (!ADMIN_ROLES.has(me.role)) {
        clearSession()
      } else {
        user.value = me
      }
    } catch {
      clearSession()
    } finally {
      bootstrapped.value = true
    }
  }

  function logout() {
    clearSession()
  }

  return {
    accessToken,
    refreshToken,
    user,
    bootstrapped,
    isAuthenticated,
    isStaff,
    login,
    bootstrap,
    logout,
  }
})
