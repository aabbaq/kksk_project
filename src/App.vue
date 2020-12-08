<template>
  <v-app dark>
    <top-bar></top-bar>
    <div>
      <router-view></router-view>
    </div>
  </v-app>
</template>

<script>
// import HelloWorld from './components/HelloWorld'

export default {
  name: 'App',

  // components: {
  //   HelloWorld
  // },

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
