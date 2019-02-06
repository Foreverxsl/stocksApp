import axios from 'axios'
import Vue from 'Vue'
Vue.prototype.$http = axios

export default {
    state: {
        suggestion: ''
    },
    getters: {
        suggestion: function (state) {
          return state.suggestion
        }
    },
    mutations: {
        getSuggestion(state,data) {
            state.suggestion = data
        }
    },
    actions: {
        insertSuggestion(context,params) {
            return new Promise(function(resolve,reject){
                axios.post('http://localhost:3000/user/suggestion',params)
                .then(res=>{
                    resolve(res)
                }).catch(err=> {
                    console.log(err)
                })
            })
        }
    }
}