<template>
  <v-container class="lothric-container lothric-container--narrow py-6">
    <h2 class="text-h5 font-weight-medium mb-6">{{ t.drafts.title }}</h2>
    <div class="lothric-stack">
      <v-card
        v-for="draft in drafts"
        :key="draft.id"
        class="lothric-card"
      >
        <v-card-item>
          <template #title>
            {{ draft.title || t.drafts.untitled }}
          </template>
          <template #subtitle>
            {{ draft.date }} — {{ draft.subtitle }}
          </template>
        </v-card-item>
        <v-card-actions class="px-4 pb-4">
          <v-btn variant="text" class="lothric-btn-blend" @click="editDraft(draft)">
            {{ t.drafts.continueEdit }}
          </v-btn>
          <v-spacer />
          <v-btn color="error" variant="text" @click="removeDraft(draft.id)">
            {{ t.drafts.delete }}
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-alert v-if="!drafts.length" type="info" variant="tonal" class="rounded-xl">
        {{ t.drafts.empty }}
      </v-alert>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { deleteText, getBlogTexts } from '@/api/text'
import { useLocaleStore } from '@/stores/locale'

interface DraftItem {
  id: string
  number: number
  title: string
  subtitle: string
  date: string
}

const router = useRouter()
const localeStore = useLocaleStore()
const { t } = storeToRefs(localeStore)
const drafts = ref<DraftItem[]>([])

async function loadDrafts () {
  const res = await getBlogTexts({ draft: true, pageSize: 50 })
  if (res.status === 200) drafts.value = res.peekTexts
}

function editDraft (draft: DraftItem) {
  router.push({
    name: 'post',
    params: { textNumber: String(draft.number) },
    query: { id: draft.id }
  })
}

async function removeDraft (id: string) {
  await deleteText(id)
  await loadDrafts()
}

onMounted(loadDrafts)
</script>
