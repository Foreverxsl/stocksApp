<template>
    <div id="app">
		<headerBack :title="title"></headerBack>
        <div class="main"></div>
        <div class="login-input">
            <div class="input-control">
                <input type="text" maxlength="11" class="phone" v-model="phone" placeholder="请输入手机号" >
                <span v-if="testPhone" class="error" @click="closePhone"></span>
            </div>
            <div class="input-control">
                <input type="password" class="password" v-model="password" placeholder="请输入密码" >
                <span v-if="testPwd" class="error" @click="closePwd"></span>
            </div>
            <div class="input-control">
                <input type="text" class="email" v-model="email" placeholder="请输入邮箱" >
                <span v-if="testEmail" class="error" @click="closeEmail"></span>
            </div>
            <div class="input-control">
                <span class="register" @click="register()">注册</span>
            </div>
            <div class="input-control">
                <p class="forget-pwd">
                    已有账号， 
                    <router-link to="/login1" class="forget-pwd">
                        <span style="color:#f94b52;">去登录>></span>
                    </router-link>
                </p>
            </div>
        </div>
  </div>
</template>

<script>
import headerBack from './headerBack.vue'
import { Toast } from 'mint-ui';
import { MessageBox } from 'mint-ui';
import {mapGetters,mapActions} from 'vuex'
    export default {
        data() {
            return {
                title: '注册',
                phone: '',      //手机号
                password: '',    //密码
                email: '',       //邮箱

            } 
        },
        components: {
            headerBack,
        },
        watch: {
            
        },
        computed:{
            ...mapGetters(['status']),
            testPhone:function () {    //清除手机号
                if( this.phone.length > 0 ){
                    return true;
                }else {
                    return false;
                }
            },
            testPwd:function () {    //清除密码
                if( this.password.length > 0 ){
                    return true;
                }else {
                    return false;
                }
            },
            testEmail:function () {    //清除邮箱
                if( this.email.length > 0 ){
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
            closeEmail() {   //删除输入的邮箱
                this.email = '';
            },
            register() {
                if(this.phone.trim()  == '' || this.password.trim()  =='' || this.email.trim()  =='') {
                    MessageBox({
                        title: '提示',
                        message: '手机号、密码和邮箱不为空',
                        showCancelButton: false
                    });
                    return ; 
                }
                if(!(/^1[34578]\d{9}$/.test(this.phone))){ 
                    MessageBox({
                        title: '提示',
                        message: '请输入正确的手机号',
                        showCancelButton: false
                    });
                    this.phone = ''
                }else if (this.password.length<6) {
                    MessageBox({
                        title: '提示',
                        message: '密码长度不少于6位',
                        showCancelButton: false
                    });
                    this.password = ''
                }else if(!( /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(this.email))){
                    MessageBox({
                        title: '提示',
                        message: '请输入正确的邮箱',
                        showCancelButton: false
                    });
                    this.email = ''
                }else{
                    var params = {
                        telphone: this.phone,
                        password: this.password,
                        email: this.email
                    }
                    this.findUser(params)
                    setTimeout(()=>{
                        console.log(this.status)
                        if(this.status == -1) {
                            MessageBox.confirm('该手机号已注册过，现在去登录?').then(action => {
                                this.$router.push({path: '/login' })
                            }).catch(e=>{
                                console.log(e)
                            })
                        }else if(this.status == 0) {
                            MessageBox.confirm('该邮箱已注册过，现在去登录?').then(action => {
                                this.$router.push({path: '/login' })
                            }).catch(e=>{
                                console.log(e)
                            })
                        }else{
                            console.log("注册")
                            this.insertUser(params).then(data=>{
                                console.log(data)
                                if(data.data == 'ok') {
                                    let instance = Toast('注册成功');
                                    setTimeout(() => {
                                        instance.close();
                                        this.$router.push({path: '/login' })
                                    }, 2000);
                                }
                            })
                        }
                    },100)
                }
            },
            ...mapActions(['findUser','insertUser'])
        },
    }
</script>

<style scoped>
#app{
    overflow: hidden;
}
.main {
    width: 100%;
    height: 12.5rem;
    margin-top: 2.5rem;
    background-color: #f8f8f8;
    background-image: url('../../static/imgs/banner.jpg');
    background-repeat: no-repeat;
    background-size: 100%;
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
    height: 2.2rem;
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
.email {
    background-image: url("../../static/imgs/email.png");
    background-repeat: no-repeat;
    background-position-x: 0.6rem;
    background-position-y: center;
    background-size: 1.4rem;
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
.register {
    display: block;
    width: 100%;
    background-color: #f94b52;
    color: #fff;
    font-size: 1rem;
    height: 2.4rem;
    border-radius: 20px;
    line-height: 2.4rem;
    margin-top: 1.25rem;
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