import { useEffect, useState } from 'react'
import {
  deleteAdminReview,
  fetchAdminReviews,
  fetchWebsite,
  localizeError,
  moderateAdminReview,
} from '@/api/client'
import { Alert, Badge, Button, Card, Empty, PageHeader, Pager, formatDate } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

const limit = 10

function authorName(review) {
  if (review.is_anonymous && !review.author) return null
  return review.author?.full_name || review.author?.username || null
}

function statusTone(status) {
  if (status === 'approved') return 'ok'
  if (status === 'rejected') return 'off'
  return 'warn'
}

export default function ReviewsPage() {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState('')
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [selected, setSelected] = useState(null)
  const [website, setWebsite] = useState(null)

  async function load(nextPage = page) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminReviews({ limit, page: nextPage })
      const rows = data.data || data.items || []
      if (!rows.length && nextPage > 1) {
        await load(nextPage - 1)
        return
      }
      setItems(rows)
      setTotal(data.total || 0)
      setPage(data.page || nextPage)
      setSelected((current) => rows.find((row) => row.id === current?.id) || current)
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  useEffect(() => {
    const id = selected?.website_id
    if (!id) {
      setWebsite(null)
      return
    }
    let cancelled = false
    fetchWebsite(id)
      .then((data) => {
        if (!cancelled) setWebsite(data)
      })
      .catch(() => {
        if (!cancelled) setWebsite(null)
      })
    return () => {
      cancelled = true
    }
  }, [selected?.id, selected?.website_id])

  async function onModerate(review, status) {
    setActingId(review.id)
    setError('')
    setFlash('')
    try {
      await moderateAdminReview(review.id, status)
      setFlash(status === 'approved' ? t('reviews.approvedFlash') : t('reviews.rejectedFlash'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setActingId('')
    }
  }

  async function onDelete(review) {
    if (!window.confirm(t('reviews.confirmDelete'))) return
    try {
      await deleteAdminReview(review.id)
      if (selected?.id === review.id) setSelected(null)
      setFlash(t('common.deleted'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('reviews.title')}
        subtitle={t('reviews.subtitle')}
        actions={
          <>
            <span className="text-sm text-gray-500">
              {t('reviews.total')}: {total}
            </span>
            <Button variant="plain" disabled={loading} onClick={() => load()}>
              {t('reviews.refresh')}
            </Button>
          </>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      {flash ? <Alert kind="ok">{flash}</Alert> : null}
      <Card>
        {loading && !items.length ? (
          <Empty>{t('common.loading')}</Empty>
        ) : !items.length ? (
          <Empty>{t('reviews.empty')}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('reviews.type')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reviews.text')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reviews.author')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reviews.rating')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reviews.likes')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reviews.created')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reviews.status')}</th>
                  <th className="px-4 py-3 font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((review) => (
                  <tr key={review.id} className="align-top hover:bg-gray-50/70">
                    <td className="px-4 py-3">
                      <Badge>{review.content_type}</Badge>
                    </td>
                    <td className="max-w-sm px-4 py-3 text-gray-800">{review.text_content || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {authorName(review) || (review.is_anonymous ? t('reviews.anonymous') : '—')}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">
                      {review.rating ? `${review.rating}/5` : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-600">
                      {review.likes_count}/{review.dislikes_count}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(review.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(review.status)}>{review.status || 'pending'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="soft" onClick={() => setSelected(review)}>
                          {t('reviews.details')}
                        </Button>
                        {review.status !== 'approved' ? (
                          <Button disabled={actingId === review.id} onClick={() => onModerate(review, 'approved')}>
                            {t('reviews.approve')}
                          </Button>
                        ) : null}
                        {review.status === 'pending' ? (
                          <Button
                            variant="plain"
                            disabled={actingId === review.id}
                            onClick={() => onModerate(review, 'rejected')}
                          >
                            {t('reviews.reject')}
                          </Button>
                        ) : null}
                        <Button variant="danger" disabled={actingId === review.id} onClick={() => onDelete(review)}>
                          {t('faq.delete')}
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
      <Pager
        showAlways
        offset={(page - 1) * limit}
        limit={limit}
        total={total}
        prevLabel={t('common.prev')}
        nextLabel={t('common.next')}
        onPrev={() => load(Math.max(1, page - 1))}
        onNext={() => load(page + 1)}
      />
      {selected ? (
        <ReviewDetails
          review={selected}
          website={website}
          acting={actingId === selected.id}
          onClose={() => setSelected(null)}
          onModerate={onModerate}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  )
}

function ReviewDetails({ review, website, acting, onClose, onModerate, onDelete }) {
  const { t } = useI18n()
  const name = authorName(review)
  const site = website?.domain || website?.url || website?.normalized_url
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('reviews.details')}</h2>
            <p className="mt-1 text-xs text-gray-400">{formatDate(review.created_at)}</p>
          </div>
          <Button variant="plain" onClick={onClose}>
            {t('reviews.close')}
          </Button>
        </div>
        <div className="space-y-5 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{review.content_type}</Badge>
            <Badge tone={statusTone(review.status)}>{review.status || 'pending'}</Badge>
            {review.is_anonymous ? <Badge tone="info">{t('reviews.anonymous')}</Badge> : null}
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">{review.text_content || '—'}</p>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('reviews.author')}</dt>
              <dd className="mt-1 font-medium text-gray-900">{name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('reviews.rating')}</dt>
              <dd className="mt-1 font-medium text-gray-900">{review.rating ? `${review.rating} / 5` : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('reviews.likes')}</dt>
              <dd className="mt-1 font-medium text-gray-900">
                {review.likes_count} / {review.dislikes_count}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('reviews.website')}</dt>
              <dd className="mt-1 break-all font-medium text-gray-900">{site || '—'}</dd>
            </div>
          </dl>
          {review.images?.length ? (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('reviews.images')}</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {review.images.map((image) => (
                  <a key={image.id} href={image.image_url} target="_blank" rel="noreferrer">
                    <img src={image.image_url} alt="" className="h-20 w-full rounded-lg object-cover" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          {review.media_url ? (
            <a className="text-sm font-semibold text-indigo-600 hover:underline" href={review.media_url} target="_blank" rel="noreferrer">
              {review.media_url}
            </a>
          ) : null}
          {review.reject_reason ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{review.reject_reason}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {review.status !== 'approved' ? (
              <Button disabled={acting} onClick={() => onModerate(review, 'approved')}>
                {t('reviews.approve')}
              </Button>
            ) : null}
            {review.status === 'pending' ? (
              <Button variant="plain" disabled={acting} onClick={() => onModerate(review, 'rejected')}>
                {t('reviews.reject')}
              </Button>
            ) : null}
            <Button variant="danger" disabled={acting} onClick={() => onDelete(review)}>
              {t('faq.delete')}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
