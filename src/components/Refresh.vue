<template>
  <div>
    蛤蛤
  </div>
</template>

<script>
export default {
  name: 'Refresh',
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$router.replace(from.path)
    })
  }
}
</script>

<style>
</style>
