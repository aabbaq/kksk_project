<template>
  <div>
    <TopBar />
    <v-container class="lothric-container lothric-container--form">
      <div class="lothric-stack">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.title"
              label="Blog Title"
              prepend-inner-icon="mdi-alpha-t-box-outline"
              hint='For example, "The first blog text"'
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.subtitle"
              label="Blog Subtitle"
              prepend-inner-icon="mdi-alpha-s-box-outline"
              hint="You can set one or not"
              clearable
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.tag"
              label="Blog Tag"
              prepend-inner-icon="mdi-label-multiple-outline"
              hint="Use tag to mark the text"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="blogTextInfo.picture"
              label="Blog Picture"
              prepend-inner-icon="mdi-image"
              hint="Image name or upload below"
              clearable
            />
            <v-file-input
              class="mt-2"
              label="Upload cover image"
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
              label="Scret Level"
              :prepend-icon="lockIcon"
              :tick-labels="secretLabels"
              color="error"
              :min="1"
              :max="3"
              :step="1"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-switch
              v-model="blogTextInfo.protectedMode"
              prepend-icon="mdi-shield-lock-outline"
              color="secondary"
              label="Set this text protected"
              hide-details
            />
            <v-switch
              v-model="blogTextInfo.hiddenMode"
              prepend-icon="mdi-shield-lock-outline"
              color="primary"
              label="Set this text hidden"
              hide-details
            />
          </v-col>
        </v-row>

        <v-expand-transition>
          <v-text-field
            v-if="blogTextInfo.protectedMode"
            v-model="blogTextInfo.protectedPassword"
            prepend-inner-icon="mdi-shield-lock-outline"
            label="Protected Password"
            hint="Set Password to protect your text"
            clearable
            type="password"
          />
        </v-expand-transition>

        <div class="lothric-editor">
          <MdEditor v-model="blogTextInfo.content" theme="dark" language="en-US" />
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
                <v-card-title>{{ btnName }} The Text</v-card-title>
                <v-card-text>
                  Be Sure Nothing Wrong:<br />
                  <span class="pl-2">This text will be set as a</span><br />
                  <strong class="text-secondary">{{ textMode('hiddenMode') }}</strong>
                  <strong v-if="symbolCheck"> &amp; </strong>
                  <strong :class="textColor">{{ textMode('protectedMode') }}</strong>Text
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
            <v-btn variant="outlined" block size="large" @click="saveDraft">
              Save as Draft
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import TopBar from '@/components/layout/TopBar.vue'
import { getOneText, uploadBlog as uploadBlogApi, uploadImage } from '@/api/text'

const route = useRoute()
const router = useRouter()

const secretLabels = ['N', 'S', 'D']
const dialog = ref(false)
const isUpdate = ref(false)

const blogTextInfo = reactive({
  id: '',
  number: undefined as number | undefined,
  title: '',
  subtitle: '',
  tag: '',
  picture: 'default',
  secretLevel: 1,
  protectedMode: false,
  protectedPassword: '',
  hiddenMode: false,
  content: ''
})

const lockIcon = computed(() =>
  blogTextInfo.secretLevel === 1 ? 'mdi-lock-open-outline' : 'mdi-lock-outline'
)
const btnName = computed(() => (isUpdate.value ? 'Update' : 'Upload'))
const textColor = computed(() =>
  blogTextInfo.protectedMode ? 'text-secondary' : 'text-warning'
)
const symbolCheck = computed(() => blogTextInfo.protectedMode && blogTextInfo.hiddenMode)

function textMode (modeName: string) {
  if (modeName === 'hiddenMode') return blogTextInfo.hiddenMode ? 'Hidden ' : ''
  if (modeName === 'protectedMode') {
    return blogTextInfo.protectedMode ? 'Protected ' : (blogTextInfo.hiddenMode ? '' : 'Normal ')
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
    blogTextInfo.secretLevel = docs.secretLevel
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
