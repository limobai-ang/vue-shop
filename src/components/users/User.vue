<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="dialogTableVisibleAdd=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="userList" border style="width: 100%">
        <el-table-column label="#" type="index" :index="1"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
            <template slot-scope="slotProps">
               <el-switch
                v-model="slotProps.row.mg_state"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="switchChange(slotProps.row)">
                </el-switch>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
            <template slot-scope="slotProps">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="operator('edit', slotProps.row.id)"></el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="operator('delete', slotProps.row.id)"></el-button>
                <el-tooltip effect="dark" content="用户信息" placement="top">
                    <el-button type="warning" icon="el-icon-s-tools" size="mini" @click="operator('tools', slotProps.row.id)"></el-button>
                </el-tooltip>
            </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 3, 5, 7]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogTableVisibleAdd" @close="addDialogClose" width="50%">
      <el-form :model="addUserForm" status-icon :rules="userFormRules" ref="userFormRef" label-width="80px" >
          <el-form-item label="用户名" prop="username">
              <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
              <el-input type="password" show-password v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
              <el-input type="email" v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
              <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addUser">添 加</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="dialogTableVisibleAmend" width="50%">
      <el-form :model="amendUserForm" status-icon :rules="userFormRules" ref="userFormRef" label-width="80px" >
          <el-form-item label="用户名">
              <el-input :disabled="true" v-model="amendUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
              <el-input type="email" v-model="amendUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
              <el-input v-model="amendUserForm.mobile"></el-input>
          </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisibleAmend = false">取 消</el-button>
        <el-button type="primary" @click="editUser">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证手机号
    var validateMobile = (rule, value, callback) => {
      const isMobile = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(value)
      if (!isMobile) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
    // 验证邮箱格式
    var validateEmail = (rule, value, callback) => {
      if (!this.$isEmail(value)) {
        callback(new Error('邮箱格式错误'))
      } else {
        callback()
      }
    }
    return {
      queryInfo: {
        query: null,
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      dialogTableVisibleAdd: false,
      // 修改用户对话框的显示与隐藏
      dialogTableVisibleAmend: false,
      // 添加用户的表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户的表单数据
      amendUserForm: {
        id: 0,
        username: '',
        role_id: 0,
        mobile: '',
        email: ''
      },
      // 用户信息验证规则
      userFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 分页功能
    // 监听pagesize改变触发函数
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 状态开关函数
    async switchChange (userInfo) {
      const { data: res } = await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('状态设置错误：' + res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 添加用户事件
    async addUser () {
      // 验证表单内信息是否正确
      this.$refs.userFormRef.validate(async valid => {
        if (!valid) return
        // 表单验证信息通过后发起请求
        const { data: res } = await this.$http.post('/users', this.addUserForm)
        // 响应数据错误提示用户
        if (res.meta.status !== 201) return this.$message.error('创建用户错误：' + res.meta.msg)
        // 响应数据成功提示用户
        this.$message.success(res.meta.msg)
        // 重新获取并渲染用户列表数据
        this.getUserList()
        // 关闭对话框
        this.dialogTableVisibleAdd = false
      })
    },
    // 关闭对话框执行的函数
    addDialogClose () {
      // 清空对话框内的表单内容
      this.$refs.userFormRef.resetFields()
    },
    // 编辑用户提交函数
    async editUser () {
      this.$refs.userFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/users/${this.amendUserForm.id}`, this.amendUserForm)
        // 修改失败提示用户
        if (res.meta.status !== 200) return this.$message.error('修改信息失败：' + res.meta.msg)
        // 修改数据成功提示用户
        this.$message.success(res.meta.msg)
        // 重新获取数据
        this.getUserList()
        // 关闭对话框
        this.dialogTableVisibleAmend = false
      })
    },
    // 操作按钮事件函数
    async operator (type, id) {
      console.log(type, id)
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取用户信息错误：' + res.meta.msg)
      switch (type) {
        case 'edit': {
          this.dialogTableVisibleAmend = true
          this.amendUserForm = res.data
          break
        }
        case 'delete': {
          this.$confirm('此操作将永久删除, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            // 发起请求删除用户
            const { data: res } = await this.$http.delete(`users/${id}`)
            // 删除用户失败提示用户
            if (res.meta.status !== 200) return this.$message.error('删除用户失败：' + res.meta.msg)
            // 修改数据成功提示用户
            this.$message.success(res.meta.msg)
            // 重新获取数据
            this.getUserList()
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
          break
        }
        case 'tools':
          console.log('用户角色')
          break
      }
    }
  },
  created () {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.box-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
}
</style>
