// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import Vuex from 'vuex'
import store from './store'
import mintui from 'mint-ui'
import 'mint-ui/lib/style.css'
/*import 'vue-ydui/dist/ydui.rem.css'*/
import 'vue-ydui/dist/ydui.base.css';
Vue.config.productionTip = false

Vue.prototype.$http = axios
Vue.use(Vuex)
Vue.use(mintui)
/* eslint-disable no-new */
//登录拦截
router.beforeEach((to, from, next) => {
    if (to.matched.some(res => res.meta.requireAuth)) {// 判断是否需要登录权限
        if (sessionStorage.getItem('username')) {// 判断是否已登录
            next()
        } else {// 没登录则跳转到登录界面
            next({
                path: '/login',
                //query: {redirect: to.fullPath}
            })
        }
    } else {
        next()
    }
})
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
