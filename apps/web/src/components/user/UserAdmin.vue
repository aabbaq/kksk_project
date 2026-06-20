<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { getSiteSettings, updateSiteSettings } from '@/api/settings'
import type { QuotaLimits } from '@/api/settings'
import {
  adminCreateInvite,
  adminDeleteInvite,
  adminGetUserQuotas,
  adminListInvites,
  adminListUsers,
  adminUpdateUserQuotas,
  adminUpdateUserRole
} from '@/api/user'

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

interface InviteRow {
  code: string
  maxUses: number
  usedCount: number
  expiresAt: string | null
  note: string
}

const users = ref<AdminUser[]>([])
const invites = ref<InviteRow[]>([])
const loading = ref(false)
const loadError = ref('')
const searchQuery = ref('')
const savingId = ref<string | null>(null)
const snackbar = reactive({ show: false, text: '', color: 'success' as 'success' | 'error' })

const siteDraft = reactive({
  imageStorageObjectStore: false,
  requireInviteCode: false,
  defaultQuotas: { maxArticles: 10, maxDrafts: 5, maxCoverImages: 20 } as QuotaLimits,
  objectStoreAvailable: false,
  environment: 'development',
  effectiveDriver: 'local' as 'local' | 'oss'
})

const inviteDraft = reactive({ maxUses: 1, expiresInDays: undefined as number | undefined, note: '' })

const userDialog = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const quotaDraft = reactive({ maxArticles: 10, maxDrafts: 5, maxCoverImages: 20 })
const quotaUsage = reactive({ articles: 0, drafts: 0, coverImages: 0 })
const quotaLoading = ref(false)

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

const effectiveDriverLabel = computed(() => (
  siteDraft.effectiveDriver === 'oss'
    ? t.value.settings.imageStorageObject
    : t.value.settings.imageStorageLocal
))

function showSnackbar (text: string, color: 'success' | 'error') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

function formatLimit (value: number) {
  return value === -1 ? t.value.admin.unlimited : String(value)
}

async function loadSiteSettings () {
  const res = await getSiteSettings()
  if (res.status === 200) {
    siteDraft.imageStorageObjectStore = res.imageStorageObjectStore
    siteDraft.requireInviteCode = res.requireInviteCode
    siteDraft.defaultQuotas = { ...res.defaultQuotas }
    siteDraft.objectStoreAvailable = res.capabilities.objectStore
    siteDraft.environment = res.capabilities.environment
    siteDraft.effectiveDriver = res.effectiveDriver
  }
}

async function loadUsers () {
  loading.value = true
  loadError.value = ''
  try {
    const res = await adminListUsers()
    if (res.status === 200) users.value = res.users ?? []
  } catch {
    loadError.value = t.value.admin.roleUpdateError
  } finally {
    loading.value = false
  }
}

async function loadInvites () {
  const res = await adminListInvites()
  if (res.status === 200) invites.value = res.invites ?? []
}

async function saveSiteSettings () {
  try {
    const res = await updateSiteSettings({
      imageStorageObjectStore: siteDraft.imageStorageObjectStore,
      requireInviteCode: siteDraft.requireInviteCode,
      defaultQuotas: { ...siteDraft.defaultQuotas }
    })
    if (res.status === 200) {
      siteDraft.effectiveDriver = res.effectiveDriver
      showSnackbar(t.value.admin.siteSettingsSaved, 'success')
    } else {
      showSnackbar(t.value.admin.siteSettingsError, 'error')
    }
  } catch {
    showSnackbar(t.value.admin.siteSettingsError, 'error')
  }
}

async function createInvite () {
  const res = await adminCreateInvite({
    maxUses: inviteDraft.maxUses,
    expiresInDays: inviteDraft.expiresInDays,
    note: inviteDraft.note || undefined
  })
  if (res.status === 200) {
    showSnackbar(t.value.admin.inviteCreated, 'success')
    inviteDraft.note = ''
    await loadInvites()
  }
}

async function deleteInvite (code: string) {
  const res = await adminDeleteInvite(code)
  if (res.status === 200) {
    showSnackbar(t.value.admin.inviteDeleted, 'success')
    await loadInvites()
  }
}

async function saveRole (user: AdminUser) {
  if (savingId.value) return
  savingId.value = user.id
  try {
    const res = await adminUpdateUserRole(user.id, user.userrole)
    showSnackbar(
      res.status === 200 ? t.value.admin.roleUpdated : t.value.admin.roleUpdateError,
      res.status === 200 ? 'success' : 'error'
    )
  } catch {
    showSnackbar(t.value.admin.roleUpdateError, 'error')
  } finally {
    savingId.value = null
  }
}

