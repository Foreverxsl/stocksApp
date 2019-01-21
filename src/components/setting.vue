<template>
    <div>
        <header-back :title="title"></header-back>
        <div class="setting-content">
            <div class="detail">
                <mt-cell title="手机号码">
                    <span>{{userMessage.telphone}}</span>
                </mt-cell>
                <mt-cell title="登录邮箱">
                    <span>{{userMessage.email}}</span>
                </mt-cell>
                <div @click="updatePass()">
                    <mt-cell is-link>
                        <span slot="title">修改密码</span>
                    </mt-cell>
                </div>
            </div>
           

        </div>

    </div>
</template>

<script>
import { MessageBox,Cell } from 'mint-ui';
import {mapGetters,mapActions} from 'vuex'
import headerBack from './headerBack'
    export default {
        data() {
            return {
                title: '账户设置',
                phone: sessionStorage.username
            }
        },
        created() {
            var params = {telphone:this.phone}
            this.getUserMessage(params)
            //console.log(this.userMessage)
        },
        components: {
            headerBack
        },
        computed: {
            ...mapGetters(['userMessage']), 
            
        },
        methods: {
            updatePass() {
                MessageBox.prompt('请输入原密码','').then(({ value, action }) => {
                    if(value !== this.userMessage.password){
                        MessageBox.alert('密码错误，请重填')
                    }
                    MessageBox.prompt('请输入新密码','').then(({ value, action })=> {
                        var params = {
                            telphone: this.phone,
                            password: value
                        }
                        //console.log(params)
                        if(value.length < 6) {
                            MessageBox.alert('密码长度不小于6')
                        }
                        this.updatePassword(params).then(res=>{
                            if(res.data == 'ok') {
                                MessageBox.alert('修改成功')
                            }
                            //console.log(res)
                        })
                    }).catch(e=>{})

  
                }).catch(e=>{})
                //MessageBox.prompt('请输入密码', '为保障你的账号安全，修改密码前请填写原密码');

            },
            ...mapActions(['getUserMessage','updatePassword']),
            
        },
        
    }
</script>

<style lang='scss' scoped>
.setting-content{
    width: 100%;
    position: absolute;
    background: #fafafa;
    top: 2.5rem;
    bottom: 0;
    .detail{
        margin-top: 1.25rem;
        border-top: 1px solid #ececec;
        .mint-cell {
            min-height: 2.75rem;
            span{
                margin-left: 4px;
                font-size: .875rem;
            }
            
        }
    }
}
</style>