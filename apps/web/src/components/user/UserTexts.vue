<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-sheet max-width="75%" width="100%">
        <v-slide-group v-model="model" show-arrows class="pa-4" center-active>
          <v-slide-group-item
            v-for="(eachText, idx) in peekTexts"
            :key="eachText.id"
            v-slot="{ isSelected, toggle }"
            :value="idx"
          >
            <div class="mx-6 my-2" @click="collapseOthers">
              <v-card
                :color="isSelected ? 'rgba(0, 0, 0, 0.8)' : 'white'"
                width="300"
                @click="toggle"
              >
                <v-img :src="imageSrc(eachText.picture)" height="200" cover />
                <div :class="isSelected ? 'text-white' : ''">
                  <v-card-title>
                    <div class="font-weight-bold">{{ eachText.title }}</div>
                    <v-spacer />
                    <div class="text-subtitle-2 font-weight-light font-italic">{{ eachText.date }}</div>
                  </v-card-title>
                  <v-card-subtitle class="py-1">
                    {{ eachText.subtitle }}
                  </v-card-subtitle>
                  <v-card-text class="pt-1">{{ eachText.author }}</v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="orange lighten-2"
                      variant="text"
                      @click.stop="toggleMode(eachText)"
                    >
                      Explore
                    </v-btn>
                    <v-spacer />
                    <v-btn icon variant="text" @click.stop="toggleMode(eachText)">
                      <v-icon :color="isSelected ? 'white' : undefined">
                        {{ eachText.mode?.needShow ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </v-btn>
                  </v-card-actions>
                  <v-expand-transition>
                    <div v-show="eachText.mode?.needShow">
                      <v-divider />
                      <v-card-text :class="isSelected ? 'text-white' : ''">
                        This Text is <br />
                        {{ textType(eachText.mode) }}
                      </v-card-text>
                    </div>
                  </v-expand-transition>
                </div>
              </v-card>
            </div>
          </v-slide-group-item>
        </v-slide-group>

        <v-expand-transition>
          <v-sheet v-if="model !== null && peekTexts[model]" height="80" tile>
            <v-row align="center" justify="center">
              <h3 class="text-h6 font-weight-bold">
                What Do You Want To Do With {{ peekTexts[model].title }}
              </h3>
            </v-row>
            <v-row align="center" justify="space-around" no-gutters>
              <v-btn
                v-for="eachBtn in btnList"
                :key="eachBtn.name"
                :color="eachBtn.color"
                variant="text"
                width="20%"
                size="large"
                @click="dealWithTexts(eachBtn.name, peekTexts[model])"
              >
                {{ eachBtn.name }}
              </v-btn>
            </v-row>
          </v-sheet>
        </v-expand-transition>
      </v-sheet>
    </v-row>
    <v-row justify="center" align="center">
      <v-btn variant="text" class="mt-4" width="65%" @click="goToPostPage">Post A New Text</v-btn>
    </v-row>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>Delete Text</v-card-title>
        <v-card-text>Are You Sure Of Deleting {{ deletingTitle }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red darken-1" variant="text" @click="dialog = false">等等.</v-btn>
          <v-btn color="blue darken-2" variant="text" @click="confirmDelete">Yes, I AM!</v-btn>
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
  { name: 'View', color: 'green' },
  { name: 'Edit', color: 'blue' },
  { name: 'Delete', color: 'red' }
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

function collapseOthers () {
  peekTexts.value.forEach(t => {
    if (t.mode) t.mode.needShow = false
  })
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
