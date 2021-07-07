import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Wlecone from '../components/Wlecone.vue'
import User from '../components/users/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'

Vue.use(VueRouter)

const routes = [
  // 访问根目录时 路由重定向到登录页
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/wlecone',
    // 通过 children 属性, 为 /register 添加子路由规则
    children: [
      { path: '/wlecone', component: Wlecone },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, form, next) => {
  // to将要访问的路径 form从哪个路径跳转而来 访问登录页往下放行
  if (to.path === '/login') next()
  // 获取sessionStorage里面的token值 看用户有没有登录
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token就跳转到登录页 否则放行
  if (!tokenStr) return next('/login')
  next()
})

export default router
