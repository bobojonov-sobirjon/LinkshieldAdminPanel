import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { fetchAdminReviews, fetchAdsSlots, fetchFaqAdmin, fetchGeoStats, localizeError } from '@/api/client'
import { Alert, Badge, Button, Card, PageHeader } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

export default function DashboardPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [geo, setGeo] = useState(null)
  const [slots, setSlots] = useState([])
  const [faqCount, setFaqCount] = useState(0)
  const [reviews, setReviews] = useState([])

  const cityCount = Object.keys(geo?.cities || {}).length
  const freeSlots = slots.filter((s) => s.is_available).length
  const busySlots = slots.filter((s) => !s.is_available).length
  const slotChart = [
    { name: t('ads.free'), value: freeSlots, fill: '#10b981' },
    { name: t('ads.booked'), value: busySlots, fill: '#f59e0b' },
  ].filter((row) => row.value > 0)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [g, s, faqs, reviewPage] = await Promise.all([
        fetchGeoStats(),
        fetchAdsSlots(),
        fetchFaqAdmin(),
        fetchAdminReviews({ limit: 8, offset: 0 }),
      ])
      setGeo(g)
      setSlots(Array.isArray(s) ? s : [])
      setFaqCount(faqs.length)
      setReviews(reviewPage.data || reviewPage.items || [])
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = [
    { label: t('dashboard.online'), value: geo?.world_online ?? '—', tone: 'bg-indigo-50 text-indigo-600', path: 'M12 21a9 9 0 1 0-9-9' },
    { label: t('dashboard.cities'), value: cityCount, tone: 'bg-sky-50 text-sky-600', path: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z' },
    { label: t('dashboard.slotsFree'), value: freeSlots, tone: 'bg-emerald-50 text-emerald-600', path: 'M20 6L9 17l-5-5' },
    { label: t('dashboard.slotsBusy'), value: busySlots, tone: 'bg-amber-50 text-amber-600', path: 'M4 7h16M4 12h16M4 17h10' },
    { label: t('dashboard.faqCount'), value: faqCount, tone: 'bg-violet-50 text-violet-600', path: 'M12 18h.01M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4' },
  ]

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <Button variant="plain" disabled={loading} onClick={load}>
            {t('dashboard.refresh')}
          </Button>
        }
      />
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            <div className="mt-3 flex items-end justify-between">
              <div className="text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</div>
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${stat.tone}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={stat.path} />
                </svg>
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <Card className="p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">{t('dashboard.recentReviews')}</h2>
            <Link to="/reviews" className="text-sm font-semibold text-indigo-600 hover:underline">
              {t('dashboard.viewReviews')}
            </Link>
          </div>
          {loading && !reviews.length ? (
            <p className="py-10 text-sm text-gray-500">{t('common.loading')}</p>
          ) : reviews.length === 0 ? (
            <p className="py-10 text-sm text-gray-500">{t('reviews.empty')}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <li key={review.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-800">{review.text_content || '—'}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {review.author?.full_name || review.author?.username || '—'}
                    </p>
                  </div>
                  <Badge tone={review.status === 'approved' ? 'ok' : review.status === 'rejected' ? 'off' : 'warn'}>
                    {review.status || 'pending'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">{t('dashboard.adsTitle')}</h2>
            <Link to="/ads" className="text-sm font-semibold text-indigo-600 hover:underline">
              {t('nav.ads')}
            </Link>
          </div>
          <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-500">
            {t('dashboard.adsNote')}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-36 w-36 shrink-0">
              {slotChart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={slotChart} dataKey="value" nameKey="name" innerRadius={38} outerRadius={58} paddingAngle={2} stroke="none">
                      {slotChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-gray-500">{t('ads.empty')}</p>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {t('ads.free')}
                </span>
                <span className="text-lg font-semibold tabular-nums text-emerald-700">{freeSlots}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  {t('ads.booked')}
                </span>
                <span className="text-lg font-semibold tabular-nums text-amber-700">{busySlots}</span>
              </div>
              <div className="flex items-center justify-between px-3 text-xs text-gray-400">
                <span>{t('dashboard.adsTotal')}</span>
                <span className="font-semibold tabular-nums text-gray-600">{slots.length}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                title={`#${slot.slot_number} · ${slot.is_available ? t('ads.free') : t('ads.booked')}`}
                className={`grid aspect-square place-items-center rounded-lg text-sm font-semibold ${
                  slot.is_available
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                }`}
              >
                {slot.slot_number}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
