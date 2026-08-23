<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ t('users.title') }}</h1>
        <p>{{ t('users.subtitle') }}</p>
      </div>
      <div class="meta mono">{{ t('users.total') }}: {{ total }}</div>
    </div>

    <div class="toolbar card">
      <input v-model="q" class="search" type="search" :placeholder="t('users.search')" @keyup.enter="reload" />
      <select v-model="role" @change="reload">
        <option value="">{{ t('users.allRoles') }}</option>
        <option value="user">user</option>
        <option value="verified_owner">verified_owner</option>
        <option value="moderator">moderator</option>
        <option value="admin">admin</option>
      </select>
      <button class="btn btn-ghost" type="button" @click="reload">{{ t('dashboard.refresh') }}</button>
    </div>

    <div v-if="error" class="alert alert-error" style="margin: 1rem 0">{{ error }}</div>
    <div v-if="flash" class="alert alert-ok" style="margin: 1rem 0">{{ flash }}</div>

    <div class="card table-wrap">
      <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
      <div v-else-if="!items.length" class="empty">{{ t('users.empty') }}</div>
      <table v-else class="data">
        <thead>
          <tr>
            <th>{{ t('users.name') }}</th>
            <th>{{ t('users.phone') }}</th>
            <th>{{ t('users.email') }}</th>
            <th>{{ t('users.role') }}</th>
            <th>Status</th>
            <th>{{ t('users.created') }}</th>
            <th>{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in items" :key="u.id">
            <td>{{ u.full_name || '—' }}</td>
            <td class="mono">{{ u.phone || '—' }}</td>
            <td>{{ u.email || '—' }}</td>
            <td>
              <select
                v-model="draftRole[u.id]"
                :disabled="!isAdmin"
                :title="isAdmin ? '' : t('users.onlyAdminRole')"
              >
                <option value="user">user</option>
                <option value="verified_owner">verified_owner</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td>
              <span class="badge" :class="u.is_active ? 'badge-ok' : 'badge-off'">
                {{ u.is_active ? t('users.active') : t('users.inactive') }}
              </span>
            </td>
            <td class="mono">{{ formatDate(u.created_at) }}</td>
            <td class="actions">
              <button
                v-if="isAdmin && draftRole[u.id] !== u.role"
                class="btn btn-primary"
                type="button"
                @click="saveRole(u)"
              >
                {{ t('users.saveRole') }}
              </button>
              <button
                class="btn"
                :class="u.is_active ? 'btn-danger' : 'btn-ghost'"
                type="button"
                @click="toggleActive(u)"
              >
                {{ u.is_active ? t('users.inactive') : t('users.active') }}
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchAdminUsers, localizeError, updateAdminUser } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

const items = ref([])
const total = ref(0)
const loading = ref(false)
const error = ref('')
const flash = ref('')
const q = ref('')
const role = ref('')
const limit = 50
const offset = ref(0)
const draftRole = reactive({})

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
    const data = await fetchAdminUsers({
      q: q.value || undefined,
      role: role.value || undefined,
      limit,
      offset: offset.value,
    })
    items.value = data.items || []
    total.value = data.total || 0
    for (const u of items.value) {
      draftRole[u.id] = u.role
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

async function saveRole(u) {
  try {
    await updateAdminUser(u.id, { role: draftRole[u.id] })
    flash.value = t('common.saveOk')
    await load()
  } catch (e) {
    error.value = localizeError(e)
  }
}

async function toggleActive(u) {
  try {
    await updateAdminUser(u.id, { is_active: !u.is_active })
    flash.value = t('common.saveOk')
    await load()
  } catch (e) {
    error.value = localizeError(e)
  }
}

watch(q, () => {})
onMounted(load)
</script>

<style scoped>
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
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.meta {
  color: var(--text-dim);
  font-size: 0.85rem;
}
.pager {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
