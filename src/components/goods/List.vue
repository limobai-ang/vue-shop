<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/wlecone' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            clearable
            class="input-with-select"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="tabDataList" border style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px">
        </el-table-column>
        <el-table-column prop="upd_time" label="创建时间" width="180px">
          <template slot-scope="scope">
            {{ scope.row.upd_time | formet('yyyy-MM-dd hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editGoods(scope.row.goods_id)"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getTabDataListInfor.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabDataList: [],
      getTabDataListInfor: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品总数
      total: 0
    }
  },
  methods: {
    // 获取列表数据
    async getTabDataList() {
      const { data: res } = await this.$http.get('/goods', {
        params: this.getTabDataListInfor
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败：' + res.meta.msg)
      console.log(res.data)
      this.total = res.data.total
      this.tabDataList = res.data.goods
    },
    // 分页
    handleSizeChange(val) {
      this.getTabDataListInfor.pagesize = val
      this.getTabDataList()
    },
    handleCurrentChange(val) {
      this.getTabDataListInfor.pagenum = val
      this.getTabDataList()
    },
    // 删除按钮
    removeGoods(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`goods/${id}`)
          if (res.meta.status !== 200) return this.$message.error('删除商品失败：' + res.meta.msg)
          this.$message.success(res.meta.msg)
          this.getTabDataList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 添加按钮
    goAddGoods() {
      this.$router.push('/goods/add')
    },
    // 编辑按钮
    editGoods(id) {
      this.$router.push({ path: '/goods/edit', query: { goodsId: id } })
    }
  },
  created() {
    this.getTabDataList()
  },
  // 过滤器
  filters: {
    // 格式化时间
    formet: function (val, arg) {
      function dateFormat(date, format) {
        if (typeof date === 'string') {
          var mts = date.match(/(\/Date\((\d+)\)\/)/)
          if (mts && mts.length >= 3) {
            date = parseInt(mts[2])
          }
        }
        date = new Date(date)
        if (!date || date.toUTCString() === 'Invalid Date') {
          return ''
        }
        var map = {
          M: date.getMonth() + 1, // 月份
          d: date.getDate(), // 日
          h: date.getHours(), // 小时
          m: date.getMinutes(), // 分
          s: date.getSeconds(), // 秒
          q: Math.floor((date.getMonth() + 3) / 3), // 季度
          S: date.getMilliseconds() // 毫秒
        }
        format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
          var v = map[t]
          if (v !== undefined) {
            if (all.length > 1) {
              v = '0' + v
              v = v.substr(v.length - 2)
            }
            return v
          } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length)
          }
          return all
        })
        return format
      }
      return dateFormat(val, arg)
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  font-size: 12px;
}
</style>
