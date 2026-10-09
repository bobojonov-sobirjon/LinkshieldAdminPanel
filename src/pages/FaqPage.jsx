import { useEffect, useMemo, useState } from 'react'
import { createFaq, deleteFaq, fetchFaqAdmin, localizeError, updateFaq } from '@/api/client'
import { Alert, Badge, Button, Card, Empty, Field, PageHeader, areaClass, controlClass } from '@/components/ui'
import { useI18n } from '@/hooks/useI18n'

const emptyForm = () => ({
  slug: '',
  category: 'general',
  sort_order: 0,
  is_active: true,
  question: { eng: '', rus: '' },
  answer: { eng: '', rus: '' },
})

export default function FaqPage() {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [modalError, setModalError] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) =>
      [item.slug, item.category, item.question?.eng, item.question?.rus, item.answer?.eng, item.answer?.rus]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [items, q])

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchFaqAdmin())
    } catch (e) {
      setError(localizeError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalError('')
    setOpen(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      slug: item.slug,
      category: item.category,
      sort_order: item.sort_order,
      is_active: item.is_active,
      question: { eng: item.question?.eng || '', rus: item.question?.rus || '' },
      answer: { eng: item.answer?.eng || '', rus: item.answer?.rus || '' },
    })
    setModalError('')
    setOpen(true)
  }

  async function onSave(event) {
    event.preventDefault()
    setSaving(true)
    setModalError('')
    const payload = {
      slug: form.slug.trim(),
      category: form.category.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: Boolean(form.is_active),
      question: { eng: form.question.eng.trim(), rus: form.question.rus.trim() },
      answer: { eng: form.answer.eng.trim(), rus: form.answer.rus.trim() },
    }
    try {
      if (editingId) await updateFaq(editingId, payload)
      else await createFaq(payload)
      setFlash(t('common.saveOk'))
      setOpen(false)
      await load()
    } catch (e) {
      setModalError(localizeError(e))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(item) {
    if (!window.confirm(t('faq.confirmDelete'))) return
    try {
      await deleteFaq(item.id)
      setFlash(t('common.deleted'))
      await load()
    } catch (e) {
      setError(localizeError(e))
    }
  }

  function setNested(group, lang, value) {
    setForm((prev) => ({ ...prev, [group]: { ...prev[group], [lang]: value } }))
  }

  return (
    <div>
      <PageHeader
        title={t('faq.title')}
        subtitle={t('faq.subtitle')}
        actions={<Button onClick={openCreate}>{t('faq.add')}</Button>}
      />
      <Card className="mb-4 p-4">
        <input className={controlClass} type="search" placeholder={t('faq.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>
      {error ? <Alert>{error}</Alert> : null}
      {flash ? <Alert kind="ok">{flash}</Alert> : null}
      <Card>
        {loading ? <Empty>{t('common.loading')}</Empty> : !filtered.length ? <Empty>{t('faq.empty')}</Empty> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {[t('faq.slug'), t('faq.category'), t('faq.qEng'), t('faq.sort'), 'Status', t('common.actions')].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-mono text-xs">{item.slug}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="max-w-sm px-4 py-3">
                      <div>{item.question?.eng}</div>
                      <div className="mt-1 text-xs text-gray-400">{item.question?.rus}</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{item.sort_order}</td>
                    <td className="px-4 py-3">
                      <Badge tone={item.is_active ? 'ok' : 'off'}>{item.is_active ? t('faq.active') : t('faq.inactive')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="plain" onClick={() => openEdit(item)}>{t('faq.edit')}</Button>
                        <Button variant="danger" onClick={() => onDelete(item)}>{t('faq.delete')}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-gray-900/40 p-4" onClick={() => setOpen(false)}>
          <form
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSave}
          >
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? t('faq.edit') : t('faq.add')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t('faq.slug')}>
                <input className={controlClass} required maxLength={64} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
              <Field label={t('faq.category')}>
                <input className={controlClass} required maxLength={64} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </Field>
              <Field label={t('faq.sort')}>
                <input className={controlClass} type="number" min="0" max="10000" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </Field>
              <Field label={t('faq.active')}>
                <select className={controlClass} value={String(form.is_active)} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}>
                  <option value="true">{t('faq.active')}</option>
                  <option value="false">{t('faq.inactive')}</option>
                </select>
              </Field>
              <Field label={t('faq.qEng')}>
                <textarea className={areaClass} required value={form.question.eng} onChange={(e) => setNested('question', 'eng', e.target.value)} />
              </Field>
              <Field label={t('faq.qRus')}>
                <textarea className={areaClass} required value={form.question.rus} onChange={(e) => setNested('question', 'rus', e.target.value)} />
              </Field>
              <Field label={t('faq.aEng')}>
                <textarea className={areaClass} required value={form.answer.eng} onChange={(e) => setNested('answer', 'eng', e.target.value)} />
              </Field>
              <Field label={t('faq.aRus')}>
                <textarea className={areaClass} required value={form.answer.rus} onChange={(e) => setNested('answer', 'rus', e.target.value)} />
              </Field>
            </div>
            {modalError ? <div className="mt-4"><Alert>{modalError}</Alert></div> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="plain" onClick={() => setOpen(false)}>{t('faq.cancel')}</Button>
              <Button type="submit" disabled={saving}>{saving ? t('common.loading') : t('faq.save')}</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
