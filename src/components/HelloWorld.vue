<template>
  <div>
    <top-bar></top-bar>
    <main-picture></main-picture>
    <v-container class='px-10'>
      <v-row v-for='(peekText, index) in peekTexts' v-bind:key='peekText.id' class='py-4' justify='center'>
        <v-col cols='9'>
          <v-hover>
            <template v-slot:default="{ hover }">
              <v-card
              @click='seeMore(peekText, index)'
              :elevation="hover ? 24 : 6"
              class='transition-swing rounded-xl'
              >
                <div>
                  <div>
                    <v-img
                      :src='require("../../static/" + peekText.picture + ".jpg")'
                      aspect-ratio='1.618'
                      class='rounded-t-xl'
                    ></v-img>
                  </div>
                  <div class='px-2'>
                    <v-card-title>
                      <div class='text-h4'>{{ peekText.title }}</div>
                      <v-spacer></v-spacer>
                      <div class='text-subtitle-2 font-weight-light font-italic'>{{ peekText.date }}</div>
                    </v-card-title>
                    <v-card-subtitle class='py-1'>
                      <div class='text-subtitle-1'>{{ peekText.subtitle }}</div>
                    </v-card-subtitle>
                    <v-card-text class='pt-3'>
                      <v-row>
                        <v-col><div>{{ peekText.author }}</div></v-col>
                        <!-- <v-spacer></v-spacer> -->
                        <v-col>
                          <v-btn rounded color='#8CD2BC' absolute right bottom @click='editText(peekText)'>
                            <v-icon color='white'>mdi-lead-pencil</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </div>
                </div>
              </v-card>
            </template>
          </v-hover>
        </v-col>
      </v-row>
      <v-row class="text-center">
        <v-col class="mb-4">
          <div justify="center" align="center">
            <v-card class="ma-10" max-width="450">
              <v-card-title>
                <div class="text-h6">
                  Main Page
                </div>
              </v-card-title>
              <v-text-field v-model="logined" class="mx-10" label="Do I Login in?" clearable>
              </v-text-field>
              <v-card-actions class="mx-5">
                <!-- <router-link :to="{ name: 'login' }"> -->
                <v-btn block @click="goToLoginPage"> GO Sign In</v-btn>
                <!-- </router-link> -->
              </v-card-actions>
              <v-card-actions class="mx-5">
              <v-btn block @click="goToPostPage"> Post A Blog</v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <foot-bar></foot-bar>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  beforeMount: function () {
    let userInfo = {}
    if (sessionStorage.getItem('session_user') === null) {
      userInfo.user = {
        name: 'guest',
        role: 0
      }
      userInfo.token = sessionStorage.getItem('session_authorization')
    } else {
      userInfo = {
        isLogin: this.$store.state.HaveCheckUserToken,
        user: JSON.parse(sessionStorage.getItem('session_user')),
        token: sessionStorage.getItem('session_authorization')
      }
    }
    console.log(userInfo)
    this.getBlogTextsInMainPage(userInfo)
  },
  data: () => ({
    logined: 'No',
    textCount: 0,
    peekTexts: []
  }),

  methods: {
    goToLoginPage: function (event) {
      this.$router.push({ name: 'login' })
    },
    goToPostPage: function (event) {
      this.$router.push({ name: 'post' })
    },
    seeMore: function (info, idx) {
      this.$router.push({
        name: 'content',
        params: {
          id: info.id,
          picture: info.picture,
          number: idx + 1
        }
      })
    },
    editText: function (info) {
      this.$router.push({
        name: 'post',
        params: {
          id: info.id
        }
      })
    },
    getBlogTextsInMainPage: function (userInfo) {
      this.$axios.post('http://localhost:3000/api/getBlogTexts', {
        isLogin: userInfo.isLogin,
        userName: userInfo.user.name,
        userRole: userInfo.user.role,
        userToken: userInfo.token
      }).then(res => {
        if (res.data.status === 200) {
          this.textCount = res.data.textsInfo.textsCount
          this.peekTexts = res.data.textsInfo.peekTexts
        } else {
          console.log('getBlogTextsInMainPage Error!')
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>
<style media="screen">
</style>
