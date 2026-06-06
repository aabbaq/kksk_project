<template>
  <div>
    <TopBar />
    <MainPicture />
    <v-container class="px-10">
      <v-row class="py-4" justify="center">
        <v-col cols="9">
          <v-row dense>
            <v-col cols="8">
              <v-text-field
                v-model="search"
                label="Search texts"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
                @keyup.enter="loadTexts"
              />
            </v-col>
            <v-col cols="4">
              <v-btn color="secondary" block @click="loadTexts">Search</v-btn>
            </v-col>
          </v-row>
          <v-chip-group v-if="tags.length" class="mt-2">
            <v-chip :color="!selectedTag ? 'secondary' : undefined" @click="selectTag('')">All</v-chip>
            <v-chip
              v-for="tag in tags"
              :key="tag"
              :color="selectedTag === tag ? 'secondary' : undefined"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>

      <v-row v-for="(peekText, index) in peekTexts" :key="peekText.id" class="py-4" justify="center">
        <v-col cols="9">
          <v-hover>
            <template #default="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 24 : 6"
                class="transition-swing rounded-xl"
                @click="seeMore(peekText)"
              >
                <v-img :src="imageSrc(peekText.picture)" aspect-ratio="1.618" class="rounded-t-xl" cover />
                <div class="px-2">
                  <v-card-title>
                    <div class="text-h4">{{ peekText.title }}</div>
                    <v-spacer />
                    <div class="text-subtitle-2 font-weight-light font-italic">{{ peekText.date }}</div>
                  </v-card-title>
                  <v-card-subtitle class="py-1">
                    <div class="text-subtitle-1">{{ peekText.subtitle }}</div>
                  </v-card-subtitle>
                  <v-card-text class="pt-3">
                    <v-row align="center">
                      <div class="pl-3">{{ peekText.author }}</div>
                      <v-chip v-if="peekText.tag" size="small" class="ml-2">{{ peekText.tag }}</v-chip>
                      <v-spacer />
                      <div v-if="auth.isLoggedIn" class="pr-2">
                        <v-btn rounded color="#8CD2BC" @click.stop="editText(peekText)">
                          <v-icon color="white">mdi-lead-pencil</v-icon>
                        </v-btn>
                      </div>
                      <div v-if="auth.isLoggedIn" class="pr-2">
                        <v-btn rounded color="#FF5234" @click.stop="showDialog(peekText.id, index)">
                          <v-icon color="white">mdi-trash-can-outline</v-icon>
                        </v-btn>
                      </div>
                    </v-row>
                  </v-card-text>
                </div>
              </v-card>
            </template>
          </v-hover>
        </v-col>
      </v-row>

      <v-row v-if="totalPages > 1" justify="center" class="pb-6">
        <v-col cols="9">
          <v-pagination v-model="page" :length="totalPages" @update:model-value="loadTexts" />
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>Delete The Text</v-card-title>
        <v-card-text>Be Sure Nothing Wrong!</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red darken-1" variant="text" @click="dialog = false">等等.</v-btn>
          <v-btn color="blue darken-2" variant="text" @click="confirmDelete">Yes, I AM!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <FootBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import MainPicture from '@/components/layout/MainPicture.vue'
import FootBar from '@/components/layout/FootBar.vue'
import { useAuthStore } from '@/stores/auth'
import { tokenCheck } from '@/api/user'
import { deleteText, getBlogTexts } from '@/api/text'
import { imageSrc } from '@/utils/image'

interface PeekText {
  id: string
  number: number
  title: string
  subtitle: string
  author: string
  date: string
  picture: string
  tag?: string
}

const auth = useAuthStore()
const router = useRouter()

const dialog = ref(false)
const dealingId = ref('')
const dealingNum = ref(0)
const peekTexts = ref<PeekText[]>([])
const tags = ref<string[]>([])
const search = ref('')
const selectedTag = ref('')
const page = ref(1)
const totalPages = ref(1)

async function loadTexts () {
  const res = await getBlogTexts({
    page: page.value,
    pageSize: 10,
    search: search.value || undefined,
    tag: selectedTag.value || undefined
  })
  if (res.status === 200) {
    peekTexts.value = res.peekTexts
    tags.value = res.tags ?? []
    totalPages.value = res.totalPages ?? 1
  }
}

function selectTag (tag: string) {
  selectedTag.value = tag
  page.value = 1
  loadTexts()
}

function showDialog (id: string, idx: number) {
  dialog.value = true
  dealingNum.value = idx
  dealingId.value = id
}

async function confirmDelete () {
  dialog.value = false
  const res = await deleteText(dealingId.value)
  if (res.status === 200) await loadTexts()
}

function seeMore (info: PeekText) {
  router.push({
    name: 'content',
    params: {
      textTitle: info.title,
      textAuthor: info.author
    },
    query: { id: info.id, picture: info.picture, number: String(info.number) }
  })
}

function editText (info: PeekText) {
  router.push({
    name: 'post',
    params: { textNumber: String(info.number) },
    query: { id: info.id }
  })
}

onMounted(async () => {
  const token = sessionStorage.getItem('session_authorization')
  if (token && !auth.haveCheckUserToken) {
    try {
      await tokenCheck()
      auth.haveCheckUserTokenCommit()
    } catch { /* guest */ }
  }
  await loadTexts()
})
</script>
