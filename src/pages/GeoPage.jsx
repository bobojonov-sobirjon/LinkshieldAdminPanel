import { useEffect, useMemo, useState } from 'react'
import { fetchGeoStats, localizeError } from '@/api/client'
import { Alert, Button, Card, PageHeader, controlClass } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

export default function GeoPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [geo, setGeo] = useState(null)
  const [query, setQuery] = useState('')

  const cities = useMemo(() => {
    const map = geo?.cities || {}
    return Object.entries(map)
      .map(([city, count]) => ({ city, online: Number(count) || 0 }))
      .sort((a, b) => b.online - a.online || a.city.localeCompare(b.city))
  }, [geo])
  const visible = cities.filter((row) => row.city.toLowerCase().includes(query.trim().toLowerCase()))
  const peak = Math.max(0, ...cities.map((row) => row.online))

  async function load() {
    setLoading(true)
    setError('')
    try {
      setGeo(await fetchGeoStats())
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title={t('dashboard.geoTitle')}
        subtitle={t('dashboard.geoSubtitle')}
        actions={
          <Button variant="plain" disabled={loading} onClick={load}>
            {t('dashboard.refresh')}
          </Button>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-medium text-gray-500">{t('dashboard.online')}</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{geo?.world_online ?? '—'}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-gray-500">{t('dashboard.cities')}</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{cities.length}</div>
        </Card>
      </div>
      <input
        className={`${controlClass} mb-4 max-w-sm`}
        type="search"
        value={query}
        placeholder={t('dashboard.geoSearch')}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading && !geo ? (
        <p className="py-10 text-sm text-gray-500">{t('common.loading')}</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-sm text-gray-500">{t('dashboard.noCities')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((row) => {
            const width = peak === 0 ? 0 : (row.online / peak) * 100
            return (
              <Card key={row.city} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="truncate text-sm font-medium text-gray-700">{row.city}</div>
                  <div className={`text-2xl font-semibold tabular-nums ${row.online > 0 ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {row.online}
                  </div>
                </div>
                {row.online > 0 ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-50">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${width}%` }} />
                  </div>
                ) : null}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
