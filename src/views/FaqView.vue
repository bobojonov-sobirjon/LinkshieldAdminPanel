<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ t('faq.title') }}</h1>
        <p>{{ t('faq.subtitle') }}</p>
      </div>
      <button class="btn btn-primary" type="button" @click="openCreate">
        {{ t('faq.add') }}
      </button>
    </div>

    <div class="toolbar card">
      <input
        v-model="q"
        class="search"
        type="search"
        :placeholder="t('faq.search')"
      />
    </div>

    <div v-if="error" class="alert alert-error" style="margin: 1rem 0">{{ error }}</div>
    <div v-if="flash" class="alert alert-ok" style="margin: 1rem 0">{{ flash }}</div>

    <div class="card table-wrap">
      <div v-if="loading" class="empty">{{ t('common.loading') }}</div>
      <div v-else-if="!filtered.length" class="empty">{{ t('faq.empty') }}</div>
      <table v-else class="data">
        <thead>
          <tr>
            <th>{{ t('faq.slug') }}</th>
            <th>{{ t('faq.category') }}</th>
            <th>{{ t('faq.qEng') }}</th>
            <th>{{ t('faq.sort') }}</th>
            <th>Status</th>
            <th>{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filtered" :key="item.id">
            <td class="mono">{{ item.slug }}</td>
            <td>{{ item.category }}</td>
            <td>
              <div class="q">{{ item.question?.eng }}</div>
              <div class="q muted">{{ item.question?.rus }}</div>
            </td>
            <td class="mono">{{ item.sort_order }}</td>
            <td>
              <span class="badge" :class="item.is_active ? 'badge-ok' : 'badge-off'">
                {{ item.is_active ? t('faq.active') : t('faq.inactive') }}
              </span>
            </td>
            <td class="actions">
              <button class="btn btn-ghost" type="button" @click="openEdit(item)">
                {{ t('faq.edit') }}
              </button>
              <button class="btn btn-danger" type="button" @click="onDelete(item)">
                {{ t('faq.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingId ? t('faq.edit') : t('faq.add') }}</h2>
        <form class="form" @submit.prevent="onSave">
          <div class="grid-2">
            <div class="field">
              <label>{{ t('faq.slug') }}</label>
              <input v-model="form.slug" required maxlength="64" />
            </div>
            <div class="field">
              <label>{{ t('faq.category') }}</label>
              <input v-model="form.category" required maxlength="64" />
            </div>
          </div>
          <div class="grid-2">
            <div class="field">
              <label>{{ t('faq.sort') }}</label>
              <input v-model.number="form.sort_order" type="number" min="0" max="10000" />
            </div>
            <div class="field">
              <label>{{ t('faq.active') }}</label>
              <select v-model="form.is_active">
                <option :value="true">{{ t('faq.active') }}</option>
                <option :value="false">{{ t('faq.inactive') }}</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="field">
              <label>{{ t('faq.qEng') }}</label>
              <textarea v-model="form.question.eng" required />
            </div>
            <div class="field">
              <label>{{ t('faq.qRus') }}</label>
              <textarea v-model="form.question.rus" required />
            </div>
          </div>
          <div class="grid-2">
            <div class="field">
              <label>{{ t('faq.aEng') }}</label>
              <textarea v-model="form.answer.eng" required />
            </div>
            <div class="field">
              <label>{{ t('faq.aRus') }}</label>
              <textarea v-model="form.answer.rus" required />
            </div>
          </div>
          <div v-if="modalError" class="alert alert-error">{{ modalError }}</div>
          <div class="modal-actions">
            <button class="btn btn-ghost" type="button" @click="closeModal">
              {{ t('faq.cancel') }}
            </button>
            <button class="btn btn-primary" type="submit" :disabled="saving">
              {{ saving ? t('common.loading') : t('faq.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createFaq,
  deleteFaq,
  fetchFaqAdmin,
  localizeError,
  updateFaq,
} from '@/api/client'

const { t } = useI18n()

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const flash = ref('')
const modalError = ref('')
const showModal = ref(false)
const editingId = ref(null)
const q = ref('')

const emptyForm = () => ({
  slug: '',
  category: 'general',
  sort_order: 0,
  is_active: true,
  question: { eng: '', rus: '' },
  answer: { eng: '', rus: '' },
})

const form = reactive(emptyForm())

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return items.value
  return items.value.filter((it) => {
    const blob = [
      it.slug,
      it.category,
      it.question?.eng,
      it.question?.rus,
      it.answer?.eng,
      it.answer?.rus,
    ]
      .join(' ')
      .toLowerCase()
    return blob.includes(needle)
  })
})

function resetForm() {
  Object.assign(form, emptyForm())
}

function openCreate() {
  editingId.value = null
  resetForm()
  modalError.value = ''
  showModal.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.slug = item.slug
  form.category = item.category
  form.sort_order = item.sort_order
  form.is_active = item.is_active
  form.question = { eng: item.question?.eng || '', rus: item.question?.rus || '' }
  form.answer = { eng: item.answer?.eng || '', rus: item.answer?.rus || '' }
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await fetchFaqAdmin()
  } catch (e) {
    error.value = localizeError(e)
  } finally {
    loading.value = false
  }
}

async function onSave() {
  saving.value = true
  modalError.value = ''
  const payload = {
    slug: form.slug.trim(),
    category: form.category.trim(),
    sort_order: Number(form.sort_order) || 0,
    is_active: Boolean(form.is_active),
    question: { eng: form.question.eng.trim(), rus: form.question.rus.trim() },
    answer: { eng: form.answer.eng.trim(), rus: form.answer.rus.trim() },
  }
  try {
    if (editingId.value) {
      await updateFaq(editingId.value, payload)
    } else {
      await createFaq(payload)
    }
    flash.value = t('common.saveOk')
    showModal.value = false
    await load()
  } catch (e) {
    modalError.value = localizeError(e)
  } finally {
    saving.value = false
  }
}

async function onDelete(item) {
  if (!window.confirm(t('faq.confirmDelete'))) return
  try {
    await deleteFaq(item.id)
    flash.value = t('common.deleted')
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
  margin-bottom: 1rem;
}

.search {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
  outline: none;
}

.search:focus {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.q {
  max-width: 280px;
  line-height: 1.35;
}

.q.muted {
  margin-top: 0.25rem;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
</style>
