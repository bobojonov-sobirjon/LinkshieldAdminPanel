<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 16.5L13 21.5L24 10.5"
              stroke="currentColor"
              stroke-width="2.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div>
          <div class="brand-name">{{ t('brand') }}</div>
          <div class="brand-sub">{{ t('brandSub') }}</div>
        </div>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="active"
        >
          <span class="nav-icon" v-html="item.icon" />
          <span>{{ t(item.label) }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <div class="user-chip" v-if="auth.user">
          <div class="user-name">{{ auth.user.full_name || auth.user.phone }}</div>
          <div class="user-role mono">{{ auth.user.role }}</div>
        </div>
        <button class="btn btn-ghost logout" type="button" @click="onLogout">
          {{ t('nav.logout') }}
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <button class="btn btn-ghost menu-btn" type="button" @click="open = !open">☰</button>
        <div class="spacer" />
        <div class="lang">
          <span class="lang-label">{{ t('common.lang') }}</span>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: locale === 'en' }"
            @click="switchLang('en')"
          >
            EN
          </button>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: locale === 'ru' }"
            @click="switchLang('ru')"
          >
            RU
          </button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>

    <div v-if="open" class="drawer-backdrop" @click="open = false" />
    <aside v-if="open" class="drawer">
      <nav class="nav">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="active"
          @click="open = false"
        >
          <span>{{ t(item.label) }}</span>
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const open = ref(false)

const nav = [
  {
    to: '/',
    label: 'nav.dashboard',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  },
  {
    to: '/faq',
    label: 'nav.faq',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  },
  {
    to: '/ads',
    label: 'nav.ads',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  },
  {
    to: '/users',
    label: 'nav.users',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  },
  {
    to: '/reviews',
    label: 'nav.reviews',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  },
  {
    to: '/billing',
    label: 'nav.billing',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  },
  {
    to: '/links',
    label: 'nav.links',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  },
]

function switchLang(code) {
  setLocale(code)
}

function onLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: linear-gradient(180deg, #101916 0%, #0d1411 100%);
  border-right: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0.5rem 1.4rem;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  display: grid;
  place-items: center;
  border: 1px solid rgba(45, 212, 168, 0.25);
}

.brand-name {
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: 1.05rem;
}

.brand-sub {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.92rem;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text);
}

.nav-link.active {
  background: var(--accent-soft);
  color: var(--accent);
}

.nav-icon {
  display: grid;
  place-items: center;
  opacity: 0.9;
}

.sidebar-foot {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-chip {
  padding: 0.35rem 0.5rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  color: var(--text-dim);
  margin-top: 0.15rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.7rem;
}

.logout {
  width: 100%;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid var(--border-soft);
  background: rgba(12, 18, 16, 0.65);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.spacer {
  flex: 1;
}

.lang {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.lang-label {
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-right: 0.35rem;
}

.lang-btn {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  padding: 0.3rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.lang-btn.active {
  background: var(--accent-soft);
  border-color: rgba(45, 212, 168, 0.35);
  color: var(--accent);
}

.content {
  padding: 1.5rem 1.75rem 2.5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.menu-btn {
  display: none;
}

.drawer,
.drawer-backdrop {
  display: none;
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .menu-btn {
    display: inline-flex;
  }

  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }

  .drawer {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(280px, 86vw);
    background: var(--bg-elevated);
    border-right: 1px solid var(--border);
    z-index: 45;
    padding: 1.25rem 1rem;
  }
}
</style>
