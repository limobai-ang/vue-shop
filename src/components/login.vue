<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 表单区域 -->
            <el-form label-width="0" :model="form" ref="loginFormRef" :rules="addFormRules" class="form_box">
                <el-form-item label="" prop="username">
                    <el-input v-model="form.username" placeholder="请输账号" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <el-form-item label="" prop="password">
                    <el-input v-model="form.password" show-password placeholder="请输密码" prefix-icon="iconfont icon-3702mima"></el-input>
                </el-form-item>
                 <el-form-item label="" class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="clearForm">清除</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      form: {
        username: '',
        password: ''
      },
      // 表单的数据验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    clearForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 验证表单数据是否合法
      this.$refs.loginFormRef.validate(async valid => {
        // 表单数据不和法直接结束函数
        if (!valid) return
        // 发送请求返回响应数据
        const { data: res } = await this.$http.post('/login', this.form)
        // 登录信息错误弹出提示框 提示错误信息
        if (res.meta.status !== 200) {
          this.$message({
            showClose: true,
            message: res.meta.msg,
            type: 'error',
            center: true
          })
          return
        }
        // 登录成功
        this.$message({
          showClose: true,
          message: res.meta.msg,
          type: 'success',
          center: true
        })
        /*
          将登陆成功之后的token 保存到客户端 sessionStorage中
            项目中出了登录之外的其他API接口，必须在登录之后才能访问
            token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage中
          通过编程式导航跳转到后台主页 路由地址是 /home
        */
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang='less' scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}

.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.avatar_box{
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #909399;
    padding: 6px;
    box-shadow: 0 0 10px #909399;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #DCDFE6;
    }
}

.btns {
    display: flex;
    justify-content: flex-end;
}

.form_box {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
}
</style>
