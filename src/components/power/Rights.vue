<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card class="box-card">
          <el-table
            :data="RightsList"
            style="width: 100%"
            :border="true">
             <el-table-column
             label="#"
              type="index"
              width="50">
            </el-table-column>
            <el-table-column
              prop="authName"
              label="权限名称">
            </el-table-column>
            <el-table-column
              prop="path"
              label="路径">
            </el-table-column>
            <el-table-column
              prop="level"
              label="权限等级">
                <template slot-scope="slotProps">
                  <el-tag v-if="slotProps.row.level === '0'">一级</el-tag>
                  <el-tag type="success" v-else-if="slotProps.row.level === '1'">二级</el-tag>
                  <el-tag type="warning" v-else>三级</el-tag>
                </template>
            </el-table-column>
          </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      RightsList: []
    }
  },
  methods: {
    async getRightsList () {
      const { data: res } = await this.$http.get('/rights/list')
      this.RightsList = res.data
      console.log(this.RightsList)
    }
  },
  created () {
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>

</style>
