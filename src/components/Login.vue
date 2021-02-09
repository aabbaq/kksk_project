<template>
  <div>
    <top-bar></top-bar>
    <v-container>
      <v-row class="text-center">
        <v-col cols="12">
          <v-img :src="require('../assets/logo.svg')" class="my-3" contain height="200" />
        </v-col>
      </v-row>
      <v-row class="text-center">
        <v-col class="mb-4" cols="12">
          <h1 class="display-2 font-weight-bold mb-3">
            Welcome to Lothric
          </h1>
          <div justify="center" align="center">
            <v-card class="ma-10" max-width="450">
              <v-card-title class="pl-8">
                <div class="text-h5">
                  Login
                </div>
              </v-card-title>
              <v-text-field
                color="purple darken-2"
                v-model="userName"
                :rules='rules.username'
                class="mx-10"
                label="Name"
                @click='refreshInput'
                @keydown="enterSignIn"
                clearable
              >
              </v-text-field>
              <v-text-field
                color='teal'
                v-model="userPassword"
                :rules='rules.password'
                class="mx-10 pb-2"
                label="Password"
                type='password'
                @click='refreshInput'
                @keydown="enterSignIn"
                clearable
              >
              </v-text-field>
              <div class="mx-10 mt-0">
                <v-alert type='error' transition='scale-transition' dense dismissible :value='inputError' id='inputAlert'>
                  Wrong <strong>Password</strong> or <strong>Username</strong>!
                </v-alert>
              </div>
              <v-card-actions class="mx-5">
                <v-btn type='submit' color='red lighten-2' block text :disabled='canSubmit' @click="userSignIn">
                  <v-icon color='red lighten-2' left>mdi-campfire</v-icon>
                  Light BonFire
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data: () => ({
    userName: 'aabbaq',
    userPassword: 'caonima123',
    inputError: false,
    rules: {
      username: [v => !!v || 'NEED USER NAME!'],
      password: [v => !!v || 'NEED PASSWORD!']
    }
  }),
  methods: {
    userSignIn () {
      this.inputError = false
      this.$axios.post('http://localhost:3000/api/login', {
        username: this.userName,
        password: this.userPassword
      }).then((res) => {
        console.log(res.data.status)
        if (res.data.status === 200) {
          this.$store.commit('changeLogin', res.data)
          this.$store.commit('haveCheckUserToken')
          this.$router.push('/').catch(err => console.log(err))
        } else {
          this.inputError = true
        }
      }).catch((err) => console.log(err))
    },
    refreshInput () {
      this.inputError = false
    },
    enterSignIn (e) {
      if (e.keyCode === 13) {
        this.userSignIn()
      }
    }
  },
  computed: {
    canSubmit () {
      return !this.userName || !this.userPassword
    }
  }
}
</script>

<style lang="css" scoped>
</style>
