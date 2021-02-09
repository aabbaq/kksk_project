<template>
  <div>
    <top-bar></top-bar>
    <v-parallax height="400" :src="this.picPath" v-if='this.picture' id='textPic'>
      <v-container>
        <v-row>
          <v-col>
            <div class='font-weight-thin text-h3 text-center'>{{ textInfo.title }}</div>
          </v-col>
        </v-row>
        <div class='text-subtitle-2 font-weight-regular font-italic text-center'>{{ textInfo.dateInString }}</div>
        <div class='font-weight-light text-h6 text-center'>{{ textInfo.author }}</div>
      </v-container>
    </v-parallax>
    <v-container class='mx-24 px-10'>
      <v-row>
        <v-col cols="1">
        </v-col>
        <v-col cols="8">
          <v-row>
            <v-col>
              <v-card min-width='320' elevation='0' rounded>
                <div v-html='textInfo.htmlContent' class="markdown-body"></div>
                <!-- <MarkdownPreview  id='mkdp' ref='mdp'/> -->
              </v-card>
            </v-col>
          </v-row>
        </v-col>
        <!-- <v-col>
          <v-row>
            <v-col>
              <div>
                <v-btn
                  v-if='haveAuthorization'
                  color='#FF5234'
                  fab bottom right fixed
                  class='mb-4 mr-6'
                  @click='deleteText'
                >
                  <v-icon color='white'>mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-col> -->
      </v-row>
    </v-container>
  </div>
</template>

<script>
// import MarkdownPreview from './markdown/preview'

export default {
  name: 'TextContent',
  components: {
    // MarkdownPreview
  },
  beforeCreate: function () {
    const tmpParams = {}
    if (this.$route.params.picture) {
      tmpParams.id = this.$route.params.id
    } else {
      tmpParams.title = this.$route.params.textTitle
    }
    this.$axios.get('http://localhost:3000/api/text/getOneText', {
      params: tmpParams
    }).then((res) => {
      if (res.status === 200) {
        const docs = res.data.docs[0]
        this.textInfo = docs
        this.textInfo.dateInString = docs.dateInString.split(' ')[0]
        if (docs.picture) this.picture = docs.picture
      }
    })
  },
  data: () => ({
    textInfo: {},
    picture: ''
  }),
  methods: {
    deleteText: function () {
      console.log('Delete this text: ' + this.id)
      this.$axios.post('http://localhost:3000/api/deleteText', {
        id: this.id
      }).then(res => {
        if (res.data.status === 200) {
          console.log('Success Delete!')
          this.$router.push('/')
        } else {
          console.log('Error Delete!')
        }
      })
    }
  },
  computed: {
    picPath: function () {
      return this.picture ? require('../../static/' + this.picture + '.jpg') : require('../../static/default.jpg')
    }
  }
}
</script>

<style lang="css">
  #textPic:not(:hover) > .v-parallax__image-container {
    filter: blur(10px);
    transition: filter 0.5s ease-in-out;
  }
  #textPic:hover > .v-parallax__image-container {
    transition: filter 0.5s ease-in-out;
  }
/* #mkdp {
    font-family: unquote("Roboto");
    font-size: 96;
} */
/* .markdown-body h1 {
  font-size: 64px;
} */
</style>
