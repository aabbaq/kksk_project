<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { deleteText, getBlogTexts } from '@/api/text'
import { imageSrc } from '@/utils/image'
import { useLocaleStore } from '@/stores/locale'

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
const localeStore = useLocaleStore()
const { t } = storeToRefs(localeStore)

const model = ref<number | null>(null)
const dialog = ref(false)
const peekTexts = ref<PeekText[]>([])
const loading = ref(false)
const loadError = ref('')

const btnList = computed(() => [
  { key: 'View', label: t.value.texts.view },
  { key: 'Edit', label: t.value.texts.edit },
  { key: 'Delete', label: t.value.texts.delete, color: 'error' }
])

async function loadTexts () {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getBlogTexts({ needCardsInfo: true, pageSize: 50 })
    if (res.status === 200) {
      peekTexts.value = res.peekTexts ?? []
    }
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Failed to load texts'
    peekTexts.value = []
  } finally {
    loading.value = false
  }
}

function clickCard () {
  peekTexts.value.forEach((each) => {
    if (each.mode) each.mode.needShow = false
  })
}

function textType (textMode: TextMode) {
  if (textMode.hidden) {
    return textMode.protected
      ? `${t.value.texts.textTypeHidden} & ${t.value.texts.textTypeProtected}`
      : t.value.texts.textTypeHidden
  }
  return textMode.protected ? t.value.texts.textTypeProtected : t.value.texts.textTypeNormal
}

function dealWithTexts (pageName: string, textInfo: PeekText) {
  if (pageName === 'Edit') {
    router.push({
      name: 'post',
      params: { textNumber: String(textInfo.number) },
      query: { id: textInfo.id }
    })
  } else if (pageName === 'View') {
    router.push({
      name: 'content',
      params: { textAuthor: textInfo.author, textTitle: textInfo.title },
      query: { id: textInfo.id, picture: textInfo.picture, number: String(textInfo.number) }
    })
  } else {
    dialog.value = true
  }
}

async function confirmDelete () {
  if (model.value === null) return
  const info = peekTexts.value[model.value]
  dialog.value = false
  const res = await deleteText(info.id)
  if (res.status === 200) await loadTexts()
}

function goPost () {
  router.push({ name: 'post', params: { textNumber: '0' } })
}

onMounted(loadTexts)
</script>

<template>
  <v-container class="lothric-container py-6">
    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
      {{ loadError }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="secondary" class="mb-4" />

    <v-slide-group
      v-else-if="peekTexts.length"
      v-model="model"
      show-arrows
      center-active
      class="pa-2"
    >
      <v-slide-group-item
        v-for="eachText in peekTexts"
        :key="eachText.id"
        v-slot="{ isSelected, toggle }"
      >
        <v-card
          class="ma-3 lothric-card"
          :color="isSelected ? 'rgba(0, 0, 0, 0.45)' : undefined"
          width="300"
          @click="clickCard(); toggle()"
        >
          <v-img :src="imageSrc(eachText.picture)" height="200" cover />
          <v-card-title class="d-flex align-center">
            <span class="font-weight-bold text-truncate">{{ eachText.title }}</span>
            <v-spacer />
            <span class="text-caption font-italic">{{ eachText.date }}</span>
          </v-card-title>
          <v-card-subtitle class="py-1">
            {{ eachText.subtitle }}
          </v-card-subtitle>
          <v-card-text class="pt-1">
            {{ eachText.author }}
          </v-card-text>
          <v-card-actions>
            <v-btn
              variant="text"
              class="lothric-btn-blend"
              @click.stop="eachText.mode && (eachText.mode.needShow = !eachText.mode.needShow)"
            >
              {{ t.texts.explore }}
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="eachText.mode"
              icon
              variant="text"
              @click.stop="eachText.mode.needShow = !eachText.mode.needShow"
            >
              <v-icon>
                {{ eachText.mode.needShow ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </v-card-actions>
          <v-expand-transition>
            <div v-show="eachText.mode?.needShow">
              <v-divider />
              <v-card-text>
                {{ eachText.mode ? textType(eachText.mode) : t.texts.textTypeUnknown }}
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>

    <v-alert
      v-else-if="!loading"
      type="info"
      variant="tonal"
      class="mb-4 rounded-xl"
    >
      {{ t.texts.empty }}
    </v-alert>

    <v-expand-transition>
      <v-sheet v-if="model !== null && peekTexts[model]" class="mt-4 pa-4 lothric-panel">
        <h3 class="text-h6 font-weight-bold text-center mb-4">
          {{ t.texts.actionPrompt }}
        </h3>
        <div class="d-flex justify-center flex-wrap ga-3">
          <v-btn
            v-for="eachBtn in btnList"
            :key="eachBtn.key"
            :color="eachBtn.color"
            :class="eachBtn.color ? '' : 'lothric-btn-blend'"
            variant="text"
            size="large"
            @click="dealWithTexts(eachBtn.key, peekTexts[model])"
          >
            {{ eachBtn.label }}
          </v-btn>
        </div>
      </v-sheet>
    </v-expand-transition>

    <div class="d-flex justify-center mt-8">
      <v-btn variant="text" class="lothric-btn-blend" size="large" width="320" @click="goPost">
        {{ t.texts.postNew }}
      </v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="480">
      <v-card class="lothric-card pa-2">
        <v-card-title>{{ t.texts.deleteTitle }}</v-card-title>
        <v-card-text v-if="model !== null">
          {{ t.texts.deleteBody }}
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn color="error" variant="text" @click="dialog = false">等等.</v-btn>
          <v-btn color="secondary" variant="text" @click="confirmDelete">Yes, I AM!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
