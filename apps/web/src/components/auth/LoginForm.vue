<template>
  <div>
    <TopBar />
    <div class="lothric-auth">
      <v-img src="@/assets/logo.svg" class="mb-6" contain max-height="160" max-width="280" />
      <h1 class="text-h4 font-weight-bold mb-6 text-center">Welcome to Lothric</h1>

      <v-card class="lothric-auth__card" color="surface-bright">
        <v-card-title class="px-7 pt-6 pb-2">
          <span class="text-h5">Login</span>
        </v-card-title>
        <div class="lothric-auth__body">
          <v-text-field
            v-model="userName"
            :rules="rules.username"
            label="Name"
            color="secondary"
            clearable
            class="mb-1"
            @click="inputError = false"
            @keydown.enter="userSignIn"
          />
          <v-text-field
            v-model="userPassword"
            :rules="rules.password"
            label="Password"
            color="secondary"
            type="password"
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
            Wrong <strong>Password</strong> or <strong>Username</strong>!
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
            Create a new account
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import { login } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const userName = ref('')
const userPassword = ref('')
const inputError = ref(false)
const rules = {
  username: [(v: string) => !!v || 'NEED USER NAME!'],
  password: [(v: string) => !!v || 'NEED PASSWORD!']
}

const canSubmit = computed(() => !userName.value || !userPassword.value)

async function userSignIn () {
  inputError.value = false
  try {
    const res = await login(userName.value, userPassword.value)
    if (res.status === 200) {
      auth.changeLogin({
        token: res.token,
        username: res.username,
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
