<template>
  <v-app-bar color="primary" dark>
    <v-toolbar-title class="headline text-uppercase">
      <router-link to="/" id="lothric">
        <span>Lothric</span>
        <span class="font-weight-light">Castle</span>
      </router-link>
    </v-toolbar-title>
    <v-spacer />
    <v-tooltip location="bottom">
      <template #activator="{ props }">
        <v-btn depressed v-bind="props">
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
      <v-tabs v-model="tab" color="yellow">
        <v-tab v-for="each in tabsInfo" :key="each.name" :to="each.to" id="Tabbuttom">
          {{ each.name }}
        </v-tab>
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { tokenCheck } from '@/api/user'

const auth = useAuthStore()
const route = useRoute()
const tab = ref(null)

const tabsInfo = [
  { name: 'myself', to: { name: 'userself' } },
  { name: 'texts', to: { name: 'usertexts' } },
  { name: 'drafts', to: { name: 'userdrafts' } }
]

onMounted(async () => {
  const token = sessionStorage.getItem('session_authorization')
  if (token && !auth.haveCheckUserToken) {
    try {
      await tokenCheck()
      auth.haveCheckUserTokenCommit()
    } catch {
      // ignore
    }
  }
})

const toWhere = computed(() => (auth.isLoggedIn ? '/user' : '/login'))
const loginTip = computed(() => (auth.isLoggedIn ? '欢迎你！Homo！' : '你不属于这里！'))
const isUserHome = computed(() => /user/.test(String(route.name)))
</script>
