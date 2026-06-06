<template>
  <div>
    <TopBar />
    <v-container>
      <v-row class="text-center">
        <v-col cols="12">
          <v-img src="@/assets/logo.svg" class="my-3" contain height="200" />
        </v-col>
      </v-row>
      <v-row class="text-center">
        <v-col class="mb-4" cols="12">
          <h1 class="text-h3 font-weight-bold mb-3">Join Lothric</h1>
          <div class="d-flex justify-center">
            <v-card class="ma-10" max-width="450" width="100%">
              <v-card-title class="pl-8">
                <div class="text-h5">Register</div>
              </v-card-title>
              <v-text-field v-model="username" class="mx-10" label="Username" clearable />
              <v-text-field v-model="nickname" class="mx-10" label="Nickname" clearable />
              <v-text-field v-model="password" class="mx-10" label="Password" type="password" clearable />
              <div class="mx-10 mt-0">
                <v-alert type="error" density="compact" :model-value="inputError">
                  {{ errorMsg }}
                </v-alert>
              </div>
              <v-card-actions class="mx-5 flex-column ga-2 pb-4">
                <v-btn color="secondary" block @click="submit">Sign Up</v-btn>
                <v-btn variant="text" block :to="{ name: 'login' }">Back to Login</v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import { register } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const nickname = ref('')
const password = ref('')
const inputError = ref(false)
const errorMsg = ref('Registration failed')

async function submit () {
  inputError.value = false
  try {
    const res = await register(username.value, password.value, nickname.value || undefined)
    if (res.status === 200) {
      auth.changeLogin({
        token: res.token,
        username: res.username,
        userrole: res.userrole
      })
      auth.haveCheckUserTokenCommit()
      router.push('/homepage')
    }
  } catch (err: unknown) {
    inputError.value = true
    const msg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg
    errorMsg.value = msg ?? 'Registration failed'
  }
}
</script>
