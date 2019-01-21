import Vuex from 'vuex'
import Vue from 'vue'
import loginStore from './modules/loginStore'
import registerStore from './modules/registerStore'
import settingStore from './modules/settingStore'

 
Vue.use(Vuex)
export default new Vuex.Store({
  modules: {
    loginStore,
    registerStore,
    settingStore
  }
})
