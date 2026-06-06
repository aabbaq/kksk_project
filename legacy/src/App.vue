<template>
  <v-app dark>
    <router-view></router-view>
    <function-button></function-button>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    //
  }),
  methods: {
    backToMainPage () {
      this.$router.push({
        name: 'helloworld'
      }).catch((err) => console.log(err))
    }
  }
}
</script>
