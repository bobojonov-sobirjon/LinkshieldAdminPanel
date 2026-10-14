import { useEffect, useState } from 'react'
import {
  deleteAdminReview,
  fetchAdminReports,
  fetchReview,
  localizeError,
  updateAdminReport,
  updateAdminUser,
} from '@/api/client'
import { Alert, Badge, Button, Card, Empty, PageHeader, Pager, formatDate } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

const limit = 20

function statusTone(status) {
  if (status === 'resolved') return 'ok'
  if (status === 'rejected') return 'off'
  return 'warn'
}

export default function ReportsPage() {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actingId, setActingId] = useState('')
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [selected, setSelected] = useState(null)
  const [review, setReview] = useState(null)
  const [reviewMissing, setReviewMissing] = useState(false)

  async function load(nextPage = page) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminReports({ limit, page: nextPage })
      const rows = data.data || data.items || []
      if (!rows.length && nextPage > 1) {
        await load(nextPage - 1)
        return
      }
      setItems(rows)
      setTotal(data.total || 0)
      setPage(data.page || nextPage)
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  async function openReport(report) {
    setSelected(report)
    setReview(null)
    setReviewMissing(false)
    setError('')
    if (report.target_type !== 'review') return
    try {
      const data = await fetchReview(report.target_id)
      setReview(data)
    } catch (e) {
      if (e?.response?.status === 404) {
        setReviewMissing(true)
        return
      }
      setError(localizeError(e))
    }
  }

  async function closeReport(report, resolution) {
    await updateAdminReport(report.id, { status: 'resolved', resolution })
  }

  async function onDelete(report) {
    if (!window.confirm(t('reports.confirmDelete'))) return
    setActingId(report.id)
    setError('')
    try {
      await deleteAdminReview(report.target_id)
      await closeReport(report, 'Review deleted')
      setFlash(t('reports.deletedFlash'))
      setSelected(null)
      setReview(null)
      await load()
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setActingId('')
    }
  }

  async function onBlock(report) {
    const userId = review?.user_id
    if (!userId || !window.confirm(t('reports.confirmBlock'))) return
    setActingId(report.id)
    setError('')
    try {
      await updateAdminUser(userId, { is_active: false })
      setFlash(t('reports.blockedFlash'))
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setActingId('')
    }
  }

  return (
    <div>
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <>
            <span className="text-sm text-gray-500">
              {t('reports.total')}: {total}
            </span>
            <Button variant="plain" disabled={loading} onClick={() => load()}>
              {t('reports.refresh')}
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
          <Empty>{t('reports.empty')}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('reports.target')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reports.reason')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reports.description')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reports.status')}</th>
                  <th className="px-4 py-3 font-semibold">{t('reports.created')}</th>
                  <th className="px-4 py-3 font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((report) => (
                  <tr key={report.id} className="align-top hover:bg-gray-50/70">
                    <td className="px-4 py-3">
                      <Badge>{report.target_type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{report.reason || '—'}</td>
                    <td className="max-w-sm px-4 py-3 text-gray-800">{report.description || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(report.status)}>{report.status || 'pending'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(report.created_at)}</td>
                    <td className="px-4 py-3">
                      {report.target_type === 'review' ? (
                        <Button variant="soft" onClick={() => openReport(report)}>
                          {t('reports.open')}
                        </Button>
                      ) : (
                        '—'
                      )}
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
        <aside className="fixed inset-0 z-50 flex justify-end bg-gray-900/40" onClick={() => setSelected(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('reports.open')}</h2>
                <p className="mt-1 text-xs text-gray-400">{formatDate(selected.created_at)}</p>
              </div>
              <Button variant="plain" onClick={() => setSelected(null)}>
                {t('reviews.close')}
              </Button>
            </div>
            <div className="space-y-5 px-5 py-5">
              <div className="flex flex-wrap gap-2">
                <Badge>{selected.reason || 'other'}</Badge>
                <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                {selected.description || '—'}
              </p>
              {reviewMissing ? <Alert>{t('reports.missing')}</Alert> : null}
              {review ? (
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {t('reviews.text')}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-900">
                    {review.text_content || '—'}
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    {review.author?.full_name || review.author?.username || t('reviews.anonymous')}
                    {review.rating ? ` · ${review.rating}/5` : ''}
                  </p>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {review ? (
                  <Button
                    variant="danger"
                    disabled={actingId === selected.id}
                    onClick={() => onDelete(selected)}
                  >
                    {t('reports.deleteReview')}
                  </Button>
                ) : null}
                {review?.user_id ? (
                  <Button
                    variant="plain"
                    disabled={actingId === selected.id}
                    onClick={() => onBlock(selected)}
                  >
                    {t('reports.blockAuthor')}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
