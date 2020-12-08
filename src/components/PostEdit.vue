<template>
  <v-container align>
    <v-row class="mx-8 px-8">
      <v-col>
        <v-text-field
          label='Blog Title'
          prepend-icon='mdi-alpha-t-box-outline'
          hint='For example, "The first blog text"'
          clearable
          v-model='blogTitle'
        >
        </v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label='Blog Subtitle'
          prepend-icon='mdi-alpha-s-box-outline'
          hint='You can set one or not'
          clearable
          v-model='blogSubtitle'
        >
        </v-text-field>
      </v-col>
    </v-row>
    <v-row class="mx-8 px-8">
      <v-col>
        <v-text-field
          label='Blog Tag'
          prepend-icon='mdi-label-multiple-outline'
          hint='Use tag to mark the text'
          clearable
          v-model='blogTag'
        >
        </v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label='Blog Picture'
          prepend-icon='mdi-image'
          hint='Input the name of a picture'
          clearable
          v-model='blogPic'
        >
        </v-text-field>
      </v-col>
    </v-row>
    <v-row class="mx-8 px-8 pt-4">
      <v-col>
        <v-slider
         thumb-label='always'
         thumb-color='red'
         ticks='always'
         label="Scret Level"
         :prepend-icon='lockIcon'
         :tick-labels='secretLabels'
         track-fill-color='red'
         v-model='secretLevel'
         step='1'
         max='3'
         min='1'
        >
        </v-slider>
      </v-col>
      <v-col>
        <v-row no-gutters>
          <v-col>
            <v-switch
              class='mt-0 pt-0'
              prepend-icon='mdi-shield-lock-outline'
              color='green'
              hint='Creating a protected text'
              label='Set this text protected'
              v-model="protectedMode"
            >
            </v-switch>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="mx-8 px-8">
      <v-col>
        <v-text-field
          v-if='protectedMode'
          prepend-icon='mdi-shield-lock-outline'
          label='Protected Password'
          hint='Set Password to protect your text'
          clearable
          type='password'
        >
        </v-text-field>
      </v-col>
    </v-row>
    <v-row class="mx-8 px-8">
      <v-col>
        <div class="markdown">
          <MarkdownPro
            ref='md'
            v-model='content'
            :toolbars='toolbars'
          />
        </div>
    </v-col>
  </v-row>
  <v-row class="mx-8 px-8">
    <v-col>
      <v-btn block @click='uploadBlog'>test</v-btn>
    </v-col>
  </v-row>
  </v-container>
</template>

<script>
import { MarkdownPro } from 'vue-meditor'

export default {
  name: 'PostEdit',
  components: {
    MarkdownPro
  },
  data: () => ({
    secretLevel: '',
    secretLabels: [
      'N', 'S', 'D'
    ],
    content: '',
    logined: 'No',
    toolbars: {
      save: true
    },
    blogTitle: '',
    blogSubtitle: '',
    blogTag: '',
    blogPic: 'default',
    protectedMode: false
  }),
  methods: {
    uploadBlog: function () {
      if (!this.blogPic) {
        this.blogPic = 'default'
      }
      this.$axios.post('http://localhost:3000/api/upLoadBlog', {
        blogauthor: sessionStorage.getItem('session_username'),
        blogtitle: this.blogTitle,
        blogsubtitle: this.blogSubtitle,
        blogtag: this.blogTag,
        blogpic: this.blogPic,
        blogcontenthtml: this.$refs.md.html,
        blogcontent: this.content
      }).then(res => {
        if (res.data.status === 200) {
          console.log('Success!')
          this.$router.push('/')
        } else {
          console.log('Error!')
        }
      })
    }
  },
  computed: {
    lockIcon: function () {
      if (this.secretLevel === 1) {
        return 'mdi-lock-open-outline'
      } else {
        return 'mdi-lock-outline'
      }
    }
  },
  watch: {
  }
}
</script>
<style media="screen">
  a {
    text-decoration: none;
  }
</style>
