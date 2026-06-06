<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { adminListUsers, adminUpdateUserRole } from '@/api/user'

const auth = useAuthStore()
const localeStore = useLocaleStore()
const { t } = storeToRefs(localeStore)

interface AdminUser {
  id: string
  username: string
  nickname: string
  userrole: number
  registerDateInString: string
}

const users = ref<AdminUser[]>([])
const loading = ref(false)
const loadError = ref('')
const searchQuery = ref('')
const savingId = ref<string | null>(null)
const snackbar = reactive({ show: false, text: '', color: 'success' as 'success' | 'error' })

const roleOptions = computed(() =>
  [1, 2, 3, 4, 5, 6].map(r => ({
    value: r,
    title: t.value.admin.roleLabels[r as keyof typeof t.value.admin.roleLabels]
  }))
)

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.username.toLowerCase().includes(q) ||
    u.nickname.toLowerCase().includes(q)
  )
})

function showSnackbar (text: string, color: 'success' | 'error') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

async function loadUsers () {
  loading.value = true
  loadError.value = ''
  try {
    const res = await adminListUsers()
    if (res.status === 200) {
      users.value = res.users ?? []
    }
  } catch {
    loadError.value = t.value.admin.roleUpdateError
  } finally {
    loading.value = false
  }
}

async function saveRole (user: AdminUser) {
  if (savingId.value) return
  savingId.value = user.id
  try {
    const res = await adminUpdateUserRole(user.id, user.userrole)
    if (res.status === 200) {
      showSnackbar(t.value.admin.roleUpdated, 'success')
    } else {
      showSnackbar(t.value.admin.roleUpdateError, 'error')
    }
  } catch {
    showSnackbar(t.value.admin.roleUpdateError, 'error')
  } finally {
    savingId.value = null
  }
}

function secretCapLabel (role: number) {
  const cap = Math.min(role, 3)
  const labels = [
    t.value.editor.secretPublic,
    t.value.editor.secretNormal,
    t.value.editor.secretSecret,
    t.value.editor.secretDark
  ]
  return labels[cap] ?? String(cap)
}

onMounted(loadUsers)
</script>

<template>
  <v-container class="lothric-container py-6">
    <h2 class="text-h5 font-weight-medium mb-1">{{ t.admin.title }}</h2>
    <p class="text-body-medium text-medium-emphasis mb-6">{{ t.admin.subtitle }}</p>

    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">{{ loadError }}</v-alert>

    <div class="lothric-panel mb-6">
      <v-text-field
        v-model="searchQuery"
        :placeholder="t.admin.searchPlaceholder"
        prepend-inner-icon="mdi-magnify"
        variant="underlined"
        hide-details
        density="compact"
        class="mb-4"
        clearable
      />

      <v-progress-linear v-if="loading" indeterminate color="secondary" class="mb-3" />

      <p v-else-if="!filteredUsers.length" class="text-medium-emphasis text-center py-4">
        {{ t.admin.noUsers }}
      </p>

      <div v-else class="lothric-admin-list">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="lothric-admin-row"
          :class="{ 'lothric-admin-row--self': user.id === auth.userName }"
        >
          <div class="lothric-admin-row__identity">
            <div class="lothric-admin-row__name">
              <span class="font-weight-medium">{{ user.nickname }}</span>
              <span v-if="user.nickname !== user.username" class="text-medium-emphasis ml-1 text-body-small">
                @{{ user.username }}
              </span>
              <v-chip
                v-if="user.username === auth.userName"
                size="x-small"
                color="secondary"
                variant="tonal"
                class="ml-2"
              >
                {{ t.admin.selfEditWarning }}
              </v-chip>
            </div>
            <div class="text-body-small text-medium-emphasis">
              {{ t.admin.registered }}: {{ user.registerDateInString || '—' }}
            </div>
          </div>

          <div class="lothric-admin-row__level-cap text-body-small text-medium-emphasis">
            <v-icon size="14" class="mr-1">mdi-shield-key-outline</v-icon>
            {{ secretCapLabel(user.userrole) }}
          </div>

          <div class="lothric-admin-row__actions">
            <v-select
              v-model="user.userrole"
              :items="roleOptions"
              item-value="value"
              item-title="title"
              variant="outlined"
              density="compact"
              hide-details
              class="lothric-admin-role-select"
              :disabled="savingId === user.id"
            />
            <v-btn
              class="lothric-btn-action ml-2"
              size="small"
              :loading="savingId === user.id"
              @click="saveRole(user)"
            >
              {{ t.admin.saveRole }}
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom" :timeout="2500" rounded="lg">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.lothric-admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lothric-admin-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--lothric-border);
  background: color-mix(in srgb, var(--lothric-surface) 80%, transparent);
  transition: border-color 0.2s ease;
}

.lothric-admin-row:hover {
  border-color: color-mix(in srgb, var(--lothric-edit) 35%, transparent);
}

.lothric-admin-row--self {
  border-color: color-mix(in srgb, var(--lothric-edit) 30%, transparent);
}

.lothric-admin-row__identity {
  min-width: 0;
}

.lothric-admin-row__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 2px;
}

.lothric-admin-row__level-cap {
  white-space: nowrap;
  opacity: 0.8;
}

.lothric-admin-row__actions {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.lothric-admin-role-select {
  min-width: 180px;
}

@media (max-width: 720px) {
  .lothric-admin-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .lothric-admin-row__actions {
    flex-wrap: wrap;
  }

  .lothric-admin-role-select {
    min-width: 100%;
  }
}
</style>
