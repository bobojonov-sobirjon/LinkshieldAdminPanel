import en from './locales/en.json'
import ru from './locales/ru.json'

const messages = { en, ru }
const listeners = new Set()

function readSaved() {
  const saved = localStorage.getItem('ls_admin_locale')
  return saved === 'ru' ? 'ru' : 'en'
}

let locale = readSaved()
document.documentElement.lang = locale

export function getLocale() {
  return locale
}

export function setLocale(next) {
  locale = next === 'ru' ? 'ru' : 'en'
  localStorage.setItem('ls_admin_locale', locale)
  document.documentElement.lang = locale
  listeners.forEach((fn) => fn(locale))
}

export function subscribeLocale(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function lookup(dict, path) {
  return path.split('.').reduce((node, key) => (node == null ? node : node[key]), dict)
}

export function t(key, vars) {
  let text = lookup(messages[locale], key)
  if (typeof text !== 'string') text = lookup(messages.en, key)
  if (typeof text !== 'string') return key
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}
