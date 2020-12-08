<template>
  <div>
    <v-parallax height="350" :src="require('../../static/'+ this.$route.params.picture +'.jpg')">
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
                <MarkdownPreview ref='mdp'/>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
        <v-col>
          <v-row>
            <v-col>
              <div>
                <v-btn
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
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { MarkdownPreview } from 'vue-meditor'

export default {
  name: 'TextContent',
  components: {
    MarkdownPreview
  },
  beforeCreate: function () {
    console.log(this.$route.params.id)
    console.log(this.$route.params.number)
    this.pictureNumber = this.$route.params.number
    this.$axios.get('http://localhost:3000/api/getOneText', {
      params: {
        id: this.$route.params.id
      }
    }).then((res) => {
      if (res.data.status === 200) {
        this.$refs.mdp.html = res.data.docs[0].htmlContent
        this.title = res.data.docs[0].title
        this.fullDate = res.data.docs[0].dateInString
        this.date = res.data.docs[0].dateInString.split(' ')[0]
        this.author = res.data.docs[0].author
        this.id = res.data.docs[0]._id
        if (res.data.docs[0].picture) {
          this.picture = res.data.docs[0].picture
        }
      }
    })
  },
  data: () => ({
    pictureNumber: 1,
    title: '',
    fullDate: '',
    date: '',
    author: '',
    id: '',
    picture: 'default'
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
  }
}
</script>

<style lang="css">

</style>
