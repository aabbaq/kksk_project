<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <v-text-field
              label="Username"
              :model-value="userInfo.username"
              variant="outlined"
              disabled
              prepend-inner-icon="mdi-account"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="newPassword"
              label="Password"
              placeholder="Want to change your password?"
              variant="outlined"
              prepend-inner-icon="mdi-alpha-p-box"
              append-inner-icon="mdi-lead-pencil"
              @click:append-inner="changePassword"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="userInfo.nickname"
              label="Nickname"
              variant="outlined"
              :clearable="!canNicknameChange"
              prepend-inner-icon="mdi-alpha-n-box"
              append-inner-icon="mdi-lead-pencil"
              :readonly="canNicknameChange"
              @click:append-inner="toggleNicknameEdit"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-textarea
              v-model="userInfo.biography"
              clearable
              label="Biography"
              variant="outlined"
              placeholder="Show yourself"
              hint="Show yourself"
              append-inner-icon="mdi-lead-pencil"
              @click:append-inner="saveProfile"
            >
              <template #prepend-inner>
                <v-icon size="x-large">mdi-bio</v-icon>
              </template>
            </v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="userInfo.alias" label="Alias" variant="outlined" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="userInfo.emoji" label="Emoji" variant="outlined" />
          </v-col>
        </v-row>
        <v-btn color="secondary" @click="saveProfile">Save Profile</v-btn>
      </v-col>
      <v-col>
        <v-card class="mx-auto" max-width="434" tile>
          <v-img
            id="UserBanner"
            aspect-ratio="2.618"
            src="/images/pic1.jpg"
            class="white--text align-space-around"
            cover
          >
            <v-avatar class="profile ma-4" color="grey" size="120" tile>
              <v-img src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg" />
            </v-avatar>
            <v-card-title>
              <span>{{ userInfo.nickname }}</span>
              <span>{{ userInfo.emoji }}</span>
              <span>{{ userInfo.alias }}</span>
              <span id="UsernameInCard" class="pl-1">@{{ userInfo.username }}</span>
            </v-card-title>
          </v-img>
          <v-card-text class="text--primary">
            <div>{{ userInfo.biography }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center" align="center" class="mt-6">
      <v-col cols="6">
        <v-card>
          <v-card-title>Log Out</v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-dialog v-model="dialog" width="500">
              <template #activator="{ props }">
                <v-btn v-bind="props">Quit</v-btn>
              </template>
              <v-card>
                <v-card-title>Are You Sure?</v-card-title>
                <v-card-text>You will log out!</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="red darken-1" variant="text" @click="dialog = false">等等.</v-btn>
                  <v-btn color="blue darken-2" variant="text" @click="userQuit">Yes, I AM!</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword as changePasswordApi, getUserInfo, updateProfile } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const dialog = ref(false)
const canNicknameChange = ref(true)
const newPassword = ref('')
const userInfo = reactive({
  username: '',
  nickname: '',
  biography: '',
  alias: '',
  emoji: ''
})

function toggleNicknameEdit () {
  canNicknameChange.value = !canNicknameChange.value
  if (canNicknameChange.value) saveProfile()
}

async function saveProfile () {
  await updateProfile({
    nickname: userInfo.nickname,
    biography: userInfo.biography,
    alias: userInfo.alias,
    emoji: userInfo.emoji
  })
  canNicknameChange.value = true
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
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 300;
}
</style>
