<template>
  <div>
    <v-container fluid elevation='0'>
      <v-row justify="center" align="center">
        <v-sheet max-width="75%">
          <v-slide-group v-model='model' show-arrows class="pa-4" center-active>
            <v-slide-item class="mx-6 my-2" v-for='eachText in peekTexts' :key='eachText.title' v-slot='{ active, toggle }'>
              <div @click="clickCard()">
                <v-card
                  :color="active ? 'rgba(0, 0, 0, 0.8)' : 'white'"
                  width="300"
                  @click="toggle"
                >
                  <v-img
                    :src='require("../../../static/" + eachText.picture + ".jpg")'
                    height='200px'
                  ></v-img>
                  <div :class="active ? 'white--text' : ''">
                    <v-card-title>
                      <div class='font-weight-bold'>{{ eachText.title }}</div>
                      <v-spacer></v-spacer>
                      <div class='text-subtitle-2 font-weight-light font-italic'>{{ eachText.date }}</div>
                    </v-card-title>
                    <v-card-subtitle class='py-1'  :id="active ? 'smallCardSubtitle1': 'smallCardSubtitle2' ">
                      {{ eachText.subtitle }}
                    </v-card-subtitle>
                    <v-card-text class='pt-1'>
                      <div>{{ eachText.author }}</div>
                      <v-spacer></v-spacer>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color='orange lighten-2' text @click.stop="eachText.mode.needShow = !eachText.mode.needShow">Explore</v-btn>
                      <v-spacer></v-spacer>
                      <v-btn icon @click.stop="eachText.mode.needShow = !eachText.mode.needShow">
                        <v-icon :color="active ? 'white': ''">{{ eachText.mode.needShow ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </v-btn>
                    </v-card-actions>
                    <v-expand-transition>
                      <v-sheet v-show="eachText.mode.needShow" :color="active ? 'rgba(0, 0, 0, 0.01)' : 'white'">
                        <v-divider></v-divider>
                        <v-card-text  :class="active ? 'white--text' : ''">
                          This Text is <br/>
                          {{ textType(eachText.mode) }}
                        </v-card-text>
                      </v-sheet>
                    </v-expand-transition>
                  </div>
                </v-card>
              </div>
            </v-slide-item>
          </v-slide-group>
          <v-expand-transition>
            <v-sheet v-if="model != null" height="80" tile>
              <v-row align="center" justify="center">
                <h3 class="title font-weight-bold">What Do You Want To Do With {{ peekTexts[model].title }}</h3>
              </v-row>
              <v-row align="center" justify="space-around" no-gutters>
                <v-btn
                  v-for='eachBtn in btnList'
                  :key='eachBtn.name'
                  :color='eachBtn.color'
                  text
                  width='20%'
                  large
                  @click='dealWithTexts(eachBtn.name, peekTexts[model])'
                >
                  {{ eachBtn.name }}
                </v-btn>
                <v-dialog width="500" v-model="dialog">
                  <v-card>
                    <v-card-title>
                      Delete Text
                    </v-card-title>
                    <v-card-text>
                      Are You Sure Of Deleting {{ peekTexts[model].title }}
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="red darken-1" text @click='dialog = false'>
                        等等.
                      </v-btn>
                      <v-btn color="blue darken-2" text @click='deleteText(peekTexts[model])'>
                        Yes, I AM!
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-row>
            </v-sheet>
          </v-expand-transition>
        </v-sheet>
      </v-row>
      <v-row justify="center" align="center">
        <v-btn text class="mt-4" @click="goToPostPage()" width='65%'>Post A New Text</v-btn>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'UserTexts',
  mounted: function () {
    const User = JSON.parse(sessionStorage.getItem('session_user'))
    this.$axios.post('http://localhost:3000/api/getBlogTexts', {
      needCardsInfo: true,
      isLogin: User.isLogin,
      userName: User.name,
      userRole: User.role,
      userToken: sessionStorage.getItem('session_authorization')
    }).then(res => {
      if (res.data.status === 200) {
        this.textCount = res.data.textsInfo.textsCount
        this.peekTexts = res.data.textsInfo.peekTexts
      } else {
        console.log('getBlogTextsInUserPage Error!')
      }
    }).catch(err => console.log(err))
  },
  data: () => ({
    model: null,
    rua: false,
    dialog: false,
    textCount: 0,
    peekTexts: [],
    btnList: [
      { name: 'View', color: 'green' },
      { name: 'Edit', color: 'blue' },
      { name: 'Delete', color: 'red' }
    ]
  }),
  methods: {
    dealWithTexts (pageName, textInfo) {
      if (pageName === 'Edit') {
        this.$router.push({
          name: 'post',
          params: { textNumber: textInfo.number }
        })
      } else if (pageName === 'View') {
        this.$router.push({
          name: 'content',
          params: {
            id: textInfo.id,
            textAuthor: textInfo.author,
            textTitle: textInfo.title
          }
        })
      } else {
        this.dialog = true
      }
    },
    deleteText (info) {
      this.dialog = false
      console.log('Delete this text: ' + info.id)
      this.$axios.post('http://localhost:3000/api/deleteText', {
        id: info.id
      }).then(res => {
        if (res.data.status === 200) this.$router.replace({ name: 'refresh' })
        else console.log('Error Delete!')
      })
    },
    clickCard () {
      this.peekTexts.forEach((each, idx, array) => {
        each.mode.needShow = false
      })
    },
    goToPostPage () {
      this.$router.push({ name: 'post', params: { textNumber: 0 } }).catch(err => console.log(err))
    },
    ShowText () {
      console.log('haha')
    },
    textType (textMode) {
      let textType = ''
      if (textMode.hidden) {
        textType += 'Hidden '
        if (textMode.protected) {
          textType += '& Protected and Password is: ' + textMode.protectedPassword + ' '
        }
      } else {
        if (textMode.protected) {
          textType += 'Protected and Password is: ' + textMode.protectedPassword + ' '
        } else {
          textType += 'Normal '
        }
      }
      return textType
    }
  },
  computed: {
  }
}
</script>
<style>
#smallCardSubtitle1 {
  color: white;
}
#smallCardSubtitle2 {
  color: rgba(0, 0, 0, 0.6);
}
</style>
