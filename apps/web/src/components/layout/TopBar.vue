<template>
  <v-app-bar :elevation="2" density="comfortable" :style="{ backgroundColor: colors.topbarBg }">
    <v-toolbar-title class="text-uppercase pl-2">
      <router-link to="/" id="lothric">
        <span class="text-h6">Lothric</span>
        <span class="text-h6 font-weight-light">Castle</span>
      </router-link>
    </v-toolbar-title>
    <v-spacer />
    <v-btn
      v-if="auth.isLoggedIn"
      variant="text"
      class="lothric-btn-blend mr-2"
      :to="{ name: 'post', params: { textNumber: '0' } }"
      prepend-icon="mdi-plus"
    >
      {{ t.topbar.post }}
    </v-btn>
    <v-tooltip location="bottom">
      <template #activator="{ props }">
        <v-btn variant="text" class="lothric-btn-blend mr-2" v-bind="props">
          <router-link v-if="auth.isLoggedIn" :to="toWhere" id="Postbuttom">
            下北沢に着きました
          </router-link>
          <router-link v-else :to="toWhere" id="Loginbuttom">
            下北沢に向かう
          </router-link>
        </v-btn>
      </template>
      <span>{{ loginTip }}</span>
    </v-tooltip>
    <template v-if="isUserHome" #extension>
      <v-tabs v-model="tab" color="white" density="comfortable" class="lothric-user-tabs">
        <v-tab v-for="each in tabsInfo" :key="each.key" :to="each.to" id="Tabbuttom">
          {{ each.label }}
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useAppearanceStore } from '@/stores/appearance'
import { useLocaleStore } from '@/stores/locale'
import { getUserInfo, tokenCheck } from '@/api/user'

const auth = useAuthStore()
const appearance = useAppearanceStore()
const localeStore = useLocaleStore()
const { colors } = storeToRefs(appearance)
const { t } = storeToRefs(localeStore)
const route = useRoute()
const tab = ref(null)

const tabsInfo = computed(() => [
  { key: 'myself', label: t.value.tabs.myself, to: { name: 'userself' } },
  { key: 'texts', label: t.value.tabs.texts, to: { name: 'usertexts' } },
  { key: 'drafts', label: t.value.tabs.drafts, to: { name: 'userdrafts' } },
  { key: 'settings', label: t.value.tabs.settings, to: { name: 'usersettings' } }
])

onMounted(async () => {
  const token = sessionStorage.getItem('session_authorization')
  if (!token) return
  try {
    if (!auth.haveCheckUserToken) {
      await tokenCheck()
      auth.haveCheckUserTokenCommit()
    }
    if (!auth.userNickname || auth.userNickname === auth.userName) {
      const res = await getUserInfo()
      if (res.status === 200 && res.userInfo?.nickname) {
        auth.setNickname(res.userInfo.nickname)
      }
    }
  } catch {
    // ignore
  }
})

const toWhere = computed(() => (auth.isLoggedIn ? '/user' : '/login'))
const loginTip = computed(() => {
  if (!auth.isLoggedIn) return t.value.topbar.guestDenied
  const name = auth.userNickname || auth.userName
  return t.value.topbar.welcome.replace('{name}', name)
})
const isUserHome = computed(() => /user/.test(String(route.name)))
</script>
