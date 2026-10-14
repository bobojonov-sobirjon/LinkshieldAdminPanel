import axios from 'axios'
import { getLocale, t } from '@/i18n'

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
        window.location.href = `${import.meta.env.BASE_URL}login`.replace(/\/{2,}/g, '/')
      }
    }
    return Promise.reject(error)
  },
)

/** Pick eng/rus from LocalizedText or string detail. */
export function localizeError(error) {
  const detail = error?.response?.data?.detail
  const locale = getLocale() === 'ru' ? 'rus' : 'eng'
  if (detail && typeof detail === 'object') {
    return detail[locale] || detail.eng || detail.rus || JSON.stringify(detail)
  }
  if (typeof detail === 'string') return detail
  return error?.message || t('common.error')
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
  return data.data || data.items || []
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

export async function updateAdsSlot(id, payload) {
  const { data } = await api.patch(`/ads/slots/${id}/manage`, payload)
  return data
}

export async function uploadAdsSlotMedia(id, { file, targetCountry, hours }) {
  const form = new FormData()
  form.append('image', file)
  if (targetCountry) form.append('target_country', targetCountry)
  if (hours) form.append('hours', String(hours))
  const { data } = await api.post(`/ads/slots/${id}/media`, form)
  return data
}

export async function fetchStoreLinks() {
  const { data } = await api.get('/admin/store-links')
  return data
}

export async function sendStoreLink(platform) {
  const { data } = await api.post('/admin/store-links/send', { platform })
  return data
}

export async function clearAdsSlot(id) {
  const { data } = await api.post(`/ads/slots/${id}/clear`)
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

export async function fetchWebsite(id) {
  const { data } = await api.get(`/websites/${id}`)
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

export async function moderateAdminReview(id, status) {
  const { data } = await api.patch(`/admin/reviews/${id}/moderate`, { status })
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

export async function fetchAdminSettings() {
  const { data } = await api.get('/admin/settings')
  return data
}

export async function updateAdminSetting(key, value) {
  const { data } = await api.patch(`/admin/settings/${key}`, { value })
  return data
}

export async function fetchAdminWebsites(params = {}) {
  const { data } = await api.get('/admin/websites', { params })
  return data
}

export async function purchaseOwnership(websiteId) {
  const { data } = await api.post(`/websites/${websiteId}/ownership`)
  return data
}

export async function fetchPayment(paymentId) {
  const { data } = await api.get(`/payments/${paymentId}`)
  return data
}

export async function fetchMyPayments(params = {}) {
  const { data } = await api.get('/payments/mine', { params })
  return data
}

export async function confirmPaymentTxid(paymentId, txid, network = null) {
  const body = { txid }
  if (network) body.network = network
  const { data } = await api.post(`/payments/${paymentId}/confirm-txid`, body)
  return data
}

export async function fakePaymentSuccess(paymentId) {
  const { data } = await api.post(`/payments/${paymentId}/fake-success`)
  return data
}
