import { useEffect, useState } from 'react'
import { fetchAdminPayments, localizeError, updateAdminPayment } from '@/api/client'
import { Alert, Button, Card, Empty, PageHeader, Pager, controlClass, formatDate, shortId } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

const limit = 50
const statuses = ['pending', 'completed', 'failed', 'cancelled']

export default function BillingPage() {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('')
  const [draft, setDraft] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  async function load(nextOffset = offset, statusFilter = status) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminPayments({
        status: statusFilter || undefined,
        limit,
        offset: nextOffset,
      })
      const rows = data.data || data.items || []
      setItems(rows)
      setTotal(data.total || 0)
      setDraft(Object.fromEntries(rows.map((row) => [row.id, row.status])))
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(0, '')
  }, [])

  async function saveStatus(row) {
    try {
      await updateAdminPayment(row.id, { status: draft[row.id] })
      setFlash(t('common.saveOk'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('billing.title')}
        subtitle={t('billing.subtitle')}
        actions={
          <>
            <span className="text-sm text-gray-500">{t('billing.total')}: {total}</span>
            <Button variant="plain" disabled={loading} onClick={() => load()}>{t('billing.refresh')}</Button>
          </>
        }
      />
      <Card className="mb-4 p-4">
        <select
          className={`${controlClass} max-w-xs`}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setOffset(0)
            load(0, e.target.value)
          }}
        >
          <option value="">{t('billing.allStatus')}</option>
          {statuses.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </Card>
      {error ? <Alert>{error}</Alert> : null}
      {flash ? <Alert kind="ok">{flash}</Alert> : null}
      <Card>
        {loading && !items.length ? (
          <Empty>{t('common.loading')}</Empty>
        ) : !items.length ? (
          <Empty>{t('billing.empty')}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {[t('billing.amount'), t('billing.method'), t('billing.service'), t('billing.status'), t('billing.user'), t('billing.created'), t('common.actions')].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-medium tabular-nums">{row.amount} {row.currency}</td>
                    <td className="px-4 py-3">{row.payment_method}</td>
                    <td className="px-4 py-3">{row.service_type}</td>
                    <td className="px-4 py-3">
                      <select
                        className={`${controlClass} h-9 w-36`}
                        value={draft[row.id] || row.status}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [row.id]: e.target.value }))}
                      >
                        {statuses.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{shortId(row.user_id)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      {draft[row.id] !== row.status ? (
                        <Button onClick={() => saveStatus(row)}>{t('billing.update')}</Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Pager
        offset={offset}
        limit={limit}
        total={total}
        prevLabel={t('common.prev')}
        nextLabel={t('common.next')}
        onPrev={() => {
          const next = Math.max(0, offset - limit)
          setOffset(next)
          load(next)
        }}
        onNext={() => {
          const next = offset + limit
          setOffset(next)
          load(next)
        }}
      />
    </div>
  )
}
