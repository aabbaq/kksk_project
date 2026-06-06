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
          <h1 class="text-h3 font-weight-bold mb-3">Welcome to Lothric</h1>
          <div class="d-flex justify-center">
            <v-card class="ma-10" max-width="450" width="100%">
              <v-card-title class="pl-8">
                <div class="text-h5">Login</div>
              </v-card-title>
              <v-text-field
                v-model="userName"
                :rules="rules.username"
                class="mx-10"
                label="Name"
                color="purple darken-2"
                clearable
                @click="inputError = false"
                @keydown.enter="userSignIn"
              />
              <v-text-field
                v-model="userPassword"
                :rules="rules.password"
                class="mx-10 pb-2"
                label="Password"
                color="teal"
                type="password"
                clearable
                @click="inputError = false"
                @keydown.enter="userSignIn"
              />
              <div class="mx-10 mt-0">
                <v-alert
                  type="error"
                  density="compact"
                  closable
                  :model-value="inputError"
                >
                  Wrong <strong>Password</strong> or <strong>Username</strong>!
                </v-alert>
              </div>
              <v-card-actions class="mx-5 flex-column ga-2 pb-4">
                <v-btn
                  color="red lighten-2"
                  block
                  variant="text"
                  :disabled="canSubmit"
                  @click="userSignIn"
                >
                  <v-icon color="red lighten-2" start>mdi-campfire</v-icon>
                  Light BonFire
                </v-btn>
                <v-btn variant="text" block :to="{ name: 'register' }">
                  Create a new account
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
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
