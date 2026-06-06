<template>
  <div>
    <TopBar />
    <v-parallax v-if="picture" id="textPic" height="360" :src="imageSrc(picture)">
      <div class="lothric-hero__overlay">
        <h1 class="text-h4 text-md-h3 font-weight-light lothric-hero__line">
          {{ textInfo.title }}
        </h1>
        <p class="text-body-medium font-italic lothric-hero__line mt-2">
          {{ textInfo.dateInString }}
        </p>
        <p class="text-body-large lothric-hero__line mt-1">
          {{ textInfo.author }}
        </p>
      </div>
    </v-parallax>

    <v-container v-if="needsPassword" class="lothric-container lothric-container--narrow">
      <v-card class="lothric-card pa-6">
        <v-card-title class="px-0 pt-0">This text is protected</v-card-title>
        <v-text-field
          v-model="protectPassword"
          label="Protected Password"
          type="password"
          prepend-inner-icon="mdi-shield-lock-outline"
          class="mt-2"
          @keydown.enter="submitPassword"
        />
        <v-alert v-if="passwordError" type="error" density="compact" class="mt-2" variant="tonal">
          Wrong password!
        </v-alert>
        <v-btn color="secondary" block class="mt-4" size="large" @click="submitPassword">
          Enter
        </v-btn>
      </v-card>
    </v-container>

    <v-container v-else class="lothric-container lothric-container--narrow">
      <article class="lothric-article">
        <div v-html="textInfo.htmlContent" class="markdown-body" />
      </article>
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
  filter: blur(8px);
  transition: filter 0.5s ease-in-out;
}
#textPic:hover :deep(.v-parallax__image) {
  filter: none;
}
</style>
