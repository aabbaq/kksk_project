<template>
  <div>
    <v-btn
      v-if="showUpBtn"
      color="primary"
      icon="mdi-navigation"
      size="large"
      position="fixed"
      location="bottom end"
      class="mr-12 mb-12"
      v-show="needGoUp"
      @click="flyToTheSky"
    />
    <v-btn
      v-else
      color="primary"
      icon="mdi-cards"
      position="fixed"
      location="bottom end"
      class="mr-16 mb-16"
      @click="showBtns = !showBtns"
    />
    <v-dialog v-model="btnDialog" width="500">
      <v-card>
        <v-card-title>Delete The Text</v-card-title>
        <v-card-text>Be Sure Nothing Wrong!</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red darken-1" variant="text" @click="btnDialog = false">等等.</v-btn>
          <v-btn color="blue darken-2" variant="text" @click="deleteCurrentText">Yes, I AM!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn
      v-if="showBtns"
      color="red lighten-1"
      icon="mdi-trash-can"
      position="fixed"
      location="bottom end"
      class="mr-9 mb-16"
      @click="btnDialog = true"
    />
    <v-btn
      v-if="showBtns"
      color="green lighten-3"
      icon="mdi-pencil"
      position="fixed"
      location="bottom end"
      class="mb-28 mr-16"
      @click="goToEditPage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { deleteText } from '@/api/text'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

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

onMounted(() => {
  onResize()
  onScroll()
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})

const needGoUp = computed(() => scrollDistance.value >= windowHeight.value - 50)
const showUpBtn = computed(() => !auth.isLoggedIn || route.name !== 'content')

function flyToTheSky () {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToEditPage () {
  router.push({
    name: 'post',
    params: { textNumber: String(route.params.number ?? '0') }
  })
}

async function deleteCurrentText () {
  btnDialog.value = false
  const id = (route.query.id ?? route.params.id) as string
  if (!id) return
  const res = await deleteText(id)
  if (res.status === 200) router.push({ name: 'helloworld' })
}
</script>
