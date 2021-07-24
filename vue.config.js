module.exports = {
    chainWebpack: config => {
      // 发布模式
      config.when(process.env.NODE_ENV === 'production', config => {
        // 定义生产环境入口
        config.entry('app').clear().add('./src/main-prod.js')
        // 生产环境cdn引入外部资源
        config.set('externals', {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          axios: 'axios',
          lodash: '_',
          echarts: 'echarts',
          nprogress: 'NProgress',
          'vue-quill-editor': 'VueQuillEditor'
        })
        // 生产环境定制首页内容
        config.plugin('html').tap(args => {
          args[0].isProd = true
          return args
        })
      })
      config.when(process.env.NODE_ENV === 'development', config => {
        // 定义开发环境入口
        config.entry('app').clear().add('./src/main-dev.js')
        // 开发环境定制首页内容
        config.plugin('html').tap(args => {
          args[0].isProd = false
          return args
        })
      })
    }
  }