<template>
  <div>
    <TopBar />
    <v-container>
      <v-row class="mx-8 px-8">
        <v-col>
          <v-text-field
            v-model="blogTextInfo.title"
            label="Blog Title"
            prepend-icon="mdi-alpha-t-box-outline"
            hint='For example, "The first blog text"'
            clearable
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="blogTextInfo.subtitle"
            label="Blog Subtitle"
            prepend-icon="mdi-alpha-s-box-outline"
            hint="You can set one or not"
            clearable
          />
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8">
        <v-col>
          <v-text-field
            v-model="blogTextInfo.tag"
            label="Blog Tag"
            prepend-icon="mdi-label-multiple-outline"
            hint="Use tag to mark the text"
            clearable
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="blogTextInfo.picture"
            label="Blog Picture"
            prepend-icon="mdi-image"
            hint="Image name or upload below"
            clearable
          />
          <v-file-input
            class="mt-2"
            label="Upload cover image"
            prepend-icon="mdi-upload"
            accept="image/*"
            hide-details
            @update:model-value="onImageUpload"
          />
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8 pt-4">
        <v-col>
          <v-slider
            v-model="blogTextInfo.secretLevel"
            thumb-label="always"
            thumb-color="red"
            show-ticks="always"
            label="Scret Level"
            :prepend-icon="lockIcon"
            :tick-labels="secretLabels"
            track-fill-color="red"
            :min="1"
            :max="3"
            :step="1"
          />
        </v-col>
        <v-col>
          <v-row no-gutters>
            <v-col>
              <v-switch
                v-model="blogTextInfo.protectedMode"
                class="mt-0 pt-0"
                prepend-icon="mdi-shield-lock-outline"
                color="green"
                label="Set this text protected"
              />
            </v-col>
            <v-col>
              <v-switch
                v-model="blogTextInfo.hiddenMode"
                class="mt-0 pt-0"
                prepend-icon="mdi-shield-lock-outline"
                color="blue"
                label="Set this text hidden"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8">
        <v-col>
          <v-expand-transition>
            <v-text-field
              v-if="blogTextInfo.protectedMode"
              v-model="blogTextInfo.protectedPassword"
              prepend-icon="mdi-shield-lock-outline"
              label="Protected Password"
              hint="Set Password to protect your text"
              clearable
              type="password"
            />
          </v-expand-transition>
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8">
        <v-col>
          <MdEditor v-model="blogTextInfo.content" theme="dark" language="en-US" />
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8">
        <v-col>
          <v-dialog v-model="dialog" width="500">
            <template #activator="{ props }">
              <v-btn v-bind="props" block>{{ btnName }}</v-btn>
            </template>
            <v-card>
              <v-card-title>{{ btnName }} The Text</v-card-title>
              <v-card-text>
                Be Sure Nothing Wrong:<br />
                <div class="pl-4">This text will be set as a<br /></div>
                <strong class="text-blue">{{ textMode('hiddenMode') }}</strong>
                <strong v-if="symbolCheck"> &amp; </strong>
                <strong :class="textColor">{{ textMode('protectedMode') }}</strong>Text
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="red darken-1" variant="text" @click="dialog = false">等等.</v-btn>
                <v-btn color="blue darken-2" variant="text" @click="uploadBlog">Yes, I AM!</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8 pb-8">
        <v-col>
          <v-btn variant="outlined" block @click="saveDraft">Save as Draft</v-btn>
        </v-col>
      </v-row>
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
  blogTextInfo.protectedMode ? 'text-green' : 'text-yellow-darken-2'
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
