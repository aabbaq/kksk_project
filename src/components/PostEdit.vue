<template>
  <div>
    <top-bar></top-bar>
    <v-container align>
      <v-row class="mx-8 px-8">
        <v-col>
          <v-text-field
            label='Blog Title'
            prepend-icon='mdi-alpha-t-box-outline'
            hint='For example, "The first blog text"'
            clearable
            v-model='blogTextInfo.title'
          >
          </v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            label='Blog Subtitle'
            prepend-icon='mdi-alpha-s-box-outline'
            hint='You can set one or not'
            clearable
            v-model='blogTextInfo.subtitle'
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
            v-model='blogTextInfo.tag'
          >
          </v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            label='Blog Picture'
            prepend-icon='mdi-image'
            hint='Input the name of a picture'
            clearable
            v-model='blogTextInfo.picture'
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
           v-model='blogTextInfo.secretLevel'
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
                v-model="blogTextInfo.protectedMode"
              >
              </v-switch>
            </v-col>
            <v-col>
              <v-switch
                class='mt-0 pt-0'
                prepend-icon='mdi-shield-lock-outline'
                color='blue'
                hint='Creating a hidden text'
                label='Set this text hidden'
                v-model="blogTextInfo.hiddenMode"
              >
              </v-switch>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8">
        <v-col>
          <transition name="fade">
          <v-text-field
            v-if='blogTextInfo.protectedMode'
            prepend-icon='mdi-shield-lock-outline'
            label='Protected Password'
            hint='Set Password to protect your text'
            clearable
            type='password'
            v-model="blogTextInfo.protectedPassword"
          >
          </v-text-field>
          </transition>
        </v-col>
      </v-row>
      <v-row class="mx-8 px-8">
        <v-col>
          <div class="markdown">
            <vue-simplemde
              ref='md'
              v-model='blogTextInfo.content'
              :toolbars='toolbars'
              :highlight='needHighlight'
              preview-class="markdown-body"
            />
          </div>
      </v-col>
    </v-row>
    <v-row class="mx-8 px-8">
      <v-col>
        <v-dialog width="500" v-model="dialog">
          <template v-slot:activator="{ on, attrs }">
            <v-btn block v-bind="attrs" v-on="on">{{ btnName }}</v-btn>
          </template>
          <v-card>
            <v-card-title>
              {{ btnName }} The Text
            </v-card-title>
            <v-card-text>
              Be Sure Nothing Wrong:<br>
              <div class="pl-4">This text will be set as a<br></div>
              <strong class="blue--text">{{ textMode('hiddenMode') }}</strong>
              <strong v-if='symbolCheck'> & </strong>
              <strong :class="textColor">{{ textMode('protectedMode') }}</strong>Text
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
              @click='uploadBlog'
            >
              Yes, I AM!
            </v-btn>
          </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    </v-container>
  </div>
</template>

<script>
// import hljs from 'highlight.js/lib/core'
// import javascript from 'highlight.js/lib/languages/javascript'
import marked from 'marked'
import hljs from 'highlight.js'
import VueSimplemde from 'vue-simplemde'
import { postOfUploadBlogTextToBackend, getTextInfoBeforePostPage } from '../plugins/api-methods'
window.hljs = hljs
// hljs.registerLanguage('javascript', javascript)
export default {
  name: 'PostEdit',
  beforeRouteEnter (to, from, next) {
    if (from.path === '/') next(vm => getTextInfoBeforePostPage(vm, to.params.id))
    else next()
  },
  components: {
    VueSimplemde
  },
  data: () => ({
    secretLabels: [
      'N', 'S', 'D'
    ],
    logined: 'No',
    needHighlight: true,
    isUpdate: false,
    dialog: false,
    blogTextInfo: {
      id: '',
      number: undefined,
      title: '',
      subtitle: '',
      tag: '',
      picture: 'default',
      secretLevel: '',
      protectedMode: false,
      protectedPassword: '',
      hiddenMode: false,
      content: ''
    }
  }),
  methods: {
    uploadBlog: async function () {
      this.dialog = false
      if (!this.blogTextInfo.picture) this.blogTextInfo.picture = 'default'
      const extraInfo = {
        contentInHtml: marked(this.blogTextInfo.content),
        isUpdate: this.isUpdate
      }
      const checkCode = await postOfUploadBlogTextToBackend(this.blogTextInfo, extraInfo)
      if (checkCode === 200) this.$router.push('/')
    },
    textMode: function (modeName) {
      if (modeName === 'hiddenMode') {
        return this.blogTextInfo.hiddenMode ? 'Hidden ' : ''
      } else if (modeName === 'protectedMode') {
        return this.blogTextInfo.protectedMode ? 'Protected ' : (this.blogTextInfo.hiddenMode ? '' : 'Normal ')
      } else {
        return ''
      }
    }
  },
  computed: {
    lockIcon: function () {
      return this.secretLevel === 1 ? 'mdi-lock-open-outline' : 'mdi-lock-outline'
    },
    btnName: function () {
      return this.isUpdate === true ? 'Update' : 'Upload'
    },
    textColor: function () {
      return this.blogTextInfo.protectedMode ? 'green--text' : 'yellow--text text--darken-2'
    },
    symbolCheck: function () {
      return this.blogTextInfo.protectedMode && this.blogTextInfo.hiddenMode
    }
  },
  watch: {
  }
}
</script>
<style>
  a {
    text-decoration: none;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  @import "~simplemde/dist/simplemde.min.css";
  /* @import "./markdown/onigiri.css"; */
  @import '~github-markdown-css';
  @import "~highlight.js/styles/darcula.css";
</style>
