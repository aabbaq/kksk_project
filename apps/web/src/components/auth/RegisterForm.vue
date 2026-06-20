<template>
  <div>
    <TopBar />
    <LothricPage>
    <div class="lothric-auth">
      <v-img src="@/assets/logo.svg" class="mb-6" contain max-height="160" max-width="280" />
      <h1 class="text-h4 font-weight-bold mb-6 text-center">Join Lothric</h1>

      <v-card class="lothric-auth__card" color="surface-bright">
        <v-card-title class="px-7 pt-6 pb-2">
          <span class="text-h5">{{ t.auth.registerTitle }}</span>
        </v-card-title>
        <div class="lothric-auth__body lothric-auth__body--fields">
          <v-text-field v-model="username" class="lothric-auth-field" :label="t.auth.username" variant="underlined" autocomplete="username" clearable />
          <v-text-field v-model="nickname" class="lothric-auth-field" :label="t.auth.nickname" variant="underlined" autocomplete="nickname" clearable />
          <v-text-field v-model="password" class="lothric-auth-field" :label="t.auth.password" variant="underlined" type="password" autocomplete="new-password" clearable />
          <v-alert
            type="error"
            density="compact"
            :model-value="inputError"
            class="mt-3"
            variant="tonal"
          >
            {{ errorMsg }}
          </v-alert>
        </div>
        <div class="lothric-auth__actions">
          <v-btn color="secondary" variant="flat" block size="large" @click="submit">
            {{ t.auth.registerSubmit }}
          </v-btn>
          <v-btn variant="text" block :to="{ name: 'login' }">
            {{ t.auth.backToLogin }}
          </v-btn>
        </div>
      </v-card>
    </div>
    </LothricPage>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import TopBar from '@/components/layout/TopBar.vue'
import LothricPage from '@/components/layout/LothricPage.vue'
import { register } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

const auth = useAuthStore()
const localeStore = useLocaleStore()
const { t } = storeToRefs(localeStore)
const router = useRouter()

const username = ref('')
const nickname = ref('')
const password = ref('')
const inputError = ref(false)
const errorMsg = ref('')

async function submit () {
  inputError.value = false
  try {
    const res = await register(username.value, password.value, nickname.value || undefined)
    if (res.status === 200) {
      auth.changeLogin({
        token: res.token,
        username: res.username,
        nickname: res.nickname,
        userrole: res.userrole
      })
      auth.haveCheckUserTokenCommit()
      router.push('/homepage')
    }
  } catch (err: unknown) {
    inputError.value = true
    const msg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg
    errorMsg.value = msg ?? t.value.auth.registerError
  }
}
</script>
