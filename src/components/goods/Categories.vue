<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/wlecone' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
        <!-- 表格区域 -->
      <el-row style="margin-top: 10px;">
        <tree-table
        :data="tableData"
        :columns="columns"
        :show-index="true"
        index-text="#"
        :selection-type="false"
        :expand-type="false"
        border
        >
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="!scope.row.cat_deleted"></i>
            <i class="el-icon-error" v-else></i>
          </template>
          <template slot="sort" slot-scope="scope">
            <el-tag size="small" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="small" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="small" type="warning" v-else>三级</el-tag>
          </template>
          <template slot="operation" slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editClassify(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteClassify(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>
      </el-row>
      <!-- 分页区域 -->
      <el-row>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageForm.pagenum"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="pageForm.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background>
        </el-pagination>
      </el-row>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addClassifyDialogVisible"
      @closed="closedRoleDialog"
      width="50%"
      >
      <el-form :model="addClassifyForm" :rules="addClassifyFormRules" ref="addClassifyFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addClassifyForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
           <el-cascader
            v-model="selectedKeys"
            :options="parentAddList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            >
            </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addClassifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addClassify">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑弹出框 -->
    <el-dialog title="修改分类" :visible.sync="editClassifyDialogVisible" width="50%">
      <el-form :model="currentClassify">
        <el-form-item label="分类名称" label-width="100px">
          <el-input v-model="currentClassify.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editClassifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditClassify">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的默认列表
      tableData: [],
      // 查询条件
      pageForm: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品总数
      total: 0,
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        // 当前列定义为模板列
        type: 'template',
        // 当前这一列使用的模板名称
        template: 'isok'
      },
      {
        label: '排序',
        // 当前列定义为模板列
        type: 'template',
        // 当前这一列使用的模板名称
        template: 'sort'
      },
      {
        label: '操作',
        // 当前列定义为模板列
        type: 'template',
        // 当前这一列使用的模板名称
        template: 'operation'
      }],
      // 添加对话框是否可见
      addClassifyDialogVisible: false,
      // 编辑对话框是否可见
      editClassifyDialogVisible: false,
      // 添加表单数据
      addClassifyForm: {
        cat_name: '', // 分类名称
        cat_pid: 0, // 分类父 ID
        cat_level: 0 // 分类层级
      },
      // 添加表单验证规则
      addClassifyFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentAddList: [],
      // 指定联级选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 选中的父级id
      selectedKeys: [],
      // 编辑按钮获取的数据
      currentClassify: {}
    }
  },
  methods: {
    // 获取商品分类数据
    async getCategoriesList () {
      const { data: res } = await this.$http.get('categories', { params: this.pageForm })
      // 抛出错误情况
      if (res.meta.status !== 200) return this.$message.error('分类获取失败')
      // 赋值数据列表
      this.tableData = res.data.result
      // 商品总条数
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (val) {
      this.pageForm.pagesize = val
      this.getCategoriesList()
    },
    // 监听pagenum改变
    handleCurrentChange (val) {
      this.pageForm.pagenum = val
      this.getCategoriesList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog () {
      this.getParentClassifyList()
      this.addClassifyDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentClassifyList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // 抛出错误情况
      if (res.meta.status !== 200) return this.$message.error('分类获取失败')
      this.parentAddList = res.data
    },
    // 单父级分类数据发生改变的时候触发
    parentCateChanged (val) {
      this.selectedKeys = val
      if (this.selectedKeys.length > 0) {
        this.addClassifyForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        this.addClassifyForm.cat_pid = 0
      }
      this.addClassifyForm.cat_level = this.selectedKeys.length
    },
    // 点击确定添加分类
    addClassify () {
      this.$refs.addClassifyFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addClassifyForm)
        // 抛出错误情况
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success(res.meta.msg)
        this.getCategoriesList()
        this.addClassifyDialogVisible = false
      })
    },
    closedRoleDialog () {
      this.$refs.addClassifyFormRef.resetFields()
      this.selectedKeys = []
    },
    // 编辑按钮
    async editClassify (itme) {
      console.log(itme)
      const { data: res } = await this.$http.get(`categories/${itme.cat_id}`)
      // 抛出错误情况
      if (res.meta.status !== 200) return this.$message.error('获取当前分类失败')
      this.currentClassify = res.data
      this.editClassifyDialogVisible = true
    },
    // 确定修改按钮
    async confirmEditClassify () {
      const { data: res } = await this.$http.put(`categories/${this.currentClassify.cat_id}`, this.currentClassify)
      if (res.meta.status !== 200) return this.$message.error('修改分类失败')
      this.$message.success(res.meta.msg)
      this.getCategoriesList()
      this.editClassifyDialogVisible = false
    },
    // 删除按钮
    deleteClassify (id) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 发起请求删除用户
        const { data: res } = await this.$http.delete(`/categories/${id}`)
        // 删除用户失败提示用户
        if (res.meta.status !== 200) return this.$message.error('删除分类失败：' + res.meta.msg)
        // 修改数据成功提示用户
        this.$message.success(res.meta.msg)
        // 重新获取数据
        this.getCategoriesList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  },
  created () {
    this.getCategoriesList()
  }
}
</script>

<style lang="less" scoped>
.el-icon-success {
  color: green;
}
.el-icon-error {
  color: red;
}
.el-cascader {
  width: 100%;
}
</style>
