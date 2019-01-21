import axios from 'axios'
import Vue from 'Vue'
Vue.prototype.$http = axios

export default {
    state: {
        status: ''
    },
    getters: {
        status: function (state) {
          return state.status
        }
    },
    mutations: {
        getStatus(state,data) {
            //console.log(data)
            state.status = data
        }
    },
    actions: {
        findUser(context,params) {
            axios.get('http://localhost:3000/register/selectUser', {params})
            .then(res=> {
                context.commit('getStatus',res.data)
            }).catch(err=> {
                console.log(err)
            })
        },
        insertUser(context,params) {
            return new Promise(function(resolve,reject){
                axios.post('http://localhost:3000/register', params)
                .then(data=>{
                    resolve(data)
                }).catch(e=>{
                    console.log(e)
                })
            })
        }

    }
}