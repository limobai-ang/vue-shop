<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <el-steps
        :space="200"
        :active="activeName - 0"
        align-center
        finish-status="success"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 侧边栏导航区域 -->
      <el-form
        label-position="top"
        label-width="80px"
        :model="addGoodsFormData"
        :rules="addGoodsFormDataRules"
        ref="addGoodsFormDataRef"
      >
        <el-tabs
          tab-position="left"
          v-model="activeName"
          @tab-click="tabChange"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsFormData.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addGoodsFormData.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addGoodsFormData.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodsFormData.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsFormData.goods_cat"
                :options="classifyList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children'
                }"
                @change="handleChange"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              :key="item.attr_id"
              v-for="item in parmasInfor"
            >
               <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="item1" :key="index" v-for="(item1, index) in item.attr_vals"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              :key="item.attr_id"
              v-for="item in propertyInfor"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :headers="setUploadHeaders"
              :on-success="handleSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsFormData.goods_introduce">
            </quill-editor>
            <el-button class="addGoods" type="primary" @click="addGoosd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片对话框 -->
    <el-dialog
      title="预览"
      :visible.sync="imageDialogVisible"
      width="40%"
      >
      <el-image :src="imageSrc">
        <div slot="placeholder" class="image-slot">
          加载中<span class="dot">...</span>
        </div>
      </el-image>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 导航当前index
      activeName: '0',
      // 表单数据
      addGoodsFormData: {
        goods_name: '',
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      // 验证规则
      addGoodsFormDataRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 分类列表数据
      classifyList: [],
      // 分类参数
      parmasInfor: [],
      // 静态属性
      propertyInfor: [],
      // 配置上传图片的请求头信息
      setUploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览
      imageDialogVisible: false,
      // 图片路径
      imageSrc: ''
    }
  },
  methods: {
    // 获取分类列表
    async getClassifyList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('分类查询失败：' + res.meta.msg)
      this.$message.success(res.meta.msg)
      this.classifyList = res.data
      console.log(res)
    },
    handleChange() {
      if (this.addGoodsFormData.goods_cat.length !== 3) {
        this.addGoodsFormData.goods_cat = []
        this.$message.error('请选择三级分类')
        return
      }
      console.log(this.addGoodsFormData.goods_cat)
    },
    // 切换标签页之前的回调
    beforeTabLeave(activeName, oldActiveName) {
      switch (oldActiveName) {
        case '0': {
          if (this.addGoodsFormData.goods_cat.length !== 3) {
            this.$message.error('请先选择分类')
            return false
          }
          break
        }
      }
    },
    // tab改变时触发
    tabChange() {
      switch (this.activeName) {
        case '1': {
          this.getParmasInfor()
          break
        }
        case '2': {
          this.getPropertyInfor()
          break
        }
      }
    },
    // 获取商品参数
    async getParmasInfor() {
      const { data: res } = await this.$http.get(
        `categories/${this.addGoodsFormData.goods_cat[2]}/attributes`,
        { params: { sel: 'many' } }
      )
      if (res.meta.status !== 200) return this.$message.error('分类查询失败：' + res.meta.msg)
      console.log(res)
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
      this.parmasInfor = res.data
      console.log(this.parmasInfor)
    },
    // 参数发生改变触发
    checkboxChange() {
      console.log(this.addGoodsFormData)
    },
    // 获取商品静态属性
    async getPropertyInfor() {
      const { data: res } = await this.$http.get(
        `categories/${this.addGoodsFormData.goods_cat[2]}/attributes`,
        { params: { sel: 'only' } }
      )
      if (res.meta.status !== 200) return this.$message.error('分类查询失败：' + res.meta.msg)
      this.propertyInfor = res.data
      console.log(this.propertyInfor)
    },
    // 上传成功的钩子
    handleSuccess(response, file, fileList) {
      this.addGoodsFormData.pics.push({ pic: response.data.tmp_path })
    },
    // 点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      console.log(file)
      this.imageSrc = file.response.data.url
      this.imageDialogVisible = true
    },
    // 文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      // 查找出将要上删除的图片在数组中索引
      const index = this.addGoodsFormData.pics.findIndex(item => item.pic === file.response.data.tmp_path)
      this.addGoodsFormData.pics.splice(index, 1)
    },
    // 添加商品按钮
    addGoosd() {
      this.$refs.addGoodsFormDataRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 执行添加的业务逻辑
        const addGoosdObj = _.cloneDeep(this.addGoodsFormData)
        addGoosdObj.goods_cat = addGoosdObj.goods_cat.join(',')
        // 处理动态参数
        this.parmasInfor.forEach(item => {
          const newInfor = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          addGoosdObj.attrs.push(newInfor)
        })
        // 处理静态属性
        this.propertyInfor.forEach(item => {
          const newInfor = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          addGoosdObj.attrs.push(newInfor)
        })
        console.log(addGoosdObj)
        // 发送请求
        const { data: res } = await this.$http.post('/goods', addGoosdObj)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败' + res.meta.msg)
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getClassifyList()
  }
}
</script>

<style lang="less" scoped>
.el-steps,
.el-tabs {
  margin-top: 20px;
}

.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.el-image {
  width: 100%;
}

.addGoods {
  margin-top: 15px;
}
</style>
