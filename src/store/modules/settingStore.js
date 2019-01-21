import axios from 'axios'
import Vue from 'Vue'
Vue.prototype.$http = axios

export default {
    state: {
        userMessage: ''
    },
    getters: {
        userMessage: function (state) {
          return state.userMessage
        }
    },
    mutations: {
        getUser(state,data) {
            state.userMessage = data
        }
    },
    actions: {
        getUserMessage(context,params) {
            axios.get('http://localhost:3000/user', {params})
            .then(res=> {
                console.log(res)
                context.commit('getUser',res.data)
                //console.log(res.data)
            }).catch(err=> {
                console.log(err)
            })
        },
        updatePassword(context,params) {
            return new Promise(function(resolve,reject){
                axios.post('http://localhost:3000/user/update',params)
                .then(res=>{
                    resolve(res)
                }).catch(err=> {
                    console.log(err)
                })
            })
        }
    }
}