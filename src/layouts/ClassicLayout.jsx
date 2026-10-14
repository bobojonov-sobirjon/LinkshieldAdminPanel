import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useI18n } from '@/hooks/useI18n'

const groups = [
  {
    label: 'nav.groupOverview',
    items: [
      { to: '/', label: 'nav.dashboard', icon: GridIcon, end: true },
      { to: '/geo', label: 'nav.geo', icon: PinIcon },
    ],
  },
  {
    label: 'nav.groupModeration',
    items: [
      { to: '/reviews', label: 'nav.reviews', icon: ChatIcon },
      { to: '/links', label: 'nav.links', icon: LinkIcon },
    ],
  },
  {
    label: 'nav.groupCustomers',
    items: [
      { to: '/users', label: 'nav.users', icon: UsersIcon },
      { to: '/billing', label: 'nav.billing', icon: CardIcon },
    ],
  },
  {
    label: 'nav.groupContent',
    items: [
      { to: '/ads', label: 'nav.ads', icon: MonitorIcon },
      { to: '/store', label: 'nav.store', icon: LinkIcon },
      { to: '/faq', label: 'nav.faq', icon: BookIcon },
    ],
  },
  {
    label: 'nav.groupSystem',
    items: [{ to: '/settings', label: 'nav.settings', icon: GearIcon }],
  },
]

const titles = {
  '/': 'nav.dashboard',
  '/geo': 'nav.geo',
  '/reviews': 'nav.reviews',
  '/links': 'nav.links',
  '/users': 'nav.users',
  '/billing': 'nav.billing',
  '/ads': 'nav.ads',
  '/faq': 'nav.faq',
  '/settings': 'nav.settings',
  '/store': 'nav.store',
}

export default function ClassicLayout() {
  const { t, locale, setLocale } = useI18n()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const current = titles[location.pathname] || 'nav.dashboard'

  function onLogout() {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="h-9 w-9 object-contain" />
        <div className="text-[15px] font-extrabold tracking-[0.14em] text-gray-900">LINKSHIELD</div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              {t(group.label)}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center">
                    <item.icon />
                  </span>
                  <span className="whitespace-nowrap">{t(item.label)}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[270px] border-r border-gray-200 lg:block">
        {sidebar}
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] border-r border-gray-200 shadow-xl transition lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
          <div className="min-w-0 text-sm text-gray-500">
            <span className="text-gray-400">{t('brand')}</span>
            <span className="px-2 text-gray-300">/</span>
            <span className="font-medium text-gray-800">{t(current)}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-lg bg-gray-100 p-1">
              {['en', 'ru'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${
                    locale === code ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-gray-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {(user?.full_name || user?.phone || 'A').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-tight text-gray-800">
                    {user?.full_name || user?.phone}
                  </span>
                  <span className="block text-[11px] uppercase tracking-wide text-gray-400">
                    {user?.role}
                  </span>
                </span>
              </button>
              {menu ? (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                  <div className="px-3 py-2 text-xs text-gray-400">{t('nav.account')}</div>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={onLogout}
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Icon({ children }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}
function PinIcon() {
  return (
    <Icon>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </Icon>
  )
}
function GridIcon() {
  return (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  )
}
function ChatIcon() {
  return (
    <Icon>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 1 1 18 0z" />
    </Icon>
  )
}
function LinkIcon() {
  return (
    <Icon>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
    </Icon>
  )
}
function UsersIcon() {
  return (
    <Icon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M20 8v6M17 11h6" />
    </Icon>
  )
}
function CardIcon() {
  return (
    <Icon>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Icon>
  )
}
function MonitorIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </Icon>
  )
}
function BookIcon() {
  return (
    <Icon>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </Icon>
  )
}
function GearIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  )
}
function MenuIcon() {
  return (
    <Icon>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}
