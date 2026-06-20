<template>
  <v-footer class="lothric-footer" :style="{ backgroundColor: colors.footbarBg }">
    <v-container class="lothric-footer__inner text-center">
      <span class="lothric-footer__text">LothricCastle</span>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppearanceStore } from '@/stores/appearance'

const appearance = useAppearanceStore()
const { colors } = storeToRefs(appearance)
</script>
