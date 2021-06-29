import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
// 导入axios
import axios from 'axios'
import { isEmail } from './assets/js/validata.js'

// 配置请求的基准URL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 为请求配置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 给请求头配置Authorization属性值为token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$isEmail = isEmail

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')