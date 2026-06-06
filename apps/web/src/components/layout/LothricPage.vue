<script setup lang="ts">
defineProps<{
  /** Extra top offset when page has double-height app bar (e.g. user tabs) */
  toolbarOffset?: 'default' | 'user'
}>()
</script>

<template>
  <v-main
    class="lothric-main"
    :class="toolbarOffset === 'user' ? 'lothric-main--user' : ''"
  >
    <slot />
  </v-main>
</template>
