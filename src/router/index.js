import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/login.vue'
// import Home from '../components/home.vue'
// import Wlecone from '../components/Wlecone.vue'
const Login = () => import(/* webpackChunkName: "login_home_wlecone" */ '../components/login.vue')
const Home = () => import(/* webpackChunkName: "login_home_wlecone" */ '../components/home.vue')
const Wlecone = () => import(/* webpackChunkName: "login_home_wlecone" */ '../components/Wlecone.vue')

// import User from '../components/users/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
const User = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/users/User.vue')
const Rights = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "User_Rights_Roles" */ '../components/power/Roles.vue')

// import Categories from '../components/goods/Categories.vue'
// import Params from '../components/goods/Params.vue'
const Categories = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/Categories.vue')
const Params = () => import(/* webpackChunkName: "Categories_Params" */ '../components/goods/Params.vue')

// import List from '../components/goods/List.vue'
// import AddGoods from '../components/goods/AddGoods.vue'
// import editGoods from '../components/goods/editGoods.vue'
const List = () => import(/* webpackChunkName: "List_AddGoods_editGoods" */ '../components/goods/List.vue')
const AddGoods = () => import(/* webpackChunkName: "List_AddGoods_editGoods" */ '../components/goods/AddGoods.vue')
const editGoods = () => import(/* webpackChunkName: "List_AddGoods_editGoods" */ '../components/goods/editGoods.vue')

// import Order from '../components/order/Order.vue'
// import Report from '../components/reports/Report.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/reports/Report.vue')

Vue.use(VueRouter)

const routes = [
  // ?????????????????? ???????????????????????????
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/wlecone',
    // ?????? children ??????, ??? /register ?????????????????????
    children: [
      { path: '/wlecone', component: Wlecone },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Categories },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: AddGoods },
      { path: '/goods/edit', component: editGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // to????????????????????? from??????????????????????????? ???????????????????????????
  if (to.path === '/login') next()
  // ??????sessionStorage?????????token??? ????????????????????????
  const tokenStr = window.sessionStorage.getItem('token')
  // ??????token????????????????????? ????????????
  if (!tokenStr && to.path !== '/login') return next('/login')
  next()
})

export default router
