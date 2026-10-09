export function Button({ variant = 'solid', className = '', type = 'button', ...props }) {
  const styles = {
    solid: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm',
    plain: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    danger: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Card({ className = '', children }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export function Alert({ kind = 'error', children }) {
  const styles =
    kind === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-rose-200 bg-rose-50 text-rose-800'
  return <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles}`}>{children}</div>
}

export function Badge({ tone = 'neutral', children }) {
  const styles = {
    ok: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    warn: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    off: 'bg-gray-100 text-gray-600 ring-gray-500/10',
    neutral: 'bg-gray-100 text-gray-600 ring-gray-500/10',
    info: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  }
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[tone]}`}>
      {children}
    </span>
  )
}

export function Empty({ children }) {
  return <div className="px-4 py-14 text-center text-sm text-gray-500">{children}</div>
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

export const controlClass =
  'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'

export const areaClass =
  'min-h-24 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'

export function Pager({ offset, limit, total, onPrev, onNext, prevLabel, nextLabel, showAlways = false }) {
  if (!showAlways && total <= limit) return null
  const page = Math.floor(offset / Math.max(limit, 1)) + 1
  const pages = Math.max(1, Math.ceil(total / Math.max(limit, 1)))
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <Button variant="plain" disabled={page <= 1} onClick={onPrev}>
        {prevLabel}
      </Button>
      <span className="min-w-16 text-center text-sm tabular-nums text-gray-500">
        {page} / {pages}
      </span>
      <Button variant="plain" disabled={page >= pages} onClick={onNext}>
        {nextLabel}
      </Button>
    </div>
  )
}

export function shortId(id) {
  return id ? String(id).slice(0, 8) : '—'
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}
