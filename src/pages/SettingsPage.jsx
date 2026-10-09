import { useEffect, useState } from 'react'
import { fetchAdminSettings, localizeError, updateAdminSetting } from '@/api/client'
import { Alert, Button, Card, Field, PageHeader, controlClass } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

function parseMoney(value) {
  if (value == null || value === '') return NaN
  return Number(String(value).trim().replace(',', '.').replace(/[^\d.-]/g, ''))
}

function usdt(value) {
  const n = parseMoney(value)
  if (!Number.isFinite(n) || n < 0.01) return '—'
  return n.toFixed(2)
}

export default function SettingsPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [ownershipPrice, setOwnershipPrice] = useState('150')
  const [ownershipDays, setOwnershipDays] = useState('365')
  const [adPrice, setAdPrice] = useState('10')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminSettings()
      const settings = data.settings || {}
      setOwnershipPrice(settings.ownership_price || '150')
      setOwnershipDays(settings.ownership_duration_days || '365')
      setAdPrice(settings.ad_price_per_day || '10')
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    setSaving(true)
    setError('')
    setFlash('')
    try {
      const ownership = parseMoney(ownershipPrice)
      const ad = parseMoney(adPrice)
      if (!Number.isFinite(ownership) || ownership < 0.01 || !Number.isFinite(ad) || ad < 0.01) {
        throw new Error(t('settings.invalidMoney'))
      }
      const ownershipText = ownership.toFixed(2)
      const adText = ad.toFixed(2)
      setOwnershipPrice(ownershipText)
      setAdPrice(adText)
      const r1 = await updateAdminSetting('ownership_price', ownershipText)
      await updateAdminSetting('ownership_duration_days', String(ownershipDays))
      const r3 = await updateAdminSetting('ad_price_per_day', adText)
      setFlash(t('settings.saved', { ownership: r1.usdt || ownershipText, ad: r3.usdt || adText }))
      await load()
    } catch (e) {
      setError(e?.message && !e.response ? e.message : localizeError(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={<Button variant="plain" disabled={loading} onClick={load}>{t('settings.refresh')}</Button>}
      />
      {error ? <Alert>{error}</Alert> : null}
      {flash ? <Alert kind="ok">{flash}</Alert> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900">{t('settings.ownership')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('settings.ownershipHint')}</p>
          <div className="mt-4 space-y-4">
            <Field label={t('settings.amountUsd')}>
              <div className="relative max-w-xs">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
                <input className={`${controlClass} pl-7`} inputMode="decimal" value={ownershipPrice} onChange={(e) => setOwnershipPrice(e.target.value)} />
              </div>
              <div className="mt-2 text-sm font-semibold text-indigo-700">≈ {usdt(ownershipPrice)} USDT (TRC20)</div>
            </Field>
            <Field label={t('settings.durationDays')}>
              <input className={`${controlClass} max-w-xs`} type="number" min="1" step="1" value={ownershipDays} onChange={(e) => setOwnershipDays(e.target.value)} />
            </Field>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-900">{t('settings.ads')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('settings.adsHint')}</p>
          <div className="mt-4">
            <Field label={t('settings.adPerDay')}>
              <div className="relative max-w-xs">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
                <input className={`${controlClass} pl-7`} inputMode="decimal" value={adPrice} onChange={(e) => setAdPrice(e.target.value)} />
              </div>
              <div className="mt-2 text-sm font-semibold text-indigo-700">≈ {usdt(adPrice)} USDT (TRC20) / day</div>
            </Field>
          </div>
        </Card>
      </div>
      <div className="mt-4">
        <Button disabled={saving} onClick={save}>{saving ? t('common.loading') : t('settings.save')}</Button>
      </div>
    </div>
  )
}
