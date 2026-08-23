<template>
  <div class="login-page">
    <div class="login-card card">
      <div class="login-brand">
        <div class="mark">LS</div>
        <div>
          <h1>{{ t('brand') }}</h1>
          <p>{{ t('login.subtitle') }}</p>
        </div>
      </div>

      <div class="lang-row">
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

      <form class="form" @submit.prevent="onSubmit">
        <div class="field">
          <label for="phone">{{ t('login.phone') }}</label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            autocomplete="username"
            :placeholder="t('login.hint')"
            required
          />
        </div>
        <div class="field">
          <label for="password">{{ t('login.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button class="btn btn-primary submit" type="submit" :disabled="loading">
          {{ loading ? t('common.loading') : t('login.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { localizeError } from '@/api/client'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const phone = ref('+998700000001')
const password = ref('')
const loading = ref(false)
const error = ref('')

function switchLang(code) {
  setLocale(code)
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(phone.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect || '/')
  } catch (e) {
    if (e?.code === 'FORBIDDEN_ROLE') {
      error.value = t('login.forbidden')
    } else {
      error.value = localizeError(e)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background:
    radial-gradient(800px 400px at 20% 0%, rgba(45, 212, 168, 0.12), transparent 60%),
    radial-gradient(700px 380px at 90% 100%, rgba(20, 70, 55, 0.35), transparent 55%),
    var(--bg);
}

.login-card {
  width: min(420px, 100%);
  padding: 1.75rem;
  box-shadow: var(--shadow);
}

.login-brand {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  margin-bottom: 1.25rem;
}

.mark {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: var(--accent);
  color: #06241c;
  letter-spacing: -0.04em;
}

.login-brand h1 {
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
}

.login-brand p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.4;
}

.lang-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}

.lang-btn {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.lang-btn.active {
  background: var(--accent-soft);
  border-color: rgba(45, 212, 168, 0.35);
  color: var(--accent);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.submit {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.75rem 1rem;
}
</style>
