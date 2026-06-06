<template>
  <v-app theme="dark">
    <router-view />
    <FunctionButton />
  </v-app>
</template>

<script setup lang="ts">
import FunctionButton from '@/components/layout/FunctionButton.vue'
</script>
