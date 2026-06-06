<template>
  <v-container class="lothric-container lothric-container--narrow py-6">
    <h2 class="text-h5 font-weight-medium mb-6">Drafts</h2>
    <div class="lothric-stack">
      <v-card
        v-for="draft in drafts"
        :key="draft.id"
        class="lothric-card"
      >
        <v-card-item>
          <template #title>
            {{ draft.title || '(Untitled draft)' }}
          </template>
          <template #subtitle>
            {{ draft.date }} — {{ draft.subtitle }}
          </template>
        </v-card-item>
        <v-card-actions class="px-4 pb-4">
          <v-btn variant="text" class="lothric-btn-blend" @click="editDraft(draft)">
            Continue Editing
          </v-btn>
          <v-spacer />
          <v-btn color="error" variant="text" @click="removeDraft(draft.id)">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-alert v-if="!drafts.length" type="info" variant="tonal" class="rounded-xl">
        No drafts yet.
      </v-alert>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteText, getBlogTexts } from '@/api/text'

interface DraftItem {
  id: string
  number: number
  title: string
  subtitle: string
  date: string
}

const router = useRouter()
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
