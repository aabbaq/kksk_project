<template>
  <v-app theme="dark" class="lothric-app">
    <router-view />
    <FunctionButton />
  </v-app>
</template>

<script setup lang="ts">
import FunctionButton from '@/components/layout/FunctionButton.vue'
</script>

<style>
.lothric-app {
  background: var(--lothric-bg) !important;
}
</style>
