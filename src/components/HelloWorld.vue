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
                        <div class='pl-3'>{{ peekText.author }}</div>
                        <v-spacer></v-spacer>
                        <div class="pr-2" v-if='haveAuthorization'>
                          <v-btn rounded color='#8CD2BC' @click='editText(peekText, index)'>
                            <v-icon color='white'>mdi-lead-pencil</v-icon>
                          </v-btn>
                        </div>
                        <v-dialog width="500" v-model="dialog">
                          <template v-slot:activator="{ on, attrs }">
                            <div class="pr-2" v-if='haveAuthorization'>
                              <v-btn rounded color='#FF5234' v-bind="attrs" v-on="on">
                                <v-icon color='white'>mdi-trash-can-outline</v-icon>
                              </v-btn>
                            </div>
                          </template>
                          <v-card>
                            <v-card-title>
                              Delete The Text
                            </v-card-title>
                            <v-card-text>
                              Be Sure Nothing Wrong!
                            </v-card-text>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn
                                color="red darken-1"
                                text
                                @click='dialog = false'
                              >
                                等等.
                              </v-btn>
                              <v-btn
                                color="blue darken-2"
                                text
                                @click='deleteText(peekText, index)'
                              >
                                Yes, I AM!
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-row>
                    </v-card-text>
                  </div>
                </div>
              </v-card>
            </template>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
    <foot-bar></foot-bar>
  </div>
</template>

<script>
import { sendTokenToBackend } from '../plugins/api-methods'
export default {
  name: 'HelloWorld',
  mounted: async function () {
    const token = sessionStorage.getItem('session_authorization')
    if (token) {
      // await等待的Promise对象会返回其解析值
      var checkCode = await sendTokenToBackend(token)
      if (checkCode === 200) this.$store.commit('haveCheckUserToken')
    }
    let userInfo = {}
    if (sessionStorage.getItem('session_user') === null) {
      userInfo.user = {
        name: 'guest',
        role: 0,
        isLogin: false
      }
      userInfo.token = sessionStorage.getItem('session_authorization')
    } else {
      userInfo = {
        isLogin: true,
        user: JSON.parse(sessionStorage.getItem('session_user')),
        token: sessionStorage.getItem('session_authorization')
      }
    }
    console.log(userInfo)
    this.getBlogTextsInMainPage(userInfo)
  },
  data: () => ({
    dialog: false,
    logined: 'No',
    textCount: 0,
    peekTexts: []
  }),
  methods: {
    goToLoginPage: function (event) {
      this.$router.push({ name: 'login' }).catch(err => console.log(err))
    },
    goToPostPage: function (event) {
      this.$router.push({ name: 'post' }).catch(err => console.log(err))
    },
    seeMore: function (info, idx) {
      this.$router.push({
        name: 'content',
        params: {
          id: info.id,
          textTitle: info.title,
          picture: info.picture,
          number: info.number
        }
      })
    },
    editText: function (info, idx) {
      this.$router.push({
        name: 'post',
        params: {
          id: info.id,
          textNumber: info.number
        }
      })
    },
    deleteText: function (info, index) {
      this.dialog = false
      console.log('Delete this text: ' + info.id + ' No:' + index)
      this.$axios.post('http://localhost:3000/api/deleteText', {
        id: info.id
      }).then(res => {
        if (res.data.status === 200) this.$router.replace({ name: 'refresh' })
        else console.log('Error Delete!')
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
  },
  computed: {
    haveAuthorization () {
      if (this.$store.state.HaveCheckUserToken) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
<style media="screen">
</style>
