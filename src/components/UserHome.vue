<template>
  <div>
    <v-card>
      <top-bar>
        <!-- <template #userDrawer>
          <v-app-bar-nav-icon @click='changeNavbar'></v-app-bar-nav-icon>
        </template> -->
        <template #changeUserTab='slotProps'>
          <v-tabs-items v-model="slotProps.tabProp">
            <v-tab-item v-for="item in slotProps.tabsName" :key="item">
              <v-card flat>
                <v-card-text v-text="text"></v-card-text>
              </v-card>
            </v-tab-item>
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
    tab: null,
    items: [
      'web', 'shopping', 'videos', 'images', 'news'
    ],
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  }),
  methods: {
    changeNavbar: function () {
      this.drawer = !this.drawer
    },
    isThereUserHome () {
      return this.$route.name === 'user'
    }
  },
  computed: {
  }
}
</script>

<style>
</style>
