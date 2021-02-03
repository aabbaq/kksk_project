<template>
  <div v-scroll="getScrollDistance" v-resize="getWindowHeight">
    <v-scale-transition origin='center' v-if='isTextPage'>
      <v-btn
        color='primary' fab large
        bottom right fixed
        class="mr-12 mb-12"
        v-show='needGoUp'
        @click='flyToTheSky'
      >
        <v-icon>mdi-navigation</v-icon>
      </v-btn>
    </v-scale-transition>
    <v-btn
      v-else
      color='primary' fab
      fixed bottom right
      class="mr-16 mb-16"
      @click='showBtns=!showBtns'
      v-click-outside='hideBtns'
    >
      <v-icon>mdi-cards</v-icon>
    </v-btn>
    <v-dialog width="500" v-model="btnDialog">
      <v-card>
        <v-card-title>
          Delete The Text
        </v-card-title>
        <v-card-text>
          Be Sure Nothing Wrong!
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click='btnDialog = false'>等等.</v-btn>
          <v-btn color="blue darken-2" text @click='deleteText'>Yes, I AM!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-scale-transition origin='center'>
      <v-btn v-if='showBtns' fab color='red lighten-1' fixed right bottom class="mr-9" @click='btnDialog=true'>
        <v-icon color='white'>mdi-trash-can</v-icon>
      </v-btn>
    </v-scale-transition>
    <v-scale-transition origin='center'>
      <v-btn v-if='showBtns' fab color='green lighten-3' fixed right bottom class="mb-16" @click='goToEditPage'>
        <v-icon color='white'>mdi-pencil</v-icon>
      </v-btn>
    </v-scale-transition>
    <v-scale-transition origin='center'>
      <v-btn v-if='showBtns' fab color='pink lighten-1' fixed id='UpBtn' v-show='needGoUp' @click='flyToTheSky'>
        <v-icon color='white'>mdi-navigation</v-icon>
      </v-btn>
    </v-scale-transition>
  </div>
</template>

<script>
export default {
  name: 'FunctionButton',
  mounted: function () {
    this.getWindowHeight()
    this.getScrollDistance()
  },
  data: () => ({
    btnDialog: false,
    windowHeight: 0,
    scrollDistance: 0,
    showBtns: false
  }),
  methods: {
    hideBtns: function () {
      this.showBtns = false
    },
    flyToTheSky: function () {
      this.$vuetify.goTo(0)
    },
    getScrollDistance: function () {
      this.scrollDistance = window.pageYOffset
    },
    getWindowHeight: function () {
      this.windowHeight = window.innerHeight
    },
    goToEditPage: function () {
      this.$router.push({
        name: 'post',
        params: { textNumber: this.$route.params.number }
      })
    },
    deleteText: function () {
      this.btnDialog = false
      console.log(this.$route.params.id)
      this.$axios.post('http://localhost:3000/api/deleteText', {
        id: this.$route.params.id
      }).then(res => {
        if (res.data.status === 200) this.$router.push({ name: 'helloworld' })
        else console.log('Error Delete!')
      })
    }
  },
  computed: {
    needGoUp () {
      return this.scrollDistance >= this.windowHeight - 50
    },
    isTextPage () {
      return this.$route.name !== 'content'
    }
  }
}
</script>
<style>
  #UpBtn {
    right: 52px;
    bottom: 144px;
  }
</style>
