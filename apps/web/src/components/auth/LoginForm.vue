<template>
  <div>
    <TopBar />
    <LothricPage>
    <div class="lothric-auth">
      <v-img src="@/assets/logo.svg" class="mb-6" contain max-height="160" max-width="280" />
      <h1 class="text-h4 font-weight-bold mb-6 text-center">Welcome to Lothric</h1>

      <v-card class="lothric-auth__card" color="surface-bright">
        <v-card-title class="px-7 pt-6 pb-2">
          <span class="text-h5">{{ t.auth.loginTitle }}</span>
        </v-card-title>
        <div class="lothric-auth__body lothric-auth__body--fields">
          <v-text-field
            v-model="userName"
            class="lothric-auth-field"
            :rules="rules.username"
            :label="t.auth.name"
            color="secondary"
            variant="underlined"
            autocomplete="username"
            clearable
            @click="inputError = false"
            @keydown.enter="userSignIn"
          />
          <v-text-field
            v-model="userPassword"
            class="lothric-auth-field"
            :rules="rules.password"
            :label="t.auth.password"
            color="secondary"
            variant="underlined"
            type="password"
            autocomplete="current-password"
            clearable
            @click="inputError = false"
            @keydown.enter="userSignIn"
          />
          <v-alert
            type="error"
            density="compact"
            closable
            :model-value="inputError"
            class="mt-3"
            variant="tonal"
          >
            {{ t.auth.loginError }}
          </v-alert>
        </div>
        <div class="lothric-auth__actions">
          <v-btn
            color="error"
            variant="tonal"
            block
            size="large"
            :disabled="canSubmit"
            @click="userSignIn"
          >
            <v-icon start>mdi-campfire</v-icon>
            Light BonFire
          </v-btn>
          <v-btn variant="text" block :to="{ name: 'register' }">
            {{ t.auth.createAccount }}
          </v-btn>
        </div>
      </v-card>
    </div>
    </LothricPage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import TopBar from '@/components/layout/TopBar.vue'
import LothricPage from '@/components/layout/LothricPage.vue'
import { login } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

const auth = useAuthStore()
const localeStore = useLocaleStore()
const { t } = storeToRefs(localeStore)
const router = useRouter()
const route = useRoute()

const userName = ref('')
const userPassword = ref('')
const inputError = ref(false)

const rules = computed(() => ({
  username: [(v: string) => !!v || `${t.value.auth.name}!`],
  password: [(v: string) => !!v || `${t.value.auth.password}!`]
}))

const canSubmit = computed(() => !userName.value || !userPassword.value)

async function userSignIn () {
  inputError.value = false
  try {
    const res = await login(userName.value, userPassword.value)
    if (res.status === 200) {
      auth.changeLogin({
        token: res.token,
        username: res.username,
        nickname: res.nickname,
        userrole: res.userrole
      })
      auth.haveCheckUserTokenCommit()
      const redirect = (route.query.redirect as string) || '/homepage'
      router.push(redirect)
    } else {
      inputError.value = true
    }
  } catch {
    inputError.value = true
  }
}
</script>

<style scoped>
.lothric-auth-field :deep(input:-webkit-autofill),
.lothric-auth-field :deep(input:-webkit-autofill:hover),
.lothric-auth-field :deep(input:-webkit-autofill:focus),
.lothric-auth-field :deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 1000px #2a0f24 inset !important;
  box-shadow: 0 0 0 1000px #2a0f24 inset !important;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.92) !important;
  caret-color: rgba(255, 255, 255, 0.92);
  transition: background-color 99999s ease-in-out 0s;
}

.lothric-auth-field :deep(.v-field__input) {
  background-color: transparent;
}
</style>
