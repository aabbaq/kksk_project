<template>
  <v-container class="lothric-container py-6">
    <v-row align="start">
      <v-col cols="12" lg="7">
        <div class="lothric-stack">
          <v-text-field
            :label="t.profile.username"
            :model-value="userInfo.username"
            disabled
            prepend-inner-icon="mdi-account"
          />
          <v-text-field
            v-model="newPassword"
            :label="t.profile.password"
            :placeholder="t.profile.passwordPlaceholder"
            prepend-inner-icon="mdi-alpha-p-box"
            append-inner-icon="mdi-lead-pencil"
            @click:append-inner="changePassword"
          />
          <v-text-field
            v-model="userInfo.nickname"
            :label="t.profile.nickname"
            :clearable="!canNicknameChange"
            prepend-inner-icon="mdi-alpha-n-box"
            append-inner-icon="mdi-lead-pencil"
            :readonly="canNicknameChange"
            @click:append-inner="toggleNicknameEdit"
          />
          <v-textarea
            v-model="userInfo.biography"
            clearable
            :label="t.profile.biography"
            :placeholder="t.profile.biographyPlaceholder"
            :hint="t.profile.biographyPlaceholder"
            rows="3"
            prepend-inner-icon="mdi-bio"
          />
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="userInfo.alias" :label="t.profile.alias" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="userInfo.emoji" :label="t.profile.emoji" />
            </v-col>
          </v-row>
        </div>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="lothric-card lothric-profile-card mx-auto" max-width="420">
          <v-img id="UserBanner" aspect-ratio="2.618" src="/images/pic1.jpg" cover>
            <div class="pa-4 d-flex flex-column justify-end fill-height">
              <v-avatar color="grey-darken-3" size="96" rounded="lg" class="mb-3">
                <v-img src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg" />
              </v-avatar>
              <div class="text-h6">
                {{ userInfo.nickname }}
                <span v-if="userInfo.emoji">{{ userInfo.emoji }}</span>
                <span v-if="userInfo.alias" class="ml-1">{{ userInfo.alias }}</span>
              </div>
              <div id="UsernameInCard" class="text-body-medium">@{{ userInfo.username }}</div>
            </div>
          </v-img>
          <v-card-text class="pt-4">
            {{ userInfo.biography || t.profile.showYourself }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="quotas" class="mt-2">
      <v-col cols="12" lg="7">
        <v-card class="lothric-card lothric-quota-panel pa-5">
          <v-card-title class="px-0 pt-0 pb-1 text-subtitle-1">{{ t.profile.quotasTitle }}</v-card-title>
          <v-card-text class="px-0 pb-0">
            <div class="lothric-quota-grid">
              <div v-for="item in quotaItems" :key="item.key" class="lothric-quota-row">
                <div class="lothric-quota-row__head">
                  <span class="text-body-medium">{{ item.label }}</span>
                  <span class="text-body-small text-medium-emphasis">
                    {{ item.usage }} / {{ formatLimit(item.limit) }}
                  </span>
                </div>
                <v-progress-linear
                  v-if="item.limit !== -1"
                  :model-value="quotaPercent(item.usage, item.limit)"
                  :color="quotaColor(item.usage, item.limit)"
                  height="6"
                  rounded
                />
                <div v-else class="lothric-quota-unlimited text-body-small text-medium-emphasis">
                  {{ t.profile.quotasUnlimited }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" lg="7">
        <v-btn variant="text" class="lothric-btn-blend" width="200" :loading="saving" @click="saveProfile">
          {{ t.profile.save }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-6">
      <v-col cols="12" sm="8" md="6">
        <v-card class="lothric-card">
          <v-card-title>{{ t.logout.title }}</v-card-title>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-dialog v-model="dialog" max-width="480">
              <template #activator="{ props }">
                <v-btn v-bind="props" color="error" variant="tonal">{{ t.logout.quit }}</v-btn>
              </template>
              <v-card class="lothric-card pa-2">
                <v-card-title>{{ t.logout.confirmTitle }}</v-card-title>
                <v-card-text>{{ t.logout.confirmBody }}</v-card-text>
                <v-card-actions class="px-4 pb-4">
                  <v-spacer />
                  <v-btn color="error" variant="text" @click="dialog = false">等等.</v-btn>
                  <v-btn color="secondary" variant="text" @click="userQuit">Yes, I AM!</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom"
      :timeout="3000"
      rounded="lg"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { changePassword as changePasswordApi, getUserInfo, updateProfile } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

const auth = useAuthStore()
const localeStore = useLocaleStore()
const { t } = storeToRefs(localeStore)
const router = useRouter()

const dialog = ref(false)
const saving = ref(false)
const canNicknameChange = ref(true)
const newPassword = ref('')
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success' as 'success' | 'error'
})
const userInfo = reactive({
  username: '',
  nickname: '',
  biography: '',
  alias: '',
  emoji: ''
})
const quotas = ref<{
  limits: { maxArticles: number, maxDrafts: number, maxCoverImages: number }
  usage: { articles: number, drafts: number, coverImages: number }
} | null>(null)

const quotaItems = computed(() => {
  if (!quotas.value) return []
  return [
    {
      key: 'articles',
      label: t.value.profile.quotasArticles,
      usage: quotas.value.usage.articles,
      limit: quotas.value.limits.maxArticles
    },
    {
      key: 'drafts',
      label: t.value.profile.quotasDrafts,
      usage: quotas.value.usage.drafts,
      limit: quotas.value.limits.maxDrafts
    },
    {
      key: 'covers',
      label: t.value.profile.quotasCoverImages,
      usage: quotas.value.usage.coverImages,
      limit: quotas.value.limits.maxCoverImages
    }
  ]
})

function formatLimit (value: number) {
  return value === -1 ? t.value.profile.quotasUnlimited : String(value)
}

function quotaPercent (usage: number, limit: number) {
  if (limit <= 0) return usage > 0 ? 100 : 0
  return Math.min(100, Math.round((usage / limit) * 100))
}

function quotaColor (usage: number, limit: number) {
  if (limit === -1) return 'secondary'
  const ratio = limit > 0 ? usage / limit : 1
  if (ratio >= 1) return 'error'
  if (ratio >= 0.8) return 'warning'
  return 'secondary'
}

function toggleNicknameEdit () {
  canNicknameChange.value = !canNicknameChange.value
  if (canNicknameChange.value) saveProfile()
}

function showSnackbar (text: string, color: 'success' | 'error') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

async function saveProfile () {
  saving.value = true
  try {
    const res = await updateProfile({
      nickname: userInfo.nickname,
      biography: userInfo.biography,
      alias: userInfo.alias,
      emoji: userInfo.emoji
    })
    if (res.status === 200) {
      if (res.userInfo) Object.assign(userInfo, res.userInfo)
      auth.setNickname(userInfo.nickname)
      showSnackbar(t.value.profile.saveSuccess, 'success')
    } else {
      showSnackbar(t.value.profile.saveError, 'error')
    }
  } catch {
    showSnackbar(t.value.profile.saveError, 'error')
  } finally {
    saving.value = false
    canNicknameChange.value = true
  }
}

async function changePassword () {
  if (!newPassword.value) return
  const current = prompt('Enter current password:')
  if (!current) return
  await changePasswordApi(current, newPassword.value)
  newPassword.value = ''
  alert('Password updated')
}

function userQuit () {
  sessionStorage.clear()
  auth.changeLogout()
  router.push('/homepage')
}

onMounted(async () => {
  const res = await getUserInfo()
  if (res.status === 200) {
    Object.assign(userInfo, res.userInfo)
    if (res.userInfo?.quotas) quotas.value = res.userInfo.quotas
  }
})
</script>

<style scoped>
#UserBanner :deep(.v-img__img) {
  filter: blur(5px);
  transition: filter 0.5s ease-in-out;
}
#UserBanner:hover :deep(.v-img__img) {
  filter: none;
}
#UsernameInCard {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 300;
}

.lothric-profile-card {
  position: sticky;
  top: 24px;
}

.lothric-quota-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 24px;
}

.lothric-quota-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.lothric-quota-unlimited {
  padding-top: 2px;
}

@media (max-width: 960px) {
  .lothric-profile-card {
    position: static;
  }

  .lothric-quota-grid {
    grid-template-columns: 1fr;
  }
}
</style>
