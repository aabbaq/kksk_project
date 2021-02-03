<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <v-row>
            <v-col>
              <v-text-field
                label='Username'
                :value="userInfo.username"
                outlined
                disabled
                prepend-inner-icon='mdi-account'
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label='Password'
                placeholder='Want to change your password?'
                v-model='newPassword'
                outlined
                prepend-inner-icon='mdi-alpha-p-box'
                append-icon='mdi-lead-pencil'
                @click:append='changePassword()'
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label='Nickname'
                v-model="userInfo.nickname"
                outlined
                :clearable='!canNicknameChange'
                prepend-inner-icon='mdi-alpha-n-box'
                append-icon='mdi-lead-pencil'
                :readonly='canNicknameChange'
                @click:append='changeNickname()'
              >
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-textarea
                v-model='userInfo.biography'
                clearable
                label='Biography'
                outlined
                placeholder='Show yourself'
                hint='Show yourself'
                append-icon='mdi-lead-pencil'
              >
                <template v-slot:prepend-inner>
                  <v-icon x-large>
                    mdi-bio
                  </v-icon>
                </template>
              </v-textarea>
            </v-col>
          </v-row>
        </v-col>
        <v-col>
          <v-card class="mx-auto" max-width="434" tile>
            <!-- <v-parallax aspect-ratio='1.618' :src='require("../../../static/default.jpg")' class="white--text align-space-around"> -->
            <v-img aspect-ratio='2.618' :src='require("../../../static/default.jpg")' class="white--text align-space-around" id='userBanner'>
              <v-avatar class="profile" color="grey" size="120" tile>
                <v-img src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg"></v-img>
              </v-avatar>
              <v-card-title>{{ userInfo.username }}@{{userInfo.nickname }}</v-card-title>
            </v-img>
            <!-- </v-parallax> -->
            <v-card-subtitle class="pb-0">Number 10</v-card-subtitle>
            <v-card-text class="text--primary">
              <div>{{ userInfo.biography }}</div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="orange" text>Share</v-btn>
              <v-btn color="orange" text>Explore</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row justify="center" align="center">
        <v-col cols='6'>
          <v-card>
            <v-card-title>Log Out</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-dialog width="500" v-model="dialog">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn  v-bind="attrs" v-on="on">Quit</v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    Are You Sure?
                  </v-card-title>
                  <v-card-text>
                    You will log out!
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
                    @click="userQuit"
                  >
                    Yes, I AM!
                  </v-btn>
                </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'UserSelf',
  mounted: function () {
    this.$axios.post('http://localhost:3000/api/getUserInfo', {
      token: sessionStorage.getItem('session_authorization')
    }).then(res => {
      if (res.data.status === 200) {
        this.userInfo = res.data.userInfo
      }
    })
  },
  data: () => ({
    dialog: false,
    canNicknameChange: true,
    showPassword: false,
    userInfo: {},
    newPassword: '',
    fieldList: [
      { name: 'Username' },
      { name: 'Nickname' },
      { name: 'Password' },
      { name: 'Biography' }
    ]
  }),
  methods: {
    userQuit () {
      sessionStorage.clear()
      this.$store.commit('changeLogout')
      this.$router.push('/')
    },
    changeNickname () {
      this.canNicknameChange = !this.canNicknameChange
      console.log('changeNickname')
    },
    changePassword () {
      console.log('changePassword')
    }
  }
}
</script>

<style>
  #userBanner:not(:hover) > .v-image__image {
    /* -webkit-filter: blur(1px); */
    filter: blur(5px);
    transition: filter 0.5s ease-in-out;
  }
  #userBanner:hover > .v-image__image {
    transition: filter 0.5s ease-in-out;
  }
</style>
