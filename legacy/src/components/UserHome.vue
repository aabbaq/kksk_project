<template>
  <div>
    <v-card>
      <top-bar>
        <!-- <template #userDrawer>
          <v-app-bar-nav-icon @click='changeNavbar'></v-app-bar-nav-icon>
        </template> -->
        <template #changeUserTab='slotProps'>
          <v-tabs-items v-model="slotProps.tabProp">
            <v-tab-item v-for="item in slotProps.tabsInfo" :key="item.name" value="item">
              <!-- BUG -->
            </v-tab-item>
            <router-view></router-view>
         </v-tabs-items>
        </template>
      </top-bar>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'UserHome',
  data: () => ({
    tab: null
  }),
  methods: {
  },
  computed: {
  }
}
</script>

<style>
</style>
