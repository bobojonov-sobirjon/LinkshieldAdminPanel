import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'

const saved = localStorage.getItem('ls_admin_locale')
const locale = saved === 'ru' || saved === 'en' ? saved : 'en'

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: { en, ru },
})

export function setLocale(next) {
  i18n.global.locale.value = next
  localStorage.setItem('ls_admin_locale', next)
  document.documentElement.lang = next === 'ru' ? 'ru' : 'en'
}

document.documentElement.lang = locale === 'ru' ? 'ru' : 'en'
