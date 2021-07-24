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
import treeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置请求的基准URL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 为请求配置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 给请求头配置Authorization属性值为token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 发起请求之前显示进度条
  NProgress.start()
  return config
})
// 响应拦截器
axios.interceptors.response.use(config => {
  // 请求响应之后隐藏进度条
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.prototype.$isEmail = isEmail

Vue.config.productionTip = false

Vue.component('tree-table', treeTable)

// 将组件注册为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
