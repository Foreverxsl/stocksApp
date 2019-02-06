<template>
  <div id="app">
    <keep-alive>
      <router-view class="child-view" v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>    
    <mt-tabbar v-model="selected" v-show="test" fixed>
        <mt-tab-item id="home">
            <img slot="icon" src="./assets/home.svg" v-if="selected !='home'">
            <img slot="icon" src="./assets/home1.svg" v-if="selected=='home'"> 首页
        </mt-tab-item>
         <mt-tab-item id="info">
            <img slot="icon" src="./assets/Quotation.svg" v-if="selected !='info'">
            <img slot="icon" src="./assets/Quotation-Selected.svg" v-if="selected=='info'">行情
        </mt-tab-item>
        <mt-tab-item id="myChose">
            <img slot="icon" src="./assets/Add.svg" v-if="selected !='myChose'">
            <img slot="icon" src="./assets/Optional-Selected.svg" v-if="selected=='myChose'"> 自选
        </mt-tab-item>
        <mt-tab-item id="personal">
            <img slot="icon" src="./assets/personal.svg" v-if="selected !='personal'">
            <img slot="icon" src="./assets/personal-active.png" v-if="selected=='personal'">我的
        </mt-tab-item>
    </mt-tabbar>
  </div>
</template>
<script>
import Vue from 'vue';
export default {
  name: 'app',
  data() {
    return {
      selected: 'home',
      transitionName: 'slide-left',
      test: true
    }
  },
  watch:{
    '$route'(to,from){
      /*console.log("to"+this.selected)
      console.log("from"+from.path)*/
      if(to.path == '/'){
        this.selected = 'home'
        //this.test = true
      }
      if(to.path == '/personal'){
        this.selected = 'personal'
      }
      if(to.path == '/' || to.path == '/myChose' || to.path == '/myStocks' || to.path =='/personal' || to.path =='/login'){
        this.test = true
      }else {
        this.test = false

      }
    },
    selected: function(val, oldVal) {
        // 这里就可以通过 val 的值变更来确定去向
        switch (val) {
            case 'home':
                this.$router.push("/")
                //console.log(this.selected)
                break;
            case 'myChose':
                this.$router.push("/myChose")              
                //console.log(this.selected)
                break;
            case 'info':                    
                this.$router.push("/myStocks")
                //console.log(this.selected)
                break;
            case 'personal':
                this.$router.push("/personal")
                //console.log(this.selected)
                break;
        }
    }
  }
}
</script>
<style lang='scss'>
  #app {
    font-family: Arial, 微软雅黑, "Microsoft yahei", "Hiragino Sans GB", "冬青黑体简体中文 w3", STXihei, 华文细黑, SimSun, 宋体, Heiti, 黑体, sans-serif;
    -webkit-font-smoothing: antialiased;
    -webkit-overflow-scrolling: touch;
    -moz-osx-font-smoothing: grayscale;
    color: #808080;
  }
  body{
    background-color: #fff;
  }
  .mint-tab-item-label {
    font-size: .875rem !important;
  }  
  .mint-tab-item-icon {
      width: 1.375rem;
      height: 1.375rem;
  }
  .mint-tabbar.is-fixed{
      z-index: 30;
  }
  .mint-tabbar{
    background-image: none;
    border-top: 1px solid #eee;
  }
  .mint-tabbar > .mint-tab-item.is-selected {
      background-color: #fafafa;
      color: rgb(248, 46, 46);
  }
  .yd-accordion-head{
    height: 2.5rem;
    padding: 0 .375rem;
    border-bottom: 1px solid #eee;
  }
  .yd-accordion-head:after{
    height: 0;
  }
  .mint-cell{
    min-height: 2.75rem;
    .mint-radio-input:checked + .mint-radio-core{
        background-color: red;
        border-color: red;
    }
    .mint-radio-core{
      &:after{
        transition: none;
      }

    }
    
    span{
        font-size: .875rem;
    }
  }
  .mint-cell-text{
    font-size: .875rem;
    margin-left: .25rem;
  }
  .mint-cell-wrapper{
    border-bottom: 1px solid #ececec;
    background-image: none;
  }
</style>
