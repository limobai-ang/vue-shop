<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 提示区域 -->
      <el-alert title="修改商品信息" type="info" center show-icon></el-alert>
      <!-- 修改表单 -->
      <el-form :model="goosdData" label-width="150px"  class="demo-ruleForm" :rules="addGoodsFormDataRules" ref="addGoodsFormDataRef">
        <h3>商品基本信息</h3>
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="goosdData.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="goosdData.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="goosdData.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="goosdData.goods_weight" type="number"></el-input>
        </el-form-item>
        <h3>商品图片</h3>
        <el-upload
          class="upload-demo"
          action="http://127.0.0.1:8888/api/private/v1/upload"
          :headers="setUploadHeaders"
          :file-list="fileList"
          :on-success="handleSuccess"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          list-type="picture"
        >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
        <h3>商品参数</h3>
        <template v-for="item in goosdData.attrs">
          <el-form-item v-if="item.attr_sel === 'only'" :label="item.attr_name" :key="item.attr_id">
            <el-input v-model="item.attr_value"></el-input>
          </el-form-item>
        </template>
        <template v-for="item in goosdData.attrs">
          <el-form-item v-if="item.attr_sel === 'many'" :label="item.attr_name" :key="item.attr_id">
            <el-checkbox-group v-model="item.attr_value" @change="change">
                <el-checkbox border :label="item1" :key="index" v-for="(item1, index) in item.attr_vals"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>
        <h3>商品介绍</h3>
        <quill-editor v-model="goosdData.goods_introduce"></quill-editor>
        <el-button class="addGoods" type="primary" @click="addGoosd">修改商品</el-button>
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
      goodsId: '',
      goosdData: {},
      setUploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      fileList: [],
      imageSrc: '',
      imageDialogVisible: false,
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
      imageList: []
    }
  },
  methods: {
    async getGoosdData() {
      const { data: res } = await this.$http.get(`goods/${this.goodsId}`)
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败：' + res.meta.msg)
      this.goosdData = res.data
      this.goosdData.pics.forEach(item => {
        const obj = { url: item.pics_big_url, name: item.pics_big }
        this.fileList.push(obj)
      })
      this.goosdData.attrs.forEach(item => {
        if (item.attr_sel !== 'many') return
        item.attr_vals = item.attr_vals.split(' ')
        item.attr_value = item.attr_value.split(' ')
      })
    },
    // 上传成功的钩子
    handleSuccess(response, file, fileList) {
      this.imageList = []
      fileList.forEach(item => {
        const obj = {}
        if (item.response) {
          obj.pic = item.response.data.tmp_path
        } else {
          obj.pic = item.name
        }
        this.imageList.push(obj)
      })
      console.log(this.imageList)
    },
    // 移除时的钩子
    handleRemove(file, fileList) {
      this.imageList = []
      fileList.forEach(item => {
        const obj = {}
        if (item.response) {
          obj.pic = item.response.data.tmp_path
        } else {
          obj.pic = item.name
        }
        this.imageList.push(obj)
      })
      console.log(this.imageList)
    },
    // 点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      console.log(file)
      this.imageSrc = file.url
      this.imageDialogVisible = true
    },
    change() {
    },
    addGoosd() {
      this.$refs.addGoodsFormDataRef.validate(async (valid) => {
        const addGoosdObj = _.cloneDeep(this.goosdData)
        addGoosdObj.attrs.forEach(item => {
          if (item.attr_sel !== 'many') return
          item.attr_value = item.attr_value.join(' ')
        })
        addGoosdObj.pics = this.imageList
        const { data: res } = await this.$http.put(`goods/${this.goodsId}`, addGoosdObj)
        if (res.meta.status !== 200) return this.$message.error('获取商品信息失败：' + res.meta.msg)
        this.$message.success('商品信息修改成功：')
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.goodsId = this.$route.query.goodsId
    this.getGoosdData()
  }
}
</script>

<style lang="less" scoped>
.el-form {
  width: 80%;
  margin: 0 auto;
}
h3 {
  text-align: center;
}
.addGoods {
}
.upload-demo {
  margin: 0 auto;
  width: 80%;
}
</style>
