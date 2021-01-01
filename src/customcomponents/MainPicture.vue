<template>
  <div>
    <div  id="mainpic">
      <v-parallax height="350" :src="require('../../static/mainpage.jpg')">
         <h2 class="font-weight-light text-md-center text-sm-center headline" id='WelcomeText1'>
              Oh,dear,Another dogged contender
         </h2>
         <h2 class="font-weight-light text-md-center text-sm-center headline" id='WelcomeText2'>
              Welcome.Unkindled One, purloiner of Cinders
         </h2>
      </v-parallax>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainPicture'
}
</script>

<style lang="css">
#mainpic {
  height: 100%;
  width: 101%;
}
#WelcomeText1, #WelcomeText2 {
  font-weight: normal;
  line-height: 3rem;
  margin: 0 0 0rem;
}
</style>
