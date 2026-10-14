import { useEffect, useState } from 'react'
import { fetchAdminUsers, localizeError, updateAdminUser } from '@/api/client'
import { useAuth } from '@/auth'
import { Alert, Badge, Button, Card, Empty, PageHeader, Pager, controlClass, formatDate } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

const limit = 50
const roles = ['user', 'verified_owner', 'moderator', 'admin']

export default function UsersPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [draftRole, setDraftRole] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  async function load(nextOffset = offset, query = q, roleFilter = role) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminUsers({
        q: query || undefined,
        role: roleFilter || undefined,
        limit,
        offset: nextOffset,
      })
      const rows = data.data || data.items || []
      setItems(rows)
      setTotal(data.total || 0)
      setDraftRole(Object.fromEntries(rows.map((row) => [row.id, row.role])))
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(0, '', '')
  }, [])

  async function saveRole(row) {
    try {
      await updateAdminUser(row.id, { role: draftRole[row.id] })
      setFlash(t('common.saveOk'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  async function toggleActive(row) {
    try {
      await updateAdminUser(row.id, { is_active: !row.is_active })
      setFlash(t('common.saveOk'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={<span className="text-sm text-gray-500">{t('users.total')}: {total}</span>}
      />
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            className={`${controlClass} min-w-56 flex-1`}
            type="search"
            placeholder={t('users.search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setOffset(0)
                load(0, q, role)
              }
            }}
          />
          <select
            className={`${controlClass} w-auto`}
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              setOffset(0)
              load(0, q, e.target.value)
            }}
          >
            <option value="">{t('users.allRoles')}</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button
            variant="plain"
            onClick={() => {
              setOffset(0)
              load(0)
            }}
          >
            {t('dashboard.refresh')}
          </Button>
        </div>
      </Card>
      {error ? <Alert>{error}</Alert> : null}
      {flash ? <Alert kind="ok">{flash}</Alert> : null}
      <Card>
        {loading ? (
          <Empty>{t('common.loading')}</Empty>
        ) : !items.length ? (
          <Empty>{t('users.empty')}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {[t('users.name'), t('users.phone'), t('users.email'), t('users.role'), 'Status', t('users.created'), t('common.actions')].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.full_name || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.phone || '—'}</td>
                    <td className="px-4 py-3">{row.email || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        className={`${controlClass} h-9 w-40`}
                        disabled={!isAdmin}
                        title={isAdmin ? '' : t('users.onlyAdminRole')}
                        value={draftRole[row.id] || row.role}
                        onChange={(e) => setDraftRole((prev) => ({ ...prev, [row.id]: e.target.value }))}
                      >
                        {roles.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={row.is_active ? 'ok' : 'off'}>
                        {row.is_active ? t('users.active') : t('users.blocked')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isAdmin && draftRole[row.id] !== row.role ? (
                          <Button onClick={() => saveRole(row)}>{t('users.saveRole')}</Button>
                        ) : null}
                        <Button variant={row.is_active ? 'danger' : 'plain'} onClick={() => toggleActive(row)}>
                          {row.is_active ? t('users.block') : t('users.unblock')}
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
