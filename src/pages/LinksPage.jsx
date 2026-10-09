import { useEffect, useState } from 'react'
import {
  fetchAdminLinks,
  fetchAdminOwnerships,
  localizeError,
  updateAdminLink,
  updateAdminOwnership,
} from '@/api/client'
import { Alert, Badge, Button, Card, Empty, PageHeader, controlClass, formatDate, shortId } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

const risks = ['safe', 'suspicious', 'phishing', 'unchecked']

export default function LinksPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState('links')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [links, setLinks] = useState([])
  const [linkTotal, setLinkTotal] = useState(0)
  const [linkQ, setLinkQ] = useState('')
  const [risk, setRisk] = useState('')
  const [draftRisk, setDraftRisk] = useState({})
  const [ownerships, setOwnerships] = useState([])
  const [ownTotal, setOwnTotal] = useState(0)
  const [pendingOnly, setPendingOnly] = useState(true)

  async function loadLinks(query = linkQ, riskFilter = risk) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminLinks({
        q: query || undefined,
        risk_status: riskFilter || undefined,
        limit: 50,
        offset: 0,
      })
      const rows = data.data || data.items || []
      setLinks(rows)
      setLinkTotal(data.total || 0)
      setDraftRisk(Object.fromEntries(rows.map((row) => [row.id, row.risk_status])))
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  async function loadOwn(pending = pendingOnly) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminOwnerships({
        status: pending ? 'pending' : undefined,
        limit: 50,
        offset: 0,
      })
      setOwnerships(data.data || data.items || [])
      setOwnTotal(data.total || 0)
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLinks('', '')
  }, [])

  useEffect(() => {
    if (tab === 'ownerships') loadOwn()
  }, [tab])

  async function saveRisk(row) {
    try {
      await updateAdminLink(row.id, { risk_status: draftRisk[row.id] })
      setFlash(t('common.saveOk'))
      await loadLinks()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  async function setOwn(row, status) {
    try {
      await updateAdminOwnership(row.id, { status })
      setFlash(t('common.saveOk'))
      await loadOwn()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('links.title')}
        subtitle={t('links.subtitle')}
        actions={
          <Button variant="plain" disabled={loading} onClick={() => (tab === 'links' ? loadLinks() : loadOwn())}>
            {t('links.refresh')}
          </Button>
        }
      />
      <div className="mb-4 flex gap-2">
        {[
          ['links', t('links.tabLinks')],
          ['ownerships', t('links.tabOwnerships')],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {flash ? <Alert kind="ok">{flash}</Alert> : null}

      {tab === 'links' ? (
        <>
          <Card className="mb-4 flex flex-wrap items-center gap-3 p-4">
            <input
              className={`${controlClass} min-w-56 flex-1`}
              type="search"
              placeholder={t('links.search')}
              value={linkQ}
              onChange={(e) => setLinkQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadLinks()
              }}
            />
            <select
              className={`${controlClass} w-auto`}
              value={risk}
              onChange={(e) => {
                setRisk(e.target.value)
                loadLinks(linkQ, e.target.value)
              }}
            >
              <option value="">{t('links.allRisk')}</option>
              {risks.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">{t('links.total')}: {linkTotal}</span>
          </Card>
          <Card>
            {loading ? <Empty>{t('common.loading')}</Empty> : !links.length ? <Empty>{t('links.emptyLinks')}</Empty> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      {[t('links.domain'), t('links.url'), t('links.risk'), 'User', t('common.actions')].map((head) => (
                        <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {links.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-medium">{row.domain}</td>
                        <td className="max-w-xs truncate px-4 py-3">
                          <a className="text-indigo-600 hover:underline" href={row.url} target="_blank" rel="noreferrer">{row.url}</a>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className={`${controlClass} h-9 w-36`}
                            value={draftRisk[row.id] || row.risk_status}
                            onChange={(e) => setDraftRisk((prev) => ({ ...prev, [row.id]: e.target.value }))}
                          >
                            {risks.map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{shortId(row.user_id)}</td>
                        <td className="px-4 py-3">
                          {draftRisk[row.id] !== row.risk_status ? (
                            <Button onClick={() => saveRisk(row)}>{t('faq.save')}</Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-4 flex items-center justify-between p-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => {
                  setPendingOnly(e.target.checked)
                  loadOwn(e.target.checked)
                }}
              />
              {t('links.pendingOnly')}
            </label>
            <span className="text-sm text-gray-500">{t('links.total')}: {ownTotal}</span>
          </Card>
          <Card>
            {loading ? <Empty>{t('common.loading')}</Empty> : !ownerships.length ? <Empty>{t('links.emptyOwn')}</Empty> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      {['Link', t('links.owner'), 'Status', t('links.paid'), t('links.expires'), t('common.actions')].map((head) => (
                        <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ownerships.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-mono text-xs">{shortId(row.link_id)}</td>
                        <td className="px-4 py-3 font-mono text-xs">{shortId(row.owner_id)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={row.verification_status === 'verified' ? 'ok' : row.verification_status === 'pending' ? 'warn' : 'off'}>
                            {row.verification_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{row.amount_paid}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(row.expires_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {row.verification_status !== 'verified' ? (
                              <Button onClick={() => setOwn(row, 'verified')}>{t('links.verify')}</Button>
                            ) : null}
                            {row.verification_status !== 'rejected' ? (
                              <Button variant="danger" onClick={() => setOwn(row, 'rejected')}>{t('links.reject')}</Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
