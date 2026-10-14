import { useEffect, useState } from 'react'
import { fetchStoreLinks, localizeError, sendStoreLink } from '@/api/client'
import { Alert, Button, Card, PageHeader } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

export default function StoreLinksPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ apple: 0, play: 0, apple_url: '', play_url: '' })

  async function load() {
    setLoading(true)
    setError('')
    try {
      setStats(await fetchStoreLinks())
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function send(platform) {
    setBusy(platform)
    setError('')
    try {
      const next = await sendStoreLink(platform)
      setStats(next)
      const url = platform === 'apple' ? next.apple_url : next.play_url
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t('store.title')} subtitle={t('store.hint')} />
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm font-semibold text-gray-500">{t('store.sent').replace('{n}', loading ? '…' : String(stats.apple ?? 0))}</div>
          <Button className="mt-4" disabled={busy !== ''} onClick={() => send('apple')}>
            {busy === 'apple' ? t('common.loading') : t('store.apple')}
          </Button>
        </Card>
        <Card>
          <div className="text-sm font-semibold text-gray-500">{t('store.sent').replace('{n}', loading ? '…' : String(stats.play ?? 0))}</div>
          <Button className="mt-4" disabled={busy !== ''} onClick={() => send('play')}>
            {busy === 'play' ? t('common.loading') : t('store.play')}
          </Button>
        </Card>
      </div>
    </div>
  )
}
