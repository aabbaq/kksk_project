<template>
  <div>
    <TopBar />
    <LothricPage>
    <v-container class="lothric-container lothric-container--form">
      <div class="lothric-stack">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.title"
              :label="t.editor.title"
              prepend-inner-icon="mdi-alpha-t-box-outline"
              :hint="t.editor.titleHint"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.subtitle"
              :label="t.editor.subtitle"
              prepend-inner-icon="mdi-alpha-s-box-outline"
              :hint="t.editor.subtitleHint"
              clearable
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.tag"
              :label="t.editor.tag"
              prepend-inner-icon="mdi-label-multiple-outline"
              :hint="t.editor.tagHint"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.picture"
              :label="t.editor.picture"
              prepend-inner-icon="mdi-image"
              :hint="t.editor.pictureHint"
              clearable
            />
            <v-file-input
              class="mt-2"
              :label="t.editor.uploadCover"
              prepend-icon="mdi-upload"
              accept="image/*"
              density="compact"
              hide-details
              @update:model-value="onImageUpload"
            />
          </v-col>
        </v-row>

        <v-row align="center">
          <v-col cols="12" md="6">
            <v-slider
              v-model="blogTextInfo.secretLevel"
              class="lothric-secret-slider"
              thumb-label="always"
              :thumb-color="secretLevelColor"
              show-ticks="always"
              :label="t.editor.secretLevel"
              :prepend-icon="lockIcon"
              :tick-labels="secretLabels.slice(0, maxWritableLevel + 1)"
              :color="secretLevelColor"
              :min="0"
              :max="maxWritableLevel"
              :step="1"
            />
            <p v-if="maxWritableLevel < 3" class="text-body-small text-medium-emphasis mt-1 pl-9">
              {{ t.editor.secretLevelCap.replace('{max}', String(maxWritableLevel)) }}
            </p>
            <div class="lothric-secret-legend">
              <span
                v-for="(label, index) in secretLabels"
                :key="index"
                class="lothric-secret-legend__item"
                :class="{ 'lothric-secret-legend__item--active': blogTextInfo.secretLevel === index }"
              >
                <i :style="{ backgroundColor: secretLevelColors[index] }" />
                {{ label }}
              </span>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <v-switch
              v-model="blogTextInfo.protectedMode"
              prepend-icon="mdi-shield-lock-outline"
              color="secondary"
              :label="t.editor.protected"
              hide-details
            />
            <v-switch
              v-model="blogTextInfo.hiddenMode"
              prepend-icon="mdi-shield-lock-outline"
              color="primary"
              :label="t.editor.hidden"
              hide-details
            />
          </v-col>
        </v-row>

        <v-expand-transition>
          <v-text-field
            v-if="blogTextInfo.protectedMode"
            v-model="blogTextInfo.protectedPassword"
            prepend-inner-icon="mdi-shield-lock-outline"
            :label="t.editor.protectedPassword"
            :hint="t.editor.protectedPasswordHint"
            clearable
            type="password"
          />
        </v-expand-transition>

        <div class="lothric-editor">
          <MdEditor v-model="blogTextInfo.content" theme="dark" :language="editorLanguage" />
        </div>

        <v-row class="mt-2">
          <v-col cols="12" sm="6">
            <v-dialog v-model="dialog" max-width="480">
              <template #activator="{ props }">
                <v-btn v-bind="props" class="lothric-btn-action" block size="large">
                  {{ btnName }}
                </v-btn>
              </template>
              <v-card class="lothric-card pa-2">
                <v-card-title>{{ btnName }} {{ t.editor.modeText }}</v-card-title>
                <v-card-text>
                  {{ t.editor.confirmBody }}<br />
                  <span class="pl-2">{{ t.editor.confirmWillBe }}</span><br />
                  <strong class="text-secondary">{{ textMode('hiddenMode') }}</strong>
                  <strong v-if="symbolCheck"> &amp; </strong>
                  <strong :class="textColor">{{ textMode('protectedMode') }}</strong>{{ t.editor.modeText }}
                </v-card-text>
                <v-card-actions class="px-4 pb-4">
                  <v-spacer />
                  <v-btn color="error" variant="text" @click="dialog = false">等等.</v-btn>
                  <v-btn color="secondary" variant="text" @click="uploadBlog">Yes, I AM!</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn class="lothric-btn-action" block size="large" @click="saveDraft">
              {{ t.editor.saveDraft }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
    </LothricPage>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import TopBar from '@/components/layout/TopBar.vue'
import LothricPage from '@/components/layout/LothricPage.vue'
import { getOneText, uploadBlog as uploadBlogApi, uploadImage } from '@/api/text'
import { useLocaleStore } from '@/stores/locale'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()
const authStore = useAuthStore()
const { locale, t } = storeToRefs(localeStore)

/** Max secret level this user can write: min(role, 3) */
const maxWritableLevel = computed(() => Math.min(authStore.userRole, 3))

const dialog = ref(false)
const isUpdate = ref(false)
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success' as 'success' | 'error'
})

