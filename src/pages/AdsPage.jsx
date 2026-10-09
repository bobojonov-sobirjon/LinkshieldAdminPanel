import { useEffect, useState } from 'react'
import {
  clearAdsSlot,
  fetchAdsSlots,
  localizeError,
  updateAdsSlot,
  uploadAdsSlotMedia,
} from '@/api/client'
import { Alert, Badge, Button, Card, Empty, Field, PageHeader, controlClass, formatDate, shortId } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

const COUNTRIES = ['Global', 'USA', 'CIS', 'Europe', 'Asia', 'Africa', 'LATAM']

function formatSeconds(sec) {
  const s = Math.max(0, Number(sec) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${r}s`
  return `${r}s`
}

function mediaSrc(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url
}

function isVideo(url) {
  return /\.(mp4|mov|webm|m4v|3gp)(\?|$)/i.test(url || '')
}

function MediaThumb({ url, large = false }) {
  const src = mediaSrc(url)
  if (!src) return '—'
  if (isVideo(src)) {
    return (
      <video
        src={src}
        controls
        className={large ? 'max-h-56 w-full rounded-xl bg-black' : 'h-16 w-28 rounded-md bg-black'}
      />
    )
  }
  return (
    <img
      src={src}
      alt=""
      className={large ? 'max-h-56 w-full rounded-xl object-cover' : 'h-12 w-16 rounded-md object-cover'}
    />
  )
}

export default function AdsPage() {
  const { t } = useI18n()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [selected, setSelected] = useState(null)
  const [editor, setEditor] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdsSlots()
      const rows = Array.isArray(data) ? [...data].sort((a, b) => a.slot_number - b.slot_number) : []
      setSlots(rows)
      setSelected((current) => rows.find((row) => row.id === current?.id) || null)
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openAdd() {
    const free = slots.find((slot) => slot.is_available) || slots[0]
    setEditor({
      slotId: free?.id || '',
      country: free?.target_country || 'Global',
      hours: 24,
      imageUrl: '',
      file: null,
    })
    setError('')
  }

  function openUpdate(slot) {
    setEditor({
      slotId: slot.id,
      country: slot.target_country || 'Global',
      hours: 24,
      imageUrl: slot.media_url && slot.media_url.startsWith('http') ? slot.media_url : '',
      file: null,
    })
    setError('')
  }

  async function onSave(event) {
    event.preventDefault()
    if (!editor?.slotId) return
    setLoading(true)
    setError('')
    setFlash('')
    try {
      if (editor.file) {
        await uploadAdsSlotMedia(editor.slotId, {
          file: editor.file,
          targetCountry: editor.country,
          hours: Number(editor.hours) || 24,
        })
      } else {
        await updateAdsSlot(editor.slotId, {
          media_url: editor.imageUrl.trim() || null,
          target_country: editor.country,
          hours: Number(editor.hours) || 24,
        })
      }
      setEditor(null)
      setFlash(t('ads.saved'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  async function onClear(slot) {
    if (!window.confirm(t('ads.confirmClear'))) return
    setError('')
    setFlash('')
    try {
      await clearAdsSlot(slot.id)
      if (selected?.id === slot.id) setSelected(null)
      setFlash(t('ads.cleared'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('ads.title')}
        subtitle={t('ads.subtitle')}
        actions={
          <>
            <Button onClick={openAdd}>{t('ads.add')}</Button>
            <Button variant="plain" disabled={loading} onClick={load}>
              {t('ads.refresh')}
            </Button>
          </>
        }
      />
      <p className="mb-4 text-sm text-gray-500">{t('ads.hint')}</p>
      {error ? <Alert>{error}</Alert> : null}
      {flash ? <Alert kind="ok">{flash}</Alert> : null}
      <Card>
        {loading && !slots.length ? (
          <Empty>{t('common.loading')}</Empty>
        ) : !slots.length ? (
          <Empty>{t('ads.empty')}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {[t('ads.slot'), t('ads.country'), t('ads.status'), t('ads.remaining'), t('ads.expires'), t('ads.media'), t('common.actions')].map(
                    (head) => (
                      <th key={head} className="px-4 py-3 font-semibold">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-semibold">#{slot.slot_number}</td>
                    <td className="px-4 py-3">{slot.target_country || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge tone={slot.is_available ? 'ok' : 'warn'}>
                        {slot.is_available ? t('ads.free') : t('ads.booked')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-600">
                      {slot.seconds_remaining == null ? '—' : formatSeconds(slot.seconds_remaining)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(slot.slot_expires_at)}</td>
                    <td className="px-4 py-3">
                      <MediaThumb url={slot.media_url} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="soft" onClick={() => setSelected(slot)}>
                          {t('ads.details')}
                        </Button>
                        <Button variant="plain" onClick={() => openUpdate(slot)}>
                          {t('ads.update')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {selected ? (
        <SlotDetails
          slot={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => openUpdate(selected)}
          onClear={() => onClear(selected)}
        />
      ) : null}
      {editor ? (
        <SlotEditor
          slots={slots}
          editor={editor}
          saving={loading}
          onChange={setEditor}
          onClose={() => setEditor(null)}
          onSave={onSave}
        />
      ) : null}
    </div>
  )
}

function SlotDetails({ slot, onClose, onUpdate, onClear }) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('ads.details')} · #{slot.slot_number}
            </h2>
            <p className="mt-1 text-xs text-gray-400">{slot.target_country}</p>
          </div>
          <Button variant="plain" onClick={onClose}>
            {t('reviews.close')}
          </Button>
        </div>
        <div className="space-y-5 px-5 py-5">
          <Badge tone={slot.is_available ? 'ok' : 'warn'}>
            {slot.is_available ? t('ads.free') : t('ads.booked')}
          </Badge>
          {slot.media_url ? (
            <MediaThumb url={slot.media_url} large />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
              {t('ads.media')} —
            </div>
          )}
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('ads.remaining')}</dt>
              <dd className="mt-1 font-medium text-gray-900">
                {slot.seconds_remaining == null ? '—' : formatSeconds(slot.seconds_remaining)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('ads.expires')}</dt>
              <dd className="mt-1 font-medium text-gray-900">{formatDate(slot.slot_expires_at)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('ads.advertiser')}</dt>
              <dd className="mt-1 font-medium text-gray-900">
                {slot.current_advertiser_id ? shortId(slot.current_advertiser_id) : '—'}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <Button onClick={onUpdate}>{t('ads.update')}</Button>
            {!slot.is_available ? (
              <Button variant="danger" onClick={onClear}>
                {t('ads.clear')}
              </Button>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  )
}

function SlotEditor({ slots, editor, saving, onChange, onClose, onSave }) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4" onClick={onClose}>
      <form
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSave}
      >
        <h2 className="text-lg font-semibold text-gray-900">{t('ads.add')}</h2>
        <p className="mt-1 text-sm text-gray-500">{t('ads.pickImage')}</p>
        <div className="mt-5 space-y-4">
          <Field label={t('ads.slot')}>
            <select
              className={controlClass}
              value={editor.slotId}
              onChange={(event) => onChange({ ...editor, slotId: event.target.value })}
            >
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  #{slot.slot_number} · {slot.target_country} · {slot.is_available ? t('ads.free') : t('ads.booked')}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('ads.country')}>
            <select
              className={controlClass}
              value={editor.country}
              onChange={(event) => onChange({ ...editor, country: event.target.value })}
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('ads.hours')}>
            <input
              className={controlClass}
              type="number"
              min="1"
              max="8760"
              value={editor.hours}
              onChange={(event) => onChange({ ...editor, hours: event.target.value })}
            />
          </Field>
          <Field label={t('ads.image')}>
            <input
              className={controlClass}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={(event) => onChange({ ...editor, file: event.target.files?.[0] || null })}
            />
          </Field>
          <Field label={t('ads.imageUrl')}>
            <input
              className={controlClass}
              value={editor.imageUrl}
              placeholder="https://"
              onChange={(event) => onChange({ ...editor, imageUrl: event.target.value })}
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="plain" onClick={onClose}>
            {t('faq.cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {t('ads.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