async function openUserDialog (user: AdminUser) {
  selectedUser.value = user
  userDialog.value = true
  quotaLoading.value = true
  try {
    const res = await adminGetUserQuotas(user.id)
    if (res.status === 200) {
      quotaDraft.maxArticles = res.quotas.limits.maxArticles
      quotaDraft.maxDrafts = res.quotas.limits.maxDrafts
      quotaDraft.maxCoverImages = res.quotas.limits.maxCoverImages
      quotaUsage.articles = res.quotas.usage.articles
      quotaUsage.drafts = res.quotas.usage.drafts
      quotaUsage.coverImages = res.quotas.usage.coverImages
    }
  } finally {
    quotaLoading.value = false
  }
}

async function saveUserQuotas () {
  if (!selectedUser.value) return
  savingId.value = selectedUser.value.id
  try {
    const res = await adminUpdateUserQuotas(selectedUser.value.id, { ...quotaDraft })
    showSnackbar(
      res.status === 200 ? t.value.admin.quotasUpdated : t.value.admin.quotasUpdateError,
      res.status === 200 ? 'success' : 'error'
    )
  } catch {
    showSnackbar(t.value.admin.quotasUpdateError, 'error')
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

onMounted(async () => {
  await Promise.all([loadSiteSettings(), loadUsers(), loadInvites()])
})
</script>

<template>
  <v-container class="lothric-container py-6">
    <h2 class="text-h5 font-weight-medium mb-1">{{ t.admin.title }}</h2>
    <p class="text-body-medium text-medium-emphasis mb-6">{{ t.admin.subtitle }}</p>

    <section class="lothric-panel mb-6">
      <h3 class="text-subtitle-1 font-weight-medium mb-1">{{ t.admin.siteSettings }}</h3>
      <p class="text-body-small text-medium-emphasis mb-4">{{ t.admin.siteSettingsHint }}</p>

      <div class="lothric-admin-setting-row mb-4">
        <div>
          <div class="font-weight-medium">{{ t.settings.imageStorageObject }}</div>
          <div class="text-body-small text-medium-emphasis">{{ t.settings.imageStorageObjectDesc }}</div>
        </div>
        <v-switch
          v-model="siteDraft.imageStorageObjectStore"
          color="secondary"
          hide-details
          :disabled="!siteDraft.objectStoreAvailable"
        />
      </div>

      <p v-if="!siteDraft.objectStoreAvailable" class="text-body-small text-warning mb-4">
        {{ t.settings.imageStorageUnavailable }}
      </p>
      <p class="text-body-small text-medium-emphasis mb-4">
        {{ t.settings.imageStorageEffective.replace('{driver}', effectiveDriverLabel) }}
        <span v-if="siteDraft.environment">({{ siteDraft.environment }})</span>
      </p>

      <div class="lothric-admin-setting-row mb-4">
        <div>
          <div class="font-weight-medium">{{ t.admin.inviteRequired }}</div>
          <div class="text-body-small text-medium-emphasis">{{ t.admin.inviteRequiredDesc }}</div>
        </div>
        <v-switch v-model="siteDraft.requireInviteCode" color="secondary" hide-details />
      </div>

      <h4 class="text-body-large font-weight-medium mb-2">{{ t.admin.defaultQuotas }}</h4>
      <p class="text-body-small text-medium-emphasis mb-3">{{ t.admin.defaultQuotasHint }}</p>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field v-model.number="siteDraft.defaultQuotas.maxArticles" type="number" :label="t.admin.maxArticles" density="compact" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model.number="siteDraft.defaultQuotas.maxDrafts" type="number" :label="t.admin.maxDrafts" density="compact" />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model.number="siteDraft.defaultQuotas.maxCoverImages" type="number" :label="t.admin.maxCoverImages" density="compact" />
        </v-col>
      </v-row>

      <v-btn class="lothric-btn-action mt-2" @click="saveSiteSettings">{{ t.admin.saveSiteSettings }}</v-btn>
    </section>

    <section class="lothric-panel mb-6">
      <h3 class="text-subtitle-1 font-weight-medium mb-1">{{ t.admin.invites }}</h3>
      <p class="text-body-small text-medium-emphasis mb-4">{{ t.admin.invitesHint }}</p>

      <v-row dense class="mb-4">
        <v-col cols="12" sm="3">
          <v-text-field v-model.number="inviteDraft.maxUses" type="number" :label="t.admin.inviteMaxUses" density="compact" />
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field v-model.number="inviteDraft.expiresInDays" type="number" :label="t.admin.inviteExpiresDays" density="compact" clearable />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="inviteDraft.note" :label="t.admin.inviteNote" density="compact" clearable />
        </v-col>
        <v-col cols="12" sm="2" class="d-flex align-center">
          <v-btn class="lothric-btn-action" block @click="createInvite">{{ t.admin.createInvite }}</v-btn>
        </v-col>
      </v-row>

      <div v-if="invites.length" class="lothric-admin-invite-list">
        <div v-for="invite in invites" :key="invite.code" class="lothric-admin-invite-row">
          <code class="lothric-admin-invite-code">{{ invite.code }}</code>
          <span class="text-body-small">{{ invite.usedCount }} / {{ invite.maxUses }}</span>
          <span class="text-body-small text-medium-emphasis">{{ invite.expiresAt ?? '—' }}</span>
          <v-btn size="small" variant="text" color="error" @click="deleteInvite(invite.code)">{{ t.admin.inviteDelete }}</v-btn>
        </div>
      </div>
    </section>

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
          :class="{ 'lothric-admin-row--self': user.username === auth.userName }"
        >
          <div class="lothric-admin-row__identity">
            <div class="lothric-admin-row__name">
              <span class="font-weight-medium">{{ user.nickname }}</span>
              <span v-if="user.nickname !== user.username" class="text-medium-emphasis ml-1 text-body-small">
                @{{ user.username }}
              </span>
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
            <v-btn class="lothric-btn-action ml-2" size="small" :loading="savingId === user.id" @click="saveRole(user)">
              {{ t.admin.saveRole }}
            </v-btn>
            <v-btn class="lothric-btn-blend ml-2" size="small" variant="text" @click="openUserDialog(user)">
              {{ t.admin.manageUser }}
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="userDialog" max-width="520">
      <v-card v-if="selectedUser" class="lothric-card pa-4">
        <v-card-title class="px-0 pt-0">{{ t.admin.userQuotas }} — {{ selectedUser.nickname }}</v-card-title>
        <v-card-text class="px-0">
          <p class="text-body-small text-medium-emphasis mb-4">{{ t.admin.userQuotasHint }}</p>
          <v-progress-linear v-if="quotaLoading" indeterminate color="secondary" class="mb-4" />
          <template v-else>
            <p class="text-body-small mb-3">
              {{ t.admin.quotaUsage }}:
              {{ quotaUsage.articles }}/{{ formatLimit(quotaDraft.maxArticles) }} ·
              {{ quotaUsage.drafts }}/{{ formatLimit(quotaDraft.maxDrafts) }} ·
              {{ quotaUsage.coverImages }}/{{ formatLimit(quotaDraft.maxCoverImages) }}
            </p>
            <v-text-field v-model.number="quotaDraft.maxArticles" type="number" :label="t.admin.maxArticles" density="compact" class="mb-2" />
            <v-text-field v-model.number="quotaDraft.maxDrafts" type="number" :label="t.admin.maxDrafts" density="compact" class="mb-2" />
            <v-text-field v-model.number="quotaDraft.maxCoverImages" type="number" :label="t.admin.maxCoverImages" density="compact" />
          </template>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-spacer />
          <v-btn variant="text" @click="userDialog = false">Cancel</v-btn>
          <v-btn class="lothric-btn-action" :loading="savingId === selectedUser.id" @click="saveUserQuotas">
            {{ t.admin.saveQuotas }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom" :timeout="2500" rounded="lg">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.lothric-admin-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.lothric-admin-invite-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lothric-admin-invite-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--lothric-border);
}

.lothric-admin-invite-code {
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
}

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
}

.lothric-admin-row__identity { min-width: 0; }

.lothric-admin-row__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 2px;
}

.lothric-admin-row__level-cap { white-space: nowrap; opacity: 0.8; }

.lothric-admin-row__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.lothric-admin-role-select { min-width: 160px; }

@media (max-width: 900px) {
  .lothric-admin-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .lothric-admin-row__actions { flex-wrap: wrap; }
  .lothric-admin-role-select { min-width: 100%; }
  .lothric-admin-invite-row { grid-template-columns: 1fr; }
}
</style>