const blogTextInfo = reactive({
  id: '',
  number: undefined as number | undefined,
  title: '',
  subtitle: '',
  tag: '',
  picture: 'default',
  secretLevel: 0,
  protectedMode: false,
  protectedPassword: '',
  hiddenMode: false,
  content: ''
})

const secretLevelColors = ['#6b9e7a', '#6b8fae', '#b8a86a', '#b86b6b'] as const

const secretLabels = computed(() => [
  t.value.editor.secretPublic,
  t.value.editor.secretNormal,
  t.value.editor.secretSecret,
  t.value.editor.secretDark
])

const secretLevelColor = computed(() => secretLevelColors[blogTextInfo.secretLevel] ?? secretLevelColors[0])

const editorLanguage = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

const lockIcon = computed(() =>
  blogTextInfo.secretLevel === 0 ? 'mdi-lock-open-outline' : 'mdi-lock-outline'
)
const btnName = computed(() => (isUpdate.value ? t.value.editor.update : t.value.editor.upload))
const textColor = computed(() =>
  blogTextInfo.protectedMode ? 'text-secondary' : 'text-warning'
)
const symbolCheck = computed(() => blogTextInfo.protectedMode && blogTextInfo.hiddenMode)

function textMode (modeName: string) {
  if (modeName === 'hiddenMode') return blogTextInfo.hiddenMode ? t.value.editor.modeHidden : ''
  if (modeName === 'protectedMode') {
    return blogTextInfo.protectedMode
      ? t.value.editor.modeProtected
      : (blogTextInfo.hiddenMode ? '' : t.value.editor.modeNormal)
  }
  return ''
}

async function loadText () {
  const number = Number(route.params.textNumber)
  if (!number && !route.query.id) return

  const params: Record<string, string | number> = {}
  if (route.query.id) params.id = String(route.query.id)
  else params.number = number

  const res = await getOneText(params)
  if (res.status === 200 && res.docs?.[0]) {
    const docs = res.docs[0]
    blogTextInfo.id = docs.id
    blogTextInfo.number = docs.number
    blogTextInfo.content = docs.content
    blogTextInfo.title = docs.title
    blogTextInfo.subtitle = docs.subtitle
    blogTextInfo.picture = docs.picture
    blogTextInfo.tag = docs.tag
    blogTextInfo.secretLevel = docs.secretLevel ?? 0
    blogTextInfo.protectedMode = docs.protected
    blogTextInfo.protectedPassword = docs.protectedPassword ?? ''
    blogTextInfo.hiddenMode = docs.hidden
    isUpdate.value = true
  }
}

async function onImageUpload (files: File | File[] | null) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  try {
    const res = await uploadImage(file)
    if (res.status === 200) {
      blogTextInfo.picture = res.url ?? res.picture ?? res.filename
      snackbar.text = t.value.editor.uploadCoverOk
      snackbar.color = 'success'
      snackbar.show = true
    }
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    snackbar.text = status === 413
      ? t.value.editor.uploadCoverTooLarge
      : t.value.editor.uploadCoverError
    snackbar.color = 'error'
    snackbar.show = true
  }
}

async function submit (isDraft: boolean) {
  dialog.value = false
  if (!blogTextInfo.picture) blogTextInfo.picture = 'default'
  const user = JSON.parse(sessionStorage.getItem('session_user') ?? '{}')

  const res = await uploadBlogApi({
    blogid: blogTextInfo.id,
    blogtitle: blogTextInfo.title,
    blogsubtitle: blogTextInfo.subtitle,
    blogtag: blogTextInfo.tag,
    blogpic: blogTextInfo.picture,
    blogcontent: blogTextInfo.content,
    blogsecretlevel: blogTextInfo.secretLevel,
    blogprotected: blogTextInfo.protectedMode,
    blogprotectedpassword: blogTextInfo.protectedPassword,
    bloghidden: blogTextInfo.hiddenMode,
    blogupdate: isUpdate.value,
    blogauthor: user.name,
    isDraft
  })
  if (res.status === 200) {
    router.push(isDraft ? '/user/drafts' : '/homepage')
  }
}

function uploadBlog () {
  submit(false)
}

function saveDraft () {
  submit(true)
}

onMounted(loadText)
</script>

<style scoped>
.lothric-editor {
  border-radius: var(--lothric-card-radius);
  overflow: hidden;
  border: 1px solid var(--lothric-border);
  width: 100%;
}

.lothric-editor :deep(.md-editor) {
  min-height: 560px;
}

.lothric-secret-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-top: 8px;
  padding-left: 4px;
}

.lothric-secret-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
  transition: color 0.2s ease;
}

.lothric-secret-legend__item i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lothric-secret-legend__item--active {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 500;
}

.lothric-secret-slider :deep(.v-slider-track__tick-label) {
  font-size: 0.75rem;
}
</style>
