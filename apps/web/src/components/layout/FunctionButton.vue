<template>
  <div ref="rootRef" class="function-button-root">
    <v-scale-transition v-if="showUpBtn" origin="bottom right">
      <v-btn
        v-show="needGoUp"
        color="primary"
        icon="mdi-navigation"
        size="large"
        rounded="circle"
        class="function-button-root__toggle"
        @click="flyToTheSky"
      />
    </v-scale-transition>

    <v-scale-transition v-if="!showUpBtn" origin="bottom right">
      <v-btn
        color="primary"
        icon="mdi-cards"
        size="large"
        rounded="circle"
        class="function-button-root__toggle"
        @click.stop="showBtns = !showBtns"
      />
    </v-scale-transition>

    <v-scale-transition v-if="!showUpBtn" origin="bottom right">
      <v-btn
        v-if="showBtns && canManageCurrent"
        icon="mdi-pencil"
        size="large"
        rounded="circle"
        class="function-button-root__item function-button-root__item--edit lothric-btn-icon-edit"
        @click.stop="goToEditPage"
      />
    </v-scale-transition>

    <v-scale-transition v-if="!showUpBtn" origin="bottom right">
      <v-btn
        v-if="showBtns && canManageCurrent"
        icon="mdi-trash-can"
        size="large"
        rounded="circle"
        class="function-button-root__item function-button-root__item--delete lothric-btn-icon-delete"
        @click.stop="btnDialog = true"
      />
    </v-scale-transition>

    <v-scale-transition v-if="!showUpBtn" origin="bottom right">
      <v-btn
        v-if="showBtns && needGoUp"
        color="primary"
        icon="mdi-navigation"
        size="large"
        rounded="circle"
        class="function-button-root__item function-button-root__item--up"
        @click.stop="flyToTheSky"
      />
    </v-scale-transition>

    <v-dialog v-model="btnDialog" width="500" :z-index="24000">
      <v-card class="lothric-card pa-2">
        <v-card-title>Delete The Text</v-card-title>
        <v-card-text>Be Sure Nothing Wrong!</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" variant="text" @click="btnDialog = false">等等.</v-btn>
          <v-btn variant="text" class="lothric-btn-blend" @click="deleteCurrentText">Yes, I AM!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useContentStore } from '@/stores/content'
import { deleteText } from '@/api/text'
import { canManageArticle } from '@/utils/articleAccess'

const auth = useAuthStore()
const contentStore = useContentStore()
const route = useRoute()
const router = useRouter()

const rootRef = ref<HTMLElement | null>(null)
const btnDialog = ref(false)
const showBtns = ref(false)
const scrollDistance = ref(0)
const windowHeight = ref(0)

function onScroll () {
  scrollDistance.value = window.pageYOffset
}
function onResize () {
  windowHeight.value = window.innerHeight
}

function onDocumentClick (event: MouseEvent) {
  if (!showBtns.value) return
  const root = rootRef.value
  if (root && !root.contains(event.target as Node)) {
    showBtns.value = false
  }
}

onMounted(() => {
  onResize()
  onScroll()
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onDocumentClick)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onDocumentClick)
})

const needGoUp = computed(() => scrollDistance.value >= windowHeight.value - 50)
const canManageCurrent = computed(() => canManageArticle(contentStore.ownerId))
const showUpBtn = computed(() => {
  if (!auth.isLoggedIn) return true
  if (route.name !== 'content') return true
  return !canManageCurrent.value
})

function flyToTheSky () {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToEditPage () {
  showBtns.value = false
  router.push({
    name: 'post',
    params: { textNumber: String(route.query.number ?? '0') },
    query: route.query.id ? { id: String(route.query.id) } : undefined
  })
}

async function deleteCurrentText () {
  btnDialog.value = false
  const id = String(route.query.id ?? '')
  if (!id) return
  const res = await deleteText(id)
  if (res.status === 200) router.push({ name: 'helloworld' })
}
</script>

<style scoped>
.function-button-root {
  position: fixed;
  right: 96px;
  bottom: 96px;
  z-index: 1000;
  width: 56px;
  height: 56px;
}

.function-button-root__toggle {
  position: absolute;
  right: 0;
  bottom: 0;
}

.function-button-root__item {
  position: absolute;
  right: 0;
}

.function-button-root__item--edit {
  bottom: 72px;
}

.function-button-root__item--delete {
  bottom: 144px;
}

.function-button-root__item--up {
  bottom: 216px;
}
</style>
