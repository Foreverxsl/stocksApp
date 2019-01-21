<template>
  <div id="app" style="overflow:hidden;">
    <myheader fixed :title="title"></myheader>
    <div class="personal">
        <div class="user-head">
            <div @click="login()" v-if="!username">
                <img slot="icon" src="../../../static/imgs/头像图标.png" width="110" height="110">
                <p>点击登录</p>
            </div>
            <div class="user-img" v-else></div>
        </div>
        <div class="user-option">
            <div @click="setting()">
                <mt-cell is-link>
                    <span slot="title">账户设置</span>
                    <img slot="icon" src="../../../static/imgs/setting.png" width="18" height="18">
                </mt-cell>
            </div>
            <mt-cell is-link to="/suggestion">
                <span slot="title">意见反馈</span>
                <img slot="icon" src="../../../static/imgs/advice.png" width="18" height="18">
            </mt-cell>
            <mt-cell is-link to="/about">
                <span slot="title">关于我们</span>
                <img slot="icon" src="../../../static/imgs/info.png" width="18" height="18">
            </mt-cell>
            <mt-cell title="版本号">
                <img slot="icon" src="../../../static/imgs/version.png" width="18" height="18">
                <span>v1.0.0</span>
            </mt-cell>
        </div>
        <button class="login-out" @click="loginOut()" v-if="username">退出登录</button>
    </div>
  </div>
</template>
<script>
import { MessageBox,Cell } from 'mint-ui'
import myheader from '@/components/Header'
  export default {
    name: 'personal',
    data() {
      return {
        title: '个人中心',
        username: sessionStorage.username
      }
    },
    components: {
        myheader
    },
    methods: {
      login(){
        this.$router.push('/login');
      },
      loginOut(){
        MessageBox.confirm('确定退出登录?').then(action => {
          sessionStorage.removeItem('username')
          this.username = false
        }).catch(e=>{
          console.log(e)
        })  
      },
      setting() {
          if(this.username){
              this.$router.push('/setting')
          }else{
              MessageBox.alert('请先登录').then(action => {
                this.$router.push('/login')
            }).catch(e=>{

            })
          }
      }
    }
  }
</script>
<style lang='scss' scoped>
.mint-header{
    height: 2.5rem;
}
  .personal {
    position: absolute;
    background: #fafafa;
    top: 2.5rem;
    bottom: 3.4375rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    .user-head {
        height: 12.5rem;
        width: 100%;
        background-color: #fde2e2;
        display: flex;
        justify-content: center;
        align-items: center;
        div p{
            margin-top: -0.25rem;
            text-align:center;
            font-size: .875rem;
        }
        .user-img {
            background-image: url("../../../static/imgs/user1.jpg");
            /**正方形区域**/
            width: 100px;
            height: 100px;
            /**border半径要是边长的一半，这样就能画出一个圆**/
            border-radius: 50%;
            /**设置边框**/
            border: solid #ffffff 2px;
            background-repeat: no-repeat;
            background-size: 100%;
            /**设置为flex布局，并且内部项目都居中显示**/
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    .user-option {
        margin-top: 1.25rem;
        border-top: 1px solid #ececec;
        .mint-cell {
            min-height: 2.75rem;
            span{
                margin-left: 4px;
            }
            &:nth-child(3){
                margin-top: 1.25rem;
            }          
        }
        span {
            font-size: 13px;
        }
    }
    .login-out{
        position: absolute;
        bottom: 1.875rem;
        height: 2.5rem;
        font-size: .875rem;
        background: #fff;
        color: red;
        width: 100%;
        border: none;
        border-top: 1px solid #ececec;
        border-bottom: 1px solid #ececec;

    }
}
</style>
