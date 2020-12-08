<template lang="html">
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img :src="require('../assets/logo.svg')" class="my-3" contain height="200" />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Lothric
        </h1>
        <div justify="center" align="center">
          <v-card class="ma-10" max-width="450">
            <v-card-title>
              <div class="text-h6">
                Input Username and Password
              </div>
            </v-card-title>
            <v-text-field v-model="user_name" class="mx-10" label="Name" clearable>
            </v-text-field>
            <v-text-field v-model="user_password" class="mx-10 pb-5" label="Password" clearable>
            </v-text-field>
            <v-card-actions class="mx-5">
              <v-btn block @click="userSignIn">Sign In</v-btn>
            </v-card-actions>

          </v-card>
        </div>

      </v-col>

    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Login',
  data: () => ({
    user_name: 'aabbaq',
    user_password: 'caonima123'
  }),
  methods: {
    userSignIn () {
      var that = this
      this.$axios.post('http://localhost:3000/api/login', {
        username: this.user_name,
        password: this.user_password
      }).then((res) => {
        console.log(res.data.status)
        if (res.data.status === 200) {
          console.log(res.data.token)
          that.$store.commit('changeLogin', res.data)
          that.$store.commit('haveCheckUserToken')
          this.$router.push('/')
        }
      }).catch((err) => console.log(err))
    }
  }
}
</script>

<style lang="css" scoped>
</style>
