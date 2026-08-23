<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ t('links.title') }}</h1>
        <p>{{ t('links.subtitle') }}</p>
      </div>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">
        {{ t('links.refresh') }}
      </button>
    </div>

    <div class="tabs">
      <button type="button" class="tab" :class="{ active: tab === 'links' }" @click="tab = 'links'">
        {{ t('links.tabLinks') }}
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: tab === 'ownerships' }"
        @click="tab = 'ownerships'"
      >
        {{ t('links.tabOwnerships') }}
      </button>
    </div>

    <div v-if="error" class="alert alert-error" style="margin: 1rem 0">{{ error }}</div>
    <div v-if="flash" class="alert alert-ok" style="margin: 1rem 0">{{ flash }}</div>

    <template v-if="tab === 'links'">
      <div class="toolbar card">
        <input
          v-model="linkQ"
          class="search"
          type="search"
          :placeholder="t('links.search')"
          @keyup.enter="reloadLinks"
        />
        <select v-model="risk" @change="reloadLinks">
          <option value="">{{ t('links.allRisk') }}</option>
          <option value="safe">safe</option>
          <option value="suspicious">suspicious</option>
          <option value="phishing">phishing</option>
          <option value="unchecked">unchecked</option>
        </select>
        <span class="meta mono">{{ t('links.total') }}: {{ linkTotal }}</span>
      </div>
      <div class="card table-wrap">
        <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
        <div v-else-if="!links.length" class="empty">{{ t('links.emptyLinks') }}</div>
        <table v-else class="data">
          <thead>
            <tr>
              <th>{{ t('links.domain') }}</th>
              <th>{{ t('links.url') }}</th>
              <th>{{ t('links.risk') }}</th>
              <th>User</th>
              <th>{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in links" :key="l.id">
              <td>{{ l.domain }}</td>
              <td class="url">
                <a :href="l.url" target="_blank" rel="noopener">{{ l.url }}</a>
              </td>
              <td>
                <select v-model="draftRisk[l.id]">
                  <option value="safe">safe</option>
                  <option value="suspicious">suspicious</option>
                  <option value="phishing">phishing</option>
                  <option value="unchecked">unchecked</option>
                </select>
              </td>
              <td class="mono short">{{ shortId(l.user_id) }}</td>
              <td>
                <button
                  v-if="draftRisk[l.id] !== l.risk_status"
                  class="btn btn-primary"
                  type="button"
                  @click="saveRisk(l)"
                >
                  {{ t('faq.save') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else>
      <div class="toolbar card">
        <label class="check">
          <input v-model="pendingOnly" type="checkbox" @change="reloadOwn" />
          {{ t('links.pendingOnly') }}
        </label>
        <span class="meta mono">{{ t('links.total') }}: {{ ownTotal }}</span>
      </div>
      <div class="card table-wrap">
        <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
        <div v-else-if="!ownerships.length" class="empty">{{ t('links.emptyOwn') }}</div>
        <table v-else class="data">
          <thead>
            <tr>
              <th>Link</th>
              <th>{{ t('links.owner') }}</th>
              <th>Status</th>
              <th>{{ t('links.paid') }}</th>
              <th>{{ t('links.expires') }}</th>
              <th>{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in ownerships" :key="o.id">
              <td class="mono short">{{ shortId(o.link_id) }}</td>
              <td class="mono short">{{ shortId(o.owner_id) }}</td>
              <td>
                <span
                  class="badge"
                  :class="
                    o.verification_status === 'verified'
                      ? 'badge-ok'
                      : o.verification_status === 'pending'
                        ? 'badge-warn'
                        : 'badge-off'
                  "
                >
                  {{ o.verification_status }}
                </span>
              </td>
              <td class="mono">{{ o.amount_paid }}</td>
              <td class="mono">{{ formatDate(o.expires_at) }}</td>
              <td class="actions">
                <button
                  v-if="o.verification_status !== 'verified'"
                  class="btn btn-primary"
                  type="button"
                  @click="setOwn(o, 'verified')"
                >
                  {{ t('links.verify') }}
                </button>
                <button
                  v-if="o.verification_status !== 'rejected'"
                  class="btn btn-danger"
                  type="button"
                  @click="setOwn(o, 'rejected')"
                >
                  {{ t('links.reject') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  fetchAdminLinks,
  fetchAdminOwnerships,
  localizeError,
  updateAdminLink,
  updateAdminOwnership,
} from '@/api/client'

const { t } = useI18n()
const tab = ref('links')
const loading = ref(false)
const error = ref('')
const flash = ref('')

const links = ref([])
const linkTotal = ref(0)
const linkQ = ref('')
const risk = ref('')
const draftRisk = reactive({})

const ownerships = ref([])
const ownTotal = ref(0)
const pendingOnly = ref(true)

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

async function loadLinks() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAdminLinks({
      q: linkQ.value || undefined,
      risk_status: risk.value || undefined,
      limit: 50,
      offset: 0,
    })
    links.value = data.items || []
    linkTotal.value = data.total || 0
    for (const l of links.value) draftRisk[l.id] = l.risk_status
  } catch (e) {
    error.value = localizeError(e)
  } finally {
    loading.value = false
  }
}

async function loadOwn() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAdminOwnerships({
      status: pendingOnly.value ? 'pending' : undefined,
      limit: 50,
      offset: 0,
    })
    ownerships.value = data.items || []
    ownTotal.value = data.total || 0
  } catch (e) {
    error.value = localizeError(e)
  } finally {
    loading.value = false
  }
}

function load() {
  return tab.value === 'links' ? loadLinks() : loadOwn()
}
function reloadLinks() {
  loadLinks()
}
function reloadOwn() {
  loadOwn()
}

async function saveRisk(l) {
  try {
    await updateAdminLink(l.id, { risk_status: draftRisk[l.id] })
    flash.value = t('common.saveOk')
    await loadLinks()
  } catch (e) {
    error.value = localizeError(e)
  }
}

async function setOwn(o, status) {
  try {
    await updateAdminOwnership(o.id, { status })
    flash.value = t('common.saveOk')
    await loadOwn()
  } catch (e) {
    error.value = localizeError(e)
  }
}

watch(tab, () => load())
onMounted(load)
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 1rem;
}
.tab {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-weight: 600;
  font-size: 0.88rem;
}
.tab.active {
  background: var(--accent-soft);
  border-color: rgba(45, 212, 168, 0.35);
  color: var(--accent);
}
.toolbar {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  align-items: center;
}
.search {
  flex: 1;
  min-width: 180px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.8rem;
}
select {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
}
.meta {
  color: var(--text-dim);
  font-size: 0.85rem;
}
.url {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.url a {
  color: var(--accent);
}
.short {
  font-size: 0.78rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
