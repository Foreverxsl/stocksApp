<template>
  <div class="content">
  <myheader :title="title"></myheader>
    <div class="title">
      <p>aa</p>
      <p>
        <span>ss</span>
        <span>qq</span>
      </p>
    </div>
    <div class="relatedStock">
      <p>
        <span>相关股票：</span>
        <span class="stock">gg</span>
      </p>
    </div>
    <div class="detail">
      <span>xxxxxxxxxxxx</span>
    </div>
  </div>
</template>

<script>
import myheader from '@/components/Header'
export default {
  data() {
    return {
      title: '首页'
    }
  },
  /*name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }*/
  components: {
    myheader
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.content {
  margin: 55px 12px 10px 12px;
  .title {
    border-bottom: solid 1px #d9dde0;
    p:first-child {
      font-size: 15px;
    }
    p:last-child {
      font-size: 12px;
      color: #5d5f61;
    }
  }
  .relatedStock{
    font-size:13px;
    // margin: 
    .stock{
      color:#458ee0;
      margin:0 5px;
    }
  }
  .detail{
    margin-top:15px;
    font-size:14px;
    line-height: 25px;
  }
  p {
    margin: 10px 0;
  }
}
</style>
