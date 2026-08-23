<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ t('reviews.title') }}</h1>
        <p>{{ t('reviews.subtitle') }}</p>
      </div>
      <div class="right">
        <span class="meta mono">{{ t('reviews.total') }}: {{ total }}</span>
        <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">
          {{ t('reviews.refresh') }}
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-error" style="margin-bottom: 1rem">{{ error }}</div>
    <div v-if="flash" class="alert alert-ok" style="margin-bottom: 1rem">{{ flash }}</div>

    <div class="card table-wrap">
      <div v-if="loading && !items.length" class="empty">{{ t('common.loading') }}</div>
      <div v-else-if="!items.length" class="empty">{{ t('reviews.empty') }}</div>
      <table v-else class="data">
        <thead>
          <tr>
            <th>{{ t('reviews.type') }}</th>
            <th>{{ t('reviews.text') }}</th>
            <th>Link</th>
            <th>User</th>
            <th>{{ t('reviews.likes') }}</th>
            <th>{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in items" :key="r.id">
            <td><span class="badge badge-off">{{ r.content_type }}</span></td>
            <td class="text">{{ r.text_content || '—' }}</td>
            <td class="mono short">{{ shortId(r.link_id) }}</td>
            <td class="mono short">{{ shortId(r.user_id) }}</td>
            <td class="mono">{{ r.likes_count }}/{{ r.dislikes_count }}</td>
            <td>
              <button class="btn btn-danger" type="button" @click="onDelete(r)">
                {{ t('faq.delete') }}
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
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteAdminReview, fetchAdminReviews, localizeError } from '@/api/client'

const { t } = useI18n()
const items = ref([])
const total = ref(0)
const loading = ref(false)
const error = ref('')
const flash = ref('')
const limit = 50
const offset = ref(0)

function shortId(id) {
  return id ? String(id).slice(0, 8) : '—'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAdminReviews({ limit, offset: offset.value })
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e) {
    error.value = localizeError(e)
  } finally {
    loading.value = false
  }
}

function prev() {
  offset.value = Math.max(0, offset.value - limit)
  load()
}
function next() {
  offset.value += limit
  load()
}

async function onDelete(r) {
  if (!window.confirm(t('reviews.confirmDelete'))) return
  try {
    await deleteAdminReview(r.id)
    flash.value = t('common.deleted')
    await load()
  } catch (e) {
    error.value = localizeError(e)
  }
}

onMounted(load)
</script>

<style scoped>
.right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.meta {
  color: var(--text-dim);
  font-size: 0.85rem;
}
.text {
  max-width: 320px;
  line-height: 1.35;
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
