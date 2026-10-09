import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { localizeError } from '@/api/client'
import { useAuth } from '@/auth'
import { Button, Field, controlClass } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

export default function LoginPage() {
  const { t, locale, setLocale } = useI18n()
  const { user, ready, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-[#f4f6f9] text-sm text-gray-500">LinkShield</div>
  }
  if (user) return <Navigate to="/" replace />

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(phone.trim(), password)
      const redirect = location.state?.from?.pathname || '/'
      navigate(redirect, { replace: true })
    } catch (e) {
      setError(e?.code === 'FORBIDDEN_ROLE' ? t('login.forbidden') : localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f6f9] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="h-12 w-12 object-contain" />
            <div>
              <div className="text-sm font-extrabold tracking-[0.14em] text-gray-900">LINKSHIELD</div>
              <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Admin</div>
            </div>
          </div>
          <div className="flex rounded-lg bg-gray-100 p-1">
            {['en', 'ru'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={`rounded-md px-2 py-1 text-xs font-semibold uppercase ${
                  locale === code ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">{t('login.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('login.subtitle')}</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label={t('login.phone')}>
            <input
              className={controlClass}
              type="tel"
              autoComplete="username"
              placeholder={t('login.hint')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </Field>
          <Field label={t('login.password')}>
            <input
              className={controlClass}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          ) : null}
          <Button className="h-11 w-full" type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('login.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
