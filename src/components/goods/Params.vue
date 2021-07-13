<template>
    <div>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/wlecone' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片区域 -->
      <el-card class="box-card">
        <!-- 提示信息 -->
        <el-alert
          title="注意：只允许为第三级分类设置相关参数"
          type="warning"
          show-icon
          :closable="false">
        </el-alert>
        <!-- 选择商品分类区域 -->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <!-- 选择商品分类的级联选择框 -->
            <el-cascader
            v-model="currentSelectCate"
            :options="allCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            @change="parentCateChanged"
            >
            </el-cascader>
          </el-col>
        </el-row>
        <!-- tabs分页 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!-- 添加动态参数的面板 -->
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格区域 -->
            <el-table
              :data="manyTableData"
              border
              style="width: 100%">
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item, index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="handleClose(index, scope.row)"
                    type="">
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                </template>
              </el-table-column>
              <el-table-column
                type="index"
                label="#">
              </el-table-column>
              <el-table-column
                prop="attr_name"
                label="参数名称">
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editParams(scope.row)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteParams(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 添加静态属性的面板 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!-- 添加属性表格区域 -->
            <el-table
              :data="onlyTableData"
              border
              style="width: 100%">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item, index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="handleClose(index, scope.row)"
                    type="">
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column
                type="index"
                label="#">
              </el-table-column>
              <el-table-column
                prop="attr_name"
                label="属性名称">
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editParams(scope.row)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteParams(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <!-- 添加对话框 -->
      <el-dialog
        :title="activeName == 'many' ? '添加动态参数' : '添加属性'"
        :visible.sync="addDialogVisible"
        width="40%"
        @close="addDialogClosed">
        <el-form :model="ruleForm" :rules="ruleFormRules" ref="ruleFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="activeName == 'many' ? '动态参数' : '静态属性'" prop="attr_name">
            <el-input v-model="ruleForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改对话框 -->
      <el-dialog
        :title="activeName == 'many' ? '修改动态参数' : '修改静态属性'"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editDialogClosed">
        <el-form :model="editParamsInfor" :rules="ruleFormRules" ref="editRuleFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="activeName == 'many' ? '动态参数' : '静态属性'" prop="attr_name">
            <el-input v-model="editParamsInfor.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmEditParams">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 全部商品分类列表
      allCateList: [],
      // 当前被选中的分类id
      currentSelectCate: [],
      // 被激活的页签
      activeName: 'many',
      // 表格数据
      onlyTableData: [],
      manyTableData: [],
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 添加form表单
      ruleForm: {
        attr_name: '',
        attr_sel: '',
        attr_vals: ''
      },
      // 提价信息验证
      ruleFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 编辑参数
      editParamsInfor: {
        attr_name: '',
        attr_sel: '',
        attr_vals: ''
      }
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories')
      // 抛出错误情况
      if (res.meta.status !== 200) return this.$message.error('分类获取失败')
      this.allCateList = res.data
    },
    // 获取参数列表
    async getOnlyParamsList () {
      const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
      // 抛出错误情况
      if (res.meta.status !== 200) return this.$message.error('分参数取失败')
      res.data.forEach(itme => {
        itme.attr_vals = itme.attr_vals ? itme.attr_vals.split(' ') : []
        itme.inputVisible = false
        itme.inputValue = ''
      })
      this.onlyTableData = res.data
    },
    // 获取属性列表
    async getManyParamsList () {
      const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
      // 抛出错误情况
      if (res.meta.status !== 200) return this.$message.error('分参数取失败')
      res.data.forEach(itme => {
        itme.attr_vals = itme.attr_vals ? itme.attr_vals.split(' ') : []
        itme.inputVisible = false
        itme.inputValue = ''
      })
      this.manyTableData = res.data
    },
    // 级联选择框数据发生改变时触发
    parentCateChanged () {
      if (this.currentSelectCate.length !== 3) {
        this.currentSelectCate = []
        this.onlyTableData = []
        this.manyTableData = []
        return this.$message.error('请选择3级分类')
      }
      // 当级联选择框发生改变的时候发起请求获取列表
      this.getOnlyParamsList()
      this.getManyParamsList()
    },
    handleTabClick () {
    },
    // 关闭添加对话框的回调
    addDialogClosed () {
      this.$refs.ruleFormRef.resetFields()
    },
    // 关闭修改对话框的回调
    editDialogClosed () {
      this.editParamsInfor = {
        attr_name: '',
        attr_sel: '',
        attr_vals: ''
      }
      this.$refs.editRuleFormRef.resetFields()
    },
    // 确定添加参数按钮
    addParams () {
      this.$refs.ruleFormRef.validate(async (valid) => {
        if (!valid) return
        this.ruleForm.attr_sel = this.activeName
        const { data: res } = await this.$http.post(`/categories/${this.cateId}/attributes`, this.ruleForm)
        console.log(res)
        // 抛出错误情况
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.parentCateChanged()
        this.addDialogVisible = false
      })
    },
    // 删除参数
    deleteParams (infor) {
      this.$confirm('此操作将永久删除该, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${infor.cat_id}/attributes/${infor.attr_id}`)
        if (res.meta.status !== 200) return this.$message.error('添加失败')
        this.$message({ type: 'success', message: '删除成功!' })
        this.parentCateChanged()
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },
    // 修改参数
    async editParams (infor) {
      // 查询参数
      const { data: res } = await this.$http.get(`categories/${infor.cat_id}/attributes/${infor.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.editParamsInfor = res.data
      this.editDialogVisible = true
    },
    // 确定修改参数
    confirmEditParams () {
      this.$refs.editRuleFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editParamsInfor.cat_id}/attributes/${this.editParamsInfor.attr_id}`, this.editParamsInfor)
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message({ type: 'success', message: res.meta.msg })
        this.parentCateChanged()
        this.editDialogVisible = false
      })
    },
    // Tag按钮删除
    handleClose (index, infor) {
      this.$confirm('此操作将永久删除该, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const arr = infor.attr_vals.slice()
        arr.splice(index, 1)
        const { data: res } = await this.$http.put(`categories/${infor.cat_id}/attributes/${infor.attr_id}`, {
          attr_name: infor.attr_name,
          attr_sel: infor.attr_sel,
          attr_vals: arr.join(' ')
        })
        // 抛出错误情况
        if (res.meta.status !== 200) return this.$message.error('添加失败')
        // infor.attr_vals = res.data.attr_vals ? res.data.attr_vals.split(' ') : []
        infor.attr_vals.splice(index, 1)
        this.$message({ type: 'success', message: '删除成功!' })
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' })
      })
    },
    // 切换输入框
    showInput (infor) {
      infor.inputVisible = true
      // $nextTick 方法的作用 当页面上元素被重新渲染之后 才会指定回调函数内的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // input 失去焦点 或者按下回车触发
    async handleInputConfirm (infor) {
      // 如果输入的内容为空就
      if (infor.inputValue.trim() === '') {
        infor.inputVisible = false
        infor.inputValue = ''
        return
      }
      // 没有被return 输入值合法 发起请求
      const arr = infor.attr_vals.slice()
      arr.push(infor.inputValue.trim())
      const { data: res } = await this.$http.put(`categories/${infor.cat_id}/attributes/${infor.attr_id}`, {
        attr_name: infor.attr_name,
        attr_sel: infor.attr_sel,
        attr_vals: arr.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('添加失败')
      // infor.attr_vals = res.data.attr_vals ? res.data.attr_vals.split(' ') : []
      infor.attr_vals.push(infor.inputValue.trim())
      this.$message.success('添加成功')
      infor.inputVisible = false
      infor.inputValue = ''
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 禁用按钮
    isBtnDisabled () {
      if (this.currentSelectCate.length !== 3) {
        return true
      }
      return false
    },
    // 获取id
    cateId () {
      if (this.currentSelectCate.length === 3) {
        return this.currentSelectCate[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin-top: 15px;
  }
  .el-tag {
    margin: 0 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
