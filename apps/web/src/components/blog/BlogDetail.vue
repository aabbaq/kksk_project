<template>
  <div>
    <TopBar />
    <v-parallax v-if="picture" id="textPic" height="400" :src="imageSrc(picture)">
      <v-container>
        <v-row>
          <v-col>
            <div class="font-weight-thin text-h3 text-center">{{ textInfo.title }}</div>
          </v-col>
        </v-row>
        <div class="text-subtitle-2 font-weight-regular font-italic text-center">
          {{ textInfo.dateInString }}
        </div>
        <div class="font-weight-light text-h6 text-center">{{ textInfo.author }}</div>
      </v-container>
    </v-parallax>

    <v-container v-if="needsPassword" class="mx-auto" max-width="480">
      <v-card class="pa-6">
        <v-card-title>This text is protected</v-card-title>
        <v-text-field
          v-model="protectPassword"
          label="Protected Password"
          type="password"
          prepend-icon="mdi-shield-lock-outline"
        />
        <v-alert v-if="passwordError" type="error" density="compact" class="mt-2">
          Wrong password!
        </v-alert>
        <v-btn color="secondary" block class="mt-4" @click="submitPassword">Enter</v-btn>
      </v-card>
    </v-container>

    <v-container v-else class="mx-24 px-10">
      <v-row>
        <v-col cols="1" />
        <v-col cols="8">
          <v-card min-width="320" elevation="0" rounded>
            <div v-html="textInfo.htmlContent" class="markdown-body" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import { getOneText, verifyTextPassword } from '@/api/text'
import { imageSrc } from '@/utils/image'

const route = useRoute()

const textInfo = ref<Record<string, string>>({})
const picture = ref('')
const needsPassword = ref(false)
const protectPassword = ref('')
const passwordError = ref(false)
const textId = ref('')

async function loadText (verified = false) {
  const params: Record<string, string | number | boolean> = {}
  if (route.query.id) {
    params.id = String(route.query.id)
    textId.value = String(route.query.id)
  } else {
    params.title = String(route.params.textTitle)
  }
  if (verified) params.verified = true

  try {
    const res = await getOneText(params)
    if (res.status === 200 && res.docs?.[0]) {
      const docs = res.docs[0]
      textInfo.value = docs
      textInfo.value.dateInString = (docs.dateInString ?? '').split(' ')[0]
      picture.value = docs.picture ?? route.query.picture?.toString() ?? ''
      needsPassword.value = false
    }
  } catch (err: unknown) {
    const status = (err as { response?: { data?: { status?: number } } })?.response?.data?.status
    if (status === 107) {
      needsPassword.value = true
      textInfo.value.title = String(route.params.textTitle)
      picture.value = route.query.picture?.toString() ?? 'default'
    }
  }
}

async function submitPassword () {
  passwordError.value = false
  if (!textId.value && route.query.id) textId.value = String(route.query.id)
  if (!textId.value) return
  try {
    const res = await verifyTextPassword(textId.value, protectPassword.value)
    if (res.status === 200 && res.docs?.[0]) {
      textInfo.value = res.docs[0]
      textInfo.value.dateInString = (res.docs[0].dateInString ?? '').split(' ')[0]
      picture.value = res.docs[0].picture ?? ''
      needsPassword.value = false
    }
  } catch {
    passwordError.value = true
  }
}

onMounted(() => loadText())
</script>

<style scoped>
#textPic :deep(.v-parallax__image) {
  filter: blur(10px);
  transition: filter 0.5s ease-in-out;
}
#textPic:hover :deep(.v-parallax__image) {
  filter: none;
}
</style>
