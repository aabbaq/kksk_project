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
              thumb-label="always"
              thumb-color="error"
              show-ticks="always"
              :label="t.editor.secretLevel"
              :prepend-icon="lockIcon"
              :tick-labels="secretLabels"
              color="error"
              :min="0"
              :max="3"
              :step="1"
            />
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
                <v-btn v-bind="props" color="primary" block size="large">
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
            <v-btn variant="text" class="lothric-btn-blend" block size="large" @click="saveDraft">
              {{ t.editor.saveDraft }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
    </LothricPage>
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

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()
const { locale, t } = storeToRefs(localeStore)

const dialog = ref(false)
const isUpdate = ref(false)

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

const secretLabels = computed(() => [
  t.value.editor.secretPublic,
  t.value.editor.secretNormal,
  t.value.editor.secretSecret,
  t.value.editor.secretDark
])

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
  const res = await uploadImage(file)
  if (res.status === 200) {
    blogTextInfo.picture = res.filename
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
}
</style>
