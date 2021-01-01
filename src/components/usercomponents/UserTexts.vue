<template>
  <div>
    <v-container>
      <v-row justify="center" align="center">
        <v-col cols='6'>
          <v-card>
            <v-card-title>Post A Text</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="goToPostPage">
                Post A Text
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'UserTexts',
  methods: {
    goToPostPage () {
      this.$router.push({ name: 'post' }).catch(err => console.log(err))
    }
  }
}
</script>

<style>
</style>
