<template lang="html">
  <div>
    <v-app-bar dark tabs='tabs'>
      <slot name='userDrawer'></slot>
      <v-toolbar-title class='headline text-uppercase'>
        <router-link to='/' id='lothric'>
          <span>Lothric</span>
          <span class='font-weight-light'>Castle</span>
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator='{ on, attrs }'>
          <v-btn depressed v-bind='attrs' v-on='on'>
            <router-link v-if="Logined" to='/user' id='Postbuttom' >
              下北沢に着きました
            </router-link>
            <router-link v-else to='/login' id='Loginbuttom' >
              下北沢に向かう
            </router-link>
          </v-btn>
        </template>
        <span>{{ loginTip }}</span>
      </v-tooltip>
      <template #extension v-if='isThereUserHome'>
        <v-tabs v-model="tab">
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab v-for="each in tabsName" :key="each">
            {{ each }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <slot name="changeUserTab" :tabProp='tab' :tabsName='tabsName'></slot>
  </div>
</template>

<script>
import { sendTokenToBackend } from '../plugins/api-methods'

export default {
  name: 'TopBar',
  created: async function () {
    var token = sessionStorage.getItem('session_authorization')
    if (token) {
      // await等待的Promise对象会返回其解析值
      var checkCode = await sendTokenToBackend(token)
      if (checkCode === 114) {
        this.$store.commit('haveCheckUserToken')
      }
    }
  },
  data: () => ({
    love: 'hi',
    tab: null,
    tabsName: [
      'texts', 'myself', 'others', 'news'
    ]
  }),
  methods: {
  },
  computed: {
    Logined () {
      return this.$store.state.HaveCheckUserToken
    },
    loginTip () {
      if (this.$store.state.HaveCheckUserToken) {
        return '欢迎你！Homo！'
      } else {
        return '你不属于这里！'
      }
    },
    isThereUserHome () {
      return this.$route.name === 'user'
    }
  }
}
</script>

<style lang="css">
  #lothric, #Postbuttom, #Loginbuttom {
    text-decoration: none;
    color: white;
  }
</style>
