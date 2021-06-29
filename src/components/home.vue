<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div class="logo-box">
        <img src="../assets/logo.png" alt="logo" />
        <span>电商后台管理系统</span>
      </div>
      <el-button @click="logout" class="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
    <el-aside :width=" !isFode ? '200px' : '64px' ">
      <!-- 侧边栏菜单区域 -->
        <div class="fold" @click="cliFold"><span>|||</span></div>
        <el-menu
          background-color="#262c34"
          text-color="#fff"
          active-text-color="#359bff"
          :collapse="isFode"
          :collapse-transition="false"
          :unique-opened="true"
          :router="true"
          :default-active='currentUrl'
        >
          <el-submenu :key="itme.id" v-for="itme in menuData.data" :index="itme.id.toString()">
            <template slot="title">
              <i :class="iconsObj[itme.id]"></i>
              <span>{{itme.authName}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item :key="subItme.id" v-for="subItme in itme.children" :index="'/' + subItme.path">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{subItme.authName}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuData: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isFode: false,
      currentUrl: ''
    }
  },
  methods: {
    logout () {
      // 清空sessionStorage 跳转到登陆页
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      var { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuData = res
    },
    cliFold () {
      this.isFode = !this.isFode
    },
    getUrl () {
      let url = window.location.href
      url = url.split('#')[1]
      url = url.split('?')[0]
      this.currentUrl = url
    }
  },
  mounted () {
    this.getMenuList()
    this.getUrl()
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .logo-box {
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 18px;
    color: #fff;
    img {
      margin-right: 20px;
      height: 60%;
    }
  }
}
.el-aside {
  background-color: #313743;
  .el-menu {
    border-right: 0;
  }
  .fold{
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    letter-spacing: 3px;
    padding: 3px 0;
    font-size: 12px;
  }
}
.iconfont {
  margin-right: 10px;
}

</style>
