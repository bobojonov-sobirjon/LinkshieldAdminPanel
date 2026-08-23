<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ t('dashboard.title') }}</h1>
        <p>{{ t('dashboard.subtitle') }}</p>
      </div>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">
        {{ t('dashboard.refresh') }}
      </button>
    </div>

    <div v-if="error" class="alert alert-error" style="margin-bottom: 1rem">{{ error }}</div>

    <div class="stats">
      <div class="stat card">
        <div class="stat-label">{{ t('dashboard.online') }}</div>
        <div class="stat-value">{{ geo?.world_online ?? '—' }}</div>
      </div>
      <div class="stat card">
        <div class="stat-label">{{ t('dashboard.cities') }}</div>
        <div class="stat-value">{{ cityCount }}</div>
      </div>
      <div class="stat card">
        <div class="stat-label">{{ t('dashboard.slotsFree') }}</div>
        <div class="stat-value ok">{{ freeSlots }}</div>
      </div>
      <div class="stat card">
        <div class="stat-label">{{ t('dashboard.slotsBusy') }}</div>
        <div class="stat-value warn">{{ busySlots }}</div>
      </div>
      <div class="stat card">
        <div class="stat-label">{{ t('dashboard.faqCount') }}</div>
        <div class="stat-value">{{ faqCount }}</div>
      </div>
    </div>

    <div class="panels">
      <section class="card panel">
        <h2>{{ t('dashboard.geoTitle') }}</h2>
        <div v-if="loading && !geo" class="empty">{{ t('common.loading') }}</div>
        <div v-else-if="!cityEntries.length" class="empty">{{ t('dashboard.noCities') }}</div>
        <ul v-else class="city-list">
          <li v-for="[city, n] in cityEntries" :key="city">
            <span>{{ city }}</span>
            <strong class="mono">{{ n }}</strong>
          </li>
        </ul>
      </section>

      <section class="card panel">
        <h2>{{ t('dashboard.adsTitle') }}</h2>
        <div class="slot-grid">
          <div
            v-for="s in slots"
            :key="s.id"
            class="mini-slot"
            :class="{ free: s.is_available }"
            :title="`#${s.slot_number}`"
          >
            {{ s.slot_number }}
          </div>
        </div>
        <p class="hint">
          <span class="dot free" /> {{ t('ads.free') }}
          <span class="dot busy" /> {{ t('ads.booked') }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  fetchAdsSlots,
  fetchFaqAdmin,
  fetchGeoStats,
  localizeError,
} from '@/api/client'

const { t } = useI18n()
const loading = ref(false)
const error = ref('')
const geo = ref(null)
const slots = ref([])
const faqCount = ref(0)

const cityEntries = computed(() => {
  const cities = geo.value?.cities || {}
  return Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 12)
})
const cityCount = computed(() => Object.keys(geo.value?.cities || {}).length)
const freeSlots = computed(() => slots.value.filter((s) => s.is_available).length)
const busySlots = computed(() => slots.value.filter((s) => !s.is_available).length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [g, s, faqs] = await Promise.all([
      fetchGeoStats(),
      fetchAdsSlots(),
      fetchFaqAdmin(),
    ])
    geo.value = g
    slots.value = Array.isArray(s) ? s : []
    faqCount.value = faqs.length
  } catch (e) {
    error.value = localizeError(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.stat {
  padding: 1rem 1.1rem;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  margin-top: 0.45rem;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.stat-value.ok {
  color: var(--ok);
}

.stat-value.warn {
  color: var(--warn);
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.panel {
  padding: 1.1rem 1.2rem 1.25rem;
}

.panel h2 {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 650;
}

.city-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.city-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.18);
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.45rem;
}

.mini-slot {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(230, 180, 80, 0.15);
  color: var(--warn);
  font-weight: 700;
  font-size: 0.85rem;
  border: 1px solid rgba(230, 180, 80, 0.25);
}

.mini-slot.free {
  background: rgba(124, 255, 178, 0.1);
  color: var(--ok);
  border-color: rgba(124, 255, 178, 0.22);
}

.hint {
  margin: 0.9rem 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.free {
  background: var(--ok);
}

.dot.busy {
  background: var(--warn);
}

@media (max-width: 980px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .panels {
    grid-template-columns: 1fr;
  }
}
</style>
