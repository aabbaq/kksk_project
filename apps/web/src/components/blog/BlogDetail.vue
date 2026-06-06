<template>
  <div>
    <TopBar />
    <LothricPage>
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

      <v-container v-if="loading" class="lothric-container lothric-container--article">
        <v-progress-linear indeterminate color="secondary" class="mt-6" />
      </v-container>

      <v-container v-else-if="needsPassword" class="lothric-container lothric-container--article">
        <v-card class="lothric-card pa-6">
          <v-card-title class="px-0 pt-0">This text is protected</v-card-title>
          <v-text-field
            v-model="protectPassword"
            label="Protected Password"
            type="password"
            variant="underlined"
            prepend-inner-icon="mdi-shield-lock-outline"
            class="mt-2"
            @keydown.enter="submitPassword"
          />
          <v-alert v-if="passwordError" type="error" density="compact" class="mt-2" variant="tonal">
            Wrong password!
          </v-alert>
          <v-btn variant="text" class="lothric-btn-blend mt-4" block size="large" @click="submitPassword">
            Enter
          </v-btn>
        </v-card>
      </v-container>

      <v-container v-else-if="loadError" class="lothric-container lothric-container--article">
        <v-alert type="warning" variant="tonal" class="rounded-xl">
          {{ loadError }}
        </v-alert>
      </v-container>

      <v-container v-else-if="loaded" class="lothric-container lothric-container--article">
        <article class="lothric-article">
          <div v-html="textInfo.htmlContent" class="markdown-body lothric-markdown" />
        </article>
      </v-container>
    </LothricPage>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import LothricPage from '@/components/layout/LothricPage.vue'
import { getOneText, verifyTextPassword } from '@/api/text'
import { imageSrc } from '@/utils/image'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const textInfo = ref<Record<string, string>>({})
const picture = ref('')
const needsPassword = ref(false)
const protectPassword = ref('')
const passwordError = ref(false)
const textId = ref('')
const loading = ref(true)
const loaded = ref(false)
const loadError = ref('')

function buildQueryParams () {
  const params: Record<string, string | number> = {}
  if (route.query.id) {
    params.id = String(route.query.id)
    textId.value = String(route.query.id)
  } else if (route.query.number) {
    params.number = Number(route.query.number)
  } else {
    params.title = decodeURIComponent(String(route.params.textTitle))
  }
  return params
}

function applyText (docs: Record<string, string>) {
  textInfo.value = docs
  textInfo.value.dateInString = (docs.dateInString ?? '').split(' ')[0]
  picture.value = docs.picture ?? route.query.picture?.toString() ?? ''
  needsPassword.value = false
  loaded.value = true
  loadError.value = ''
}

async function loadText () {
  loading.value = true
  loaded.value = false
  loadError.value = ''
  needsPassword.value = false

  try {
    const res = await getOneText(buildQueryParams())
    if (res.status === 200 && res.docs?.[0]) {
      applyText(res.docs[0])
    } else {
      loadError.value = 'Failed to load text.'
    }
  } catch (err: unknown) {
    const status = (err as { response?: { data?: { status?: number } } })?.response?.data?.status
    if (status === 107) {
      needsPassword.value = true
      textInfo.value.title = decodeURIComponent(String(route.params.textTitle))
      picture.value = route.query.picture?.toString() ?? 'default'
    } else if (status === 105) {
      loadError.value = 'You do not have permission to view this text. Please log in or check access level.'
    } else {
      loadError.value = 'Failed to load text.'
    }
  } finally {
    loading.value = false
  }
}

async function submitPassword () {
  passwordError.value = false
  if (!textId.value && route.query.id) textId.value = String(route.query.id)
  if (!textId.value) return
  try {
    const res = await verifyTextPassword(textId.value, protectPassword.value)
    if (res.status === 200 && res.docs?.[0]) {
      applyText(res.docs[0])
    }
  } catch {
    passwordError.value = true
  }
}

onMounted(() => loadText())

watch(() => route.fullPath, () => loadText())
watch(() => auth.isLoggedIn, () => loadText())
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
