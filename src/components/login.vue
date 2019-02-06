<template>
    <div style="overflow:hidden;">
		<myheader :title="title"></myheader>
        <div class="main"></div>
        <div class="login-input">
            <div class="input-control">
                <input type="text" maxlength="11" class="phone" v-model="phone" placeholder="请输入手机号">
                <span v-if="testPhone" class="error" @click="closePhone"></span>
            </div>
            <div class="input-control">
                <input type="password" class="password" v-model="password" placeholder="请输入登录密码" >
                <span v-if="testPwd" class="error" @click="closePwd"></span>
            </div>
            <div class="input-control">
                <span class="login" @click="login">登录</span>
            </div>
            <div class="input-control">
                <p class="forget-pwd">
                    
                </p>
            </div>
        </div>
        <div class="login-footer">
            <p class="login-register">
                <router-link to="/register" class="register-link">注册>></router-link>
            </p>
        </div>
  </div>
</template>

<script>
import { Toast } from 'mint-ui';
import { MessageBox } from 'mint-ui';
import myheader from './Header'
import axios from 'axios'
import {mapGetters,mapActions} from 'vuex'
    export default { 
        data() {
            return {
                title: '登录',
                phone: '',      //手机号
                password: '',    //密码
                //userState: this.$store.state.user
                //userState: this.$store.state.userStore.user,

            } 
        },
        components: {
            myheader
        },
        watch: {
            
        },
        computed:{
            ...mapGetters(['user']),  
            testPhone:function () {    //手机号错误提示
                if( this.phone.length > 0 ){
                    return true;
                }else {
                    return false;
                }
            },
            testPwd:function () {    //密码错误显示
                if( this.password.length > 0 ){
                    return true;
                }else {
                    return false;
                }
            }
        },
        methods: {
            closePhone(){    //删除手机输入的信息
                this.phone = '';
            },
            closePwd(){      //删除输入的密码
                this.password = '';
            },
            login() {
                if(this.phone.trim()  == '' || this.password.trim()  ==''){
                    MessageBox({
                        title: '提示',
                        message: '手机号和密码不为空',
                        showCancelButton: false
                    });
                    return ; 
                }
                var params = {  
                        telphone: this.phone,
                        password: this.password
                    }
                this.findUser(params)
                // 设置定时器不然拿不到异步更新完后的是数据
                setTimeout(()=>{
                    if(this.user == -1){
                        Toast({
                            message: '手机号错误',
                            position: 'middle',
                            duration: 2000
                        });
                        this.phone = ''
                        console.log('手机号错误')
                    }else if(this.user == 0){
                        Toast({
                            message: '密码错误',
                            position: 'middle',
                            duration: 2000
                        });
                        this.password = ''
                        console.log('密码错误')
                    }else{
                        console.log(this.user)
                        sessionStorage.setItem('username',this.phone)
                        this.$router.push('/personal')
                    }
                },50)
            },
            ...mapActions(['findUser']),
        },
    }
</script>

<style scoped>
.main {
    width: 100%;
    height: 12.5rem;
    margin-top: 2.5rem;
    background-color: #fde2e2;
    background-image: url('../../static/imgs/头像图标.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 7rem;
}
.login-input{
    width: 90%;
    margin: 0 auto;
}
.input-control{
    position: relative;
    font-size: 0px; 
    margin-top: 1.25rem;
}
input[type='text'],input[type='password'],input[type='tel']{
    width: 100%;
    height: 2.5rem;
    font-size: 0.8125rem;
    background-color: #fff;
    border-radius: 20px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    display: inline-block;
    line-height: normal;
    outline: 0;
    padding: 0 1rem;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
}
.phone {
    background-image: url("../../static/imgs/手机号-1.png");
    background-repeat: no-repeat;
    background-position-x: 0.6rem;
    background-position-y: center;
    background-size: 1.5rem;
    padding-left: 2.4rem !important; 
  }
.password{
    background-image: url("../../static/imgs/密码.png");
    background-repeat: no-repeat;
    background-position-x: 0.6rem;
    background-position-y: center;
    background-size: 1.5rem;
    padding-left: 2.4rem !important; 
}
.forget-pwd{
    font-size: 0.75rem;
    color: #8a8a8a;
  }
.error{
    background-image: url("../../static/imgs/删除.png");
    background-repeat: no-repeat;
    background-position-x: 0.625rem;
    background-position-y:center;
    background-size: 1.25rem;
    display: inline-block;
    width: 2.5rem;
    height: 2.5rem;
    position: absolute;
    top: 0;
    right: 0;
}
.login {
    display: block;
    width: 100%;
    background-color: #f94b52;
    color: #fff;
    font-size: 1rem;
    height: 2.4rem;
    border-radius: 20px;
    line-height: 2.4rem;
    margin-top: 1rem;
    text-align: center;
}
.login-register{
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    font-size: .875rem;
    color: #f94b52; 
}
.register-link{
    color: #f94b52;
    text-decoration-line: none;
    font-size: .875rem;
}
</style>