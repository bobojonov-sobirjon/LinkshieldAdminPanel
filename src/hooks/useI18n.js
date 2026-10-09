import { useEffect, useState } from 'react'
import { getLocale, setLocale, subscribeLocale, t } from '@/i18n'

export function useI18n() {
  const [locale, setLocal] = useState(getLocale())

  useEffect(() => subscribeLocale(setLocal), [])

  return {
    locale,
    t,
    setLocale,
  }
}
