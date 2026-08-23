<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ t('ads.title') }}</h1>
        <p>{{ t('ads.subtitle') }}</p>
      </div>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">
        {{ t('ads.refresh') }}
      </button>
    </div>

    <div v-if="error" class="alert alert-error" style="margin-bottom: 1rem">{{ error }}</div>

    <div class="card table-wrap">
      <div v-if="loading && !slots.length" class="empty">{{ t('common.loading') }}</div>
      <div v-else-if="!slots.length" class="empty">{{ t('ads.empty') }}</div>
      <table v-else class="data">
        <thead>
          <tr>
            <th>{{ t('ads.slot') }}</th>
            <th>{{ t('ads.country') }}</th>
            <th>{{ t('ads.status') }}</th>
            <th>{{ t('ads.remaining') }}</th>
            <th>{{ t('ads.expires') }}</th>
            <th>{{ t('ads.media') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in slots" :key="s.id">
            <td class="mono">#{{ s.slot_number }}</td>
            <td>{{ s.target_country || '—' }}</td>
            <td>
              <span class="badge" :class="s.is_available ? 'badge-ok' : 'badge-warn'">
                {{ s.is_available ? t('ads.free') : t('ads.booked') }}
              </span>
            </td>
            <td class="mono">
              {{ s.seconds_remaining == null ? '—' : formatSeconds(s.seconds_remaining) }}
            </td>
            <td class="mono">{{ formatDate(s.slot_expires_at) }}</td>
            <td>
              <a
                v-if="s.media_url"
                class="media-link"
                :href="s.media_url"
                target="_blank"
                rel="noopener"
              >
                open
              </a>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchAdsSlots, localizeError } from '@/api/client'

const { t } = useI18n()
const slots = ref([])
const loading = ref(false)
const error = ref('')

function formatSeconds(sec) {
  const s = Math.max(0, Number(sec) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${r}s`
  return `${r}s`
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return String(value)
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAdsSlots()
    slots.value = Array.isArray(data)
      ? [...data].sort((a, b) => a.slot_number - b.slot_number)
      : []
  } catch (e) {
    error.value = localizeError(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.media-link {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.85rem;
}
</style>
