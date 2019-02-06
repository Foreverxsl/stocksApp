import Vue from 'vue'
import Router from 'vue-router'
import stockEdit from '@/components/stockEdit'
import home from '@/pages/home/Home'
import stockDetails from '@/components/stockDetails'
import myChose from '@/pages/mychose/myChose'
import my from '@/pages/mime/personal'
import newsDetail from '@/components/newsDetail'
import stockNewDetail from '@/components/stockNewDetail'
import myStocks from '@/pages/quotation/stock'
import about from '@/components/about'
import setting from '@/components/setting'
import suggestion from '@/components/suggestion'
import login from '@/components/login'
import login1 from '@/components/login1'
import Register from '@/components/register'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [{
        path: '/',
        name: 'home',
        meta: {
            title: 'home',
            keepAlive: true //缓存页面
        },
            component: home
        }, {
            path: '/stockEdit',
            name: 'stockEdit',
            component: stockEdit
        }, {
            path: '/stockDetails/:id',
            name: 'stockDetails',
            component: stockDetails, 
            meta: {
                //keepAlive: true
            },
        }, {
            path: '/myStocks',
            name: 'stock',
            component: myStocks,
            meta: {
                keepAlive: true,
                //requireAuth: true
            },
        }, {
            path: '/login',
            name: 'login',
            component: login
        }, {
            path: '/login1',
            name: 'login1',
            component: login1
        }, {
            path: '/register',
            name: 'Register',
            component: Register
        }, {
            path: '/myChose',
            name: 'myChose',
            component: myChose,
            meta: {
                requireAuth: true
            },
        }, {
            path: '/newsDetail/:id',
            name: 'newsDetail',
            component: newsDetail
        },{
            path: '/stockNewDetail/:id',
            name: 'stockNewDetail',
            component: stockNewDetail,
        },{
            path: '/personal',
            name: 'myCenter',
            component: my
        },
        {
            path: '/about',
            name: 'about',
            component: about
        },{
            path: '/setting',
            name: 'setting',
            component: setting
        },{
            path: '/suggestion',
            name: 'suggestion',
            component: suggestion
        }
    ],
    scrollBehavior (to, from, savedPosition) {
        return { x: 0, y: 0 }
    }
})
