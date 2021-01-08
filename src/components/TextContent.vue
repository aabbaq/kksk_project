<template>
  <div>
    <top-bar></top-bar>
    <v-parallax height="350" :src="this.picPath" v-if='this.picture'>
      <v-container>
        <v-row>
          <v-col>
            <div class='font-weight-thin text-h3 text-center'>{{ title }}</div>
          </v-col>
        </v-row>
        <div class='text-subtitle-2 font-weight-regular font-italic text-center'>{{ date }}</div>
        <div class='font-weight-light text-h6 text-center'>{{ author }}</div>
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
                <div v-html='content' class="markdown-body"></div>
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
    if (this.$route.params.picture) {
      // this.showTextFromIndex()
      this.pictureNumber = this.$route.params.number
      this.$axios.get('http://localhost:3000/api/getOneText', {
        params: {
          id: this.$route.params.id
        }
      }).then((res) => {
        if (res.data.status === 200) {
          const docs = res.data.docs[0]
          this.content = docs.htmlContent
          this.title = this.$route.params.textTitle = docs.title
          this.fullDate = docs.dateInString
          this.date = docs.dateInString.split(' ')[0]
          this.author = docs.author
          this.id = docs._id
          if (docs.picture) {
            this.picture = docs.picture
          }
        }
      })
    } else {
      // this.showTextFromRoute()
      this.$axios.get('http://localhost:3000/api/getOneText', {
        params: {
          title: this.$route.params.textTitle
        }
      }).then(res => {
        if (res.data.status === 200) {
          const docs = res.data.docs[0]
          this.content = docs.htmlContent
          this.title = docs.title
          this.fullDate = docs.dateInString
          this.date = docs.dateInString.split(' ')[0]
          this.author = docs.author
          this.id = docs._id
          this.picture = docs.picture
          this.$route.params.picture = docs.picture
        }
      })
    }
  },
  data: () => ({
    pictureNumber: 1,
    title: '',
    fullDate: '',
    date: '',
    author: '',
    id: '',
    picture: '',
    content: ''
  }),
  methods: {
    showTextFromRoute: function () {
    },
    showTextFromIndex: function () {
    },
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
  #mkdp {
    font-family: unquote("Roboto");
    font-size: 96;
}
</style>
