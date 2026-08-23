<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ t('billing.title') }}</h1>
        <p>{{ t('billing.subtitle') }}</p>
      </div>
      <div class="right">
        <span class="meta mono">{{ t('billing.total') }}: {{ total }}</span>
        <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">
          {{ t('billing.refresh') }}
        </button>
      </div>
    </div>

    <div class="toolbar card">
      <select v-model="status" @change="reload">
        <option value="">{{ t('billing.allStatus') }}</option>
        <option value="pending">pending</option>
        <option value="completed">completed</option>
        <option value="failed">failed</option>
        <option value="cancelled">cancelled</option>
      </select>
    </div>

    <div v-if="error" class="alert alert-error" style="margin: 1rem 0">{{ error }}</div>
    <div v-if="flash" class="alert alert-ok" style="margin: 1rem 0">{{ flash }}</div>

    <div class="card table-wrap">
      <div v-if="loading && !items.length" class="empty">{{ t('common.loading') }}</div>
      <div v-else-if="!items.length" class="empty">{{ t('billing.empty') }}</div>
      <table v-else class="data">
        <thead>
          <tr>
            <th>{{ t('billing.amount') }}</th>
            <th>{{ t('billing.method') }}</th>
            <th>{{ t('billing.service') }}</th>
            <th>{{ t('billing.status') }}</th>
            <th>{{ t('billing.user') }}</th>
            <th>{{ t('billing.created') }}</th>
            <th>{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id">
            <td class="mono">{{ p.amount }} {{ p.currency }}</td>
            <td>{{ p.payment_method }}</td>
            <td>{{ p.service_type }}</td>
            <td>
              <select v-model="draftStatus[p.id]">
                <option value="pending">pending</option>
                <option value="completed">completed</option>
                <option value="failed">failed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </td>
            <td class="mono short">{{ shortId(p.user_id) }}</td>
            <td class="mono">{{ formatDate(p.created_at) }}</td>
            <td>
              <button
                v-if="draftStatus[p.id] !== p.status"
                class="btn btn-primary"
                type="button"
                @click="saveStatus(p)"
              >
                {{ t('billing.update') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager" v-if="total > limit">
      <button class="btn btn-ghost" type="button" :disabled="offset <= 0" @click="prev">
        {{ t('common.prev') }}
      </button>
      <button class="btn btn-ghost" type="button" :disabled="offset + limit >= total" @click="next">
        {{ t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchAdminPayments, localizeError, updateAdminPayment } from '@/api/client'

const { t } = useI18n()
const items = ref([])
const total = ref(0)
const loading = ref(false)
const error = ref('')
const flash = ref('')
const status = ref('')
const limit = 50
const offset = ref(0)
const draftStatus = reactive({})

function shortId(id) {
  return id ? String(id).slice(0, 8) : '—'
}
function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return String(v)
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAdminPayments({
      status: status.value || undefined,
      limit,
      offset: offset.value,
    })
    items.value = data.items || []
    total.value = data.total || 0
    for (const p of items.value) {
      draftStatus[p.id] = p.status
    }
  } catch (e) {
    error.value = localizeError(e)
  } finally {
    loading.value = false
  }
}

function reload() {
  offset.value = 0
  load()
}
function prev() {
  offset.value = Math.max(0, offset.value - limit)
  load()
}
function next() {
  offset.value += limit
  load()
}

async function saveStatus(p) {
  try {
    await updateAdminPayment(p.id, { status: draftStatus[p.id] })
    flash.value = t('common.saveOk')
    await load()
  } catch (e) {
    error.value = localizeError(e)
  }
}

onMounted(load)
</script>

<style scoped>
.toolbar {
  padding: 0.85rem 1rem;
  margin-bottom: 0;
}
.right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.meta {
  color: var(--text-dim);
  font-size: 0.85rem;
}
select {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
}
.short {
  font-size: 0.78rem;
}
.pager {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
