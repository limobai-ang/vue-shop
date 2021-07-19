<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            clearable
            class="input-with-select"
            v-model="getInfor.query"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrderData"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderData" border style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column width="500px" prop="order_number" label="订单编号"></el-table-column>
        <el-table-column width="100px" prop="order_price" label="订单价格"></el-table-column>
        <el-table-column width="100px" label="是否付款">
          <template slot-scope="scope">
            <el-button size="small" plain v-if="scope.row.order_pay" type="danger">未付款</el-button>
            <el-button size="small" plain v-else type="success">已付款</el-button>
          </template>
        </el-table-column>
        <el-table-column width="100px" prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | formet('yyyy-MM-dd hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column width="140px" label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editBtn"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="viewBtn"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getInfor.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="getInfor.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeDialog">
      <el-form :model="editDataForm" :rules="editDataFormRules" ref="editDataFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
           <el-cascader
              v-model="editDataForm.address1"
              :options="address"
              :props="{ expandTrigger: 'hover', value: 'value', label: 'label', children: 'children' }"
              @change="handleChange">
            </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editDataForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看地址 -->
    <el-dialog
      title="修改地址"
      :visible.sync="viewDialogVisible"
      width="50%">
        <el-timeline :reverse="reverse">
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.timestamp">
            {{activity.content}}
          </el-timeline-item>
        </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">取 消</el-button>
        <el-button type="primary"  @click="viewDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import address from './citydata'
export default {
  data() {
    return {
      orderData: [],
      getInfor: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 10,
      editDialogVisible: false,
      editDataForm: {
        address1: [],
        address2: ''
      },
      editDataFormRules: {
        address1: [
          { required: true, message: '请选择活动区域', trigger: 'change' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2到 20 个字符', trigger: 'blur' }
        ]
      },
      address,
      viewDialogVisible: false,
      reverse: true,
      activities: []
    }
  },
  methods: {
    async getOrderData() {
      const { data: res } = await this.$http.get('orders', { params: this.getInfor })
      if (res.meta.status !== 200) return this.$message.error('订单获取失败')
      this.orderData = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (val) {
      this.getInfor.pagesize = val
      this.getOrderData()
    },
    handleCurrentChange(val) {
      this.getInfor.pagenum = val
      this.getOrderData()
    },
    // 修改对话框
    editBtn() {
      this.editDialogVisible = true
    },
    // 关闭修改对话框
    closeDialog() {
      this.$refs.editDataFormRef.resetFields()
    },
    // 确定修改
    confirmEdit() {
      this.$refs.editDataFormRef.validate(valid => {
        if (!valid) return
        console.log(this.editDataForm)
      })
    },
    // 级联选择器改变时触发
    handleChange() {
      console.log(this.editDataForm)
    },
    // 查看地址按钮
    async viewBtn() {
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // if (res.meta.status !== 200) return this.$message.error('查询物流信息失败')
      // console.log(res)
      this.activities = [{
        content: '活动按期开始',
        timestamp: '2018-04-15'
      }, {
        content: '通过审核',
        timestamp: '2018-04-13'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }]
      this.viewDialogVisible = true
    }
  },
  created() {
    this.getOrderData()
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
.el-cascader {
  width: 100%;
}
</style>
