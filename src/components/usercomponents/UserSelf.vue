<template>
  <div>
    <v-container>
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
  data: () => ({
    dialog: false
  }),
  methods: {
    userQuit () {
      sessionStorage.clear()
      this.$store.commit('changeLogout')
      this.$router.push('/')
    }
  }
}
</script>

<style>
</style>
