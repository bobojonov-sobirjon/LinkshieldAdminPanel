import axios from 'axios'
import { i18n } from '@/i18n'

const baseURL = import.meta.env.VITE_API_BASE || '/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ls_admin_access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('ls_admin_access')
      localStorage.removeItem('ls_admin_refresh')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/** Pick eng/rus from LocalizedText or string detail. */
export function localizeError(error) {
  const detail = error?.response?.data?.detail
  const locale = i18n.global.locale.value === 'ru' ? 'rus' : 'eng'
  if (detail && typeof detail === 'object') {
    return detail[locale] || detail.eng || detail.rus || JSON.stringify(detail)
  }
  if (typeof detail === 'string') return detail
  return error?.message || i18n.global.t('common.error')
}

export async function phoneLogin(phone, password) {
  const { data } = await api.post('/auth/phone/login', { phone, password })
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/profile/me')
  return data
}

export async function fetchFaqAdmin() {
  const { data } = await api.get('/faq/admin/all')
  return data.items || []
}

export async function createFaq(payload) {
  const { data } = await api.post('/faq/admin', payload)
  return data
}

export async function updateFaq(id, payload) {
  const { data } = await api.patch(`/faq/admin/${id}`, payload)
  return data
}

export async function deleteFaq(id) {
  const { data } = await api.delete(`/faq/admin/${id}`)
  return data
}

export async function fetchAdsSlots() {
  const { data } = await api.get('/ads/slots')
  return data
}

export async function fetchGeoStats() {
  const { data } = await api.get('/geo/stats')
  return data
}

export async function fetchAdminUsers(params = {}) {
  const { data } = await api.get('/admin/users', { params })
  return data
}

export async function updateAdminUser(id, payload) {
  const { data } = await api.patch(`/admin/users/${id}`, payload)
  return data
}

export async function fetchAdminReviews(params = {}) {
  const { data } = await api.get('/admin/reviews', { params })
  return data
}

export async function deleteAdminReview(id) {
  const { data } = await api.delete(`/admin/reviews/${id}`)
  return data
}

export async function fetchAdminPayments(params = {}) {
  const { data } = await api.get('/admin/payments', { params })
  return data
}

export async function updateAdminPayment(id, payload) {
  const { data } = await api.patch(`/admin/payments/${id}`, payload)
  return data
}

export async function fetchAdminLinks(params = {}) {
  const { data } = await api.get('/admin/links', { params })
  return data
}

export async function updateAdminLink(id, payload) {
  const { data } = await api.patch(`/admin/links/${id}`, payload)
  return data
}

export async function fetchAdminOwnerships(params = {}) {
  const { data } = await api.get('/admin/ownerships', { params })
  return data
}

export async function updateAdminOwnership(id, payload) {
  const { data } = await api.patch(`/admin/ownerships/${id}`, payload)
  return data
}
