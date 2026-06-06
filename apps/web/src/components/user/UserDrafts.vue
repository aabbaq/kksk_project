<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <h2 class="text-h5 mb-4">Drafts</h2>
        <v-card v-for="draft in drafts" :key="draft.id" class="mb-4 rounded-xl" elevation="6">
          <v-card-title>{{ draft.title || '(Untitled draft)' }}</v-card-title>
          <v-card-subtitle>{{ draft.date }} — {{ draft.subtitle }}</v-card-subtitle>
          <v-card-actions>
            <v-btn color="secondary" variant="text" @click="editDraft(draft)">Continue Editing</v-btn>
            <v-spacer />
            <v-btn color="error" variant="text" @click="removeDraft(draft.id)">Delete</v-btn>
          </v-card-actions>
        </v-card>
        <v-alert v-if="!drafts.length" type="info" variant="tonal">No drafts yet.</v-alert>
      </v-col>
    </v-row>
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
