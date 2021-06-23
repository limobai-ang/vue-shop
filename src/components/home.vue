<template>
  <div>
    <el-button @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    logout () {
      // 清空sessionStorage 跳转到登陆页
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
