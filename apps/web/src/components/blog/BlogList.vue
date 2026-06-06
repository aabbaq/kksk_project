<template>
  <div>
    <TopBar />
    <MainPicture />

    <v-container class="lothric-container">
      <!-- Search & filters -->
      <section class="lothric-panel mb-6">
        <v-row align="center" :style="{ gap: '12px' }">
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="search"
              label="Search texts"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              @keyup.enter="loadTexts"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn color="secondary" block height="48" @click="loadTexts">
              Search
            </v-btn>
          </v-col>
        </v-row>
        <v-chip-group v-if="tags.length" class="mt-4">
          <v-chip
            :color="!selectedTag ? 'secondary' : undefined"
            :variant="!selectedTag ? 'flat' : 'outlined'"
            @click="selectTag('')"
          >
            All
          </v-chip>
          <v-chip
            v-for="tag in tags"
            :key="tag"
            :color="selectedTag === tag ? 'secondary' : undefined"
            :variant="selectedTag === tag ? 'flat' : 'outlined'"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </v-chip>
        </v-chip-group>
      </section>

      <!-- Article list -->
      <div class="lothric-stack--loose">
        <v-card
          v-for="(peekText, index) in peekTexts"
          :key="peekText.id"
          class="lothric-card lothric-card--interactive"
          :elevation="hoveredId === peekText.id ? 4 : 2"
          @mouseenter="hoveredId = peekText.id"
          @mouseleave="hoveredId = ''"
          @click="seeMore(peekText)"
        >
          <v-img
            :src="imageSrc(peekText.picture)"
            aspect-ratio="1.618"
            cover
            class="rounded-t-xl"
          />
          <v-card-item class="pb-0">
            <template #title>
              <span class="text-h5 font-weight-medium">{{ peekText.title }}</span>
            </template>
            <template #subtitle>
              <span class="text-caption font-italic">{{ peekText.date }}</span>
            </template>
          </v-card-item>
          <v-card-text class="pt-2 pb-4">
            <div class="text-body-large text-medium-emphasis mb-3">
              {{ peekText.subtitle }}
            </div>
            <div class="d-flex align-center flex-wrap ga-2">
              <span class="text-body-medium">{{ peekText.author }}</span>
              <v-chip v-if="peekText.tag" size="small" variant="outlined">
                {{ peekText.tag }}
              </v-chip>
              <v-spacer />
              <template v-if="auth.isLoggedIn">
                <v-btn
                  icon
                  size="small"
                  color="#8CD2BC"
                  variant="flat"
                  @click.stop="editText(peekText)"
                >
                  <v-icon color="white" size="small">mdi-lead-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="#FF5234"
                  variant="flat"
                  @click.stop="showDialog(peekText.id, index)"
                >
                  <v-icon color="white" size="small">mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>
            </div>
          </v-card-text>
        </v-card>

        <v-alert
          v-if="!loading && !peekTexts.length"
          type="info"
          variant="tonal"
          class="rounded-xl"
        >
          No texts found. Kindle a new bonfire when you are ready.
        </v-alert>
      </div>

      <div v-if="totalPages > 1" class="d-flex justify-center mt-8">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          rounded="circle"
          @update:model-value="loadTexts"
        />
      </div>
    </v-container>

    <v-dialog v-model="dialog" max-width="480">
      <v-card class="lothric-card pa-2">
        <v-card-title>Delete The Text</v-card-title>
        <v-card-text>Be Sure Nothing Wrong!</v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn color="error" variant="text" @click="dialog = false">等等.</v-btn>
          <v-btn color="secondary" variant="text" @click="confirmDelete">Yes, I AM!</v-btn>
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
const hoveredId = ref('')
const loading = ref(false)
const peekTexts = ref<PeekText[]>([])
const tags = ref<string[]>([])
const search = ref('')
const selectedTag = ref('')
const page = ref(1)
const totalPages = ref(1)

async function loadTexts () {
  loading.value = true
  try {
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
  } finally {
    loading.value = false
  }
}

function selectTag (tag: string) {
  selectedTag.value = tag
  page.value = 1
  loadTexts()
}

function showDialog (id: string, _idx: number) {
  dialog.value = true
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
    params: { textTitle: info.title, textAuthor: info.author },
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
