import axios from 'axios'
import Vue from 'Vue'
Vue.prototype.$http = axios

export default {
    state: {
        user: ''
    },
    getters: {
        user: function (state) {
          return state.user
        }
    },
    mutations: {
        getUser(state,data) {
            state.user = data
        }
    },
    actions: {
        findUser(context,params) {
            axios.get('http://localhost:3000/login', {params})
            .then(res=> {
                context.commit('getUser',res.data)
                //console.log(res.data)
            }).catch(err=> {
                console.log(err)
            })
        }
    }
}