<template>
  <v-container class="lothric-container py-6">
    <v-slide-group v-model="model" show-arrows class="mb-4">
      <v-slide-group-item
        v-for="(eachText, idx) in peekTexts"
        :key="eachText.id"
        v-slot="{ isSelected, toggle }"
        :value="idx"
      >
        <v-card
          class="lothric-card ma-3"
          :color="isSelected ? 'surface-bright' : 'surface'"
          width="280"
          :elevation="isSelected ? 4 : 2"
          @click="toggle"
        >
          <v-img :src="imageSrc(eachText.picture)" height="180" cover />
          <v-card-item class="pb-0">
            <template #title>
              <span class="text-body-large font-weight-bold text-truncate">
                {{ eachText.title }}
              </span>
            </template>
            <template #subtitle>
              <span class="text-caption font-italic">{{ eachText.date }}</span>
            </template>
          </v-card-item>
          <v-card-text class="pt-1 pb-2">
            <div class="text-body-medium text-truncate mb-1">{{ eachText.subtitle }}</div>
            <div class="text-caption">{{ eachText.author }}</div>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn color="secondary" variant="text" size="small" @click.stop="toggleMode(eachText)">
              Explore
            </v-btn>
            <v-spacer />
            <v-btn icon variant="text" size="small" @click.stop="toggleMode(eachText)">
              <v-icon size="small">
                {{ eachText.mode?.needShow ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </v-card-actions>
          <v-expand-transition>
            <div v-show="eachText.mode?.needShow">
              <v-divider />
              <v-card-text class="text-caption pt-3">
                This Text is<br />
                {{ textType(eachText.mode) }}
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>

    <v-expand-transition>
      <v-sheet
        v-if="model !== null && peekTexts[model]"
        class="lothric-panel mb-6 text-center"
        rounded="xl"
      >
        <p class="text-h6 font-weight-medium mb-4 px-4">
          What Do You Want To Do With {{ peekTexts[model].title }}
        </p>
        <div class="d-flex justify-center flex-wrap ga-3 px-4 pb-2">
          <v-btn
            v-for="eachBtn in btnList"
            :key="eachBtn.name"
            :color="eachBtn.color"
            variant="tonal"
            min-width="100"
            @click="dealWithTexts(eachBtn.name, peekTexts[model])"
          >
            {{ eachBtn.name }}
          </v-btn>
        </div>
      </v-sheet>
    </v-expand-transition>

    <div class="d-flex justify-center mt-2">
      <v-btn color="secondary" variant="flat" width="280" size="large" @click="goToPostPage">
        Post A New Text
      </v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="480">
      <v-card class="lothric-card pa-2">
        <v-card-title>Delete Text</v-card-title>
        <v-card-text>Are You Sure Of Deleting {{ deletingTitle }}</v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn color="error" variant="text" @click="dialog = false">等等.</v-btn>
          <v-btn color="secondary" variant="text" @click="confirmDelete">Yes, I AM!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteText, getBlogTexts } from '@/api/text'
import { imageSrc } from '@/utils/image'

interface TextMode {
  needShow: boolean
  protected: boolean
  hidden: boolean
  secretLevel: number
}

interface PeekText {
  id: string
  number: number
  title: string
  subtitle: string
  author: string
  date: string
  picture: string
  mode?: TextMode
}

const router = useRouter()
const model = ref<number | null>(null)
const dialog = ref(false)
const deletingId = ref('')
const deletingTitle = ref('')
const peekTexts = ref<PeekText[]>([])

const btnList = [
  { name: 'View', color: 'secondary' },
  { name: 'Edit', color: 'primary' },
  { name: 'Delete', color: 'error' }
]

async function loadTexts () {
  const res = await getBlogTexts({ needCardsInfo: true, pageSize: 50 })
  if (res.status === 200) peekTexts.value = res.peekTexts
}

function textType (textMode?: TextMode) {
  if (!textMode) return 'Normal '
  if (textMode.hidden) return textMode.protected ? 'Hidden & Protected ' : 'Hidden '
  if (textMode.protected) return 'Protected '
  return 'Normal '
}

function toggleMode (text: PeekText) {
  if (text.mode) text.mode.needShow = !text.mode.needShow
}

function dealWithTexts (pageName: string, textInfo: PeekText) {
  if (pageName === 'Edit') {
    router.push({ name: 'post', params: { textNumber: String(textInfo.number) }, query: { id: textInfo.id } })
  } else if (pageName === 'View') {
    router.push({
      name: 'content',
      params: { textAuthor: textInfo.author, textTitle: textInfo.title },
      query: { id: textInfo.id, picture: textInfo.picture, number: String(textInfo.number) }
    })
  } else {
    deletingId.value = textInfo.id
    deletingTitle.value = textInfo.title
    dialog.value = true
  }
}

async function confirmDelete () {
  dialog.value = false
  const res = await deleteText(deletingId.value)
  if (res.status === 200) await loadTexts()
}

function goToPostPage () {
  router.push({ name: 'post', params: { textNumber: '0' } })
}

onMounted(loadTexts)
</script>
