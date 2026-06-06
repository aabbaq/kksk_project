<script setup lang="ts">
import TopBar from '@/components/layout/TopBar.vue'
import LothricPage from '@/components/layout/LothricPage.vue'
</script>

<template>
  <div>
    <TopBar />
    <LothricPage toolbar-offset="user">
      <router-view />
    </LothricPage>
  </div>
</template>
