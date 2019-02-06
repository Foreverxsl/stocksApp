<template>
    <div class="suggestion">
        <headerBack :title="title"></headerBack>
        <div class="suggestion-content">
            <div class="title">
               <div class="title-chose">
                   <mt-radio
                        title="问题分类"
                        v-model="value"
                        :options="['功能建议', '功能异常', '使用疑问']">
                    </mt-radio>
               </div>           
            </div>
            <div class="desc">
                <label class="desc-title">反馈内容</label>
                <textarea placeholder="请输入内容" v-model="desc" maxlength="200" rows="12"></textarea>              
            </div>
            <div class="desc">
                <label class="desc-title">联系方式</label>
                <input type="text" v-model="phone" placeholder="请输入你的手机号"/>              
            </div>
        </div>
        <div class="footer">
            <button @click="submit">提交</button>
        </div>
    </div>
</template>

<script>
import { Radio } from 'mint-ui';
import { Toast } from 'mint-ui';
import { MessageBox } from 'mint-ui';
import Vue from 'vue'
import headerBack from './headerBack'
import {mapGetters,mapActions} from 'vuex'
Vue.component(Radio.name, Radio);
    export default {
        name: 'suggestion',
        data() {
            return {
                title: '意见反馈',
                value: '',
                desc: '',
                phone: ''
            }
        },
        components: {
            headerBack
        },
        methods: {
            submit(){
                if(this.value == '' || this.desc.trim() =='' || this.phone == ''){
                    MessageBox({
                        title: '提示',
                        message: '所有内容都不为空',
                        showCancelButton: false
                    });
                    return ;     
                }else if(!(/^1[34578]\d{9}$/.test(this.phone))) {
                    MessageBox({
                        title: '提示',
                        message: '请输入正确的手机号',
                        showCancelButton: false
                    });
                    this.phone = ''
                }else {
                    var params = {
                        title: this.title,
                        desc: this.desc,
                        telphone: this.phone
                    }
                    this.insertSuggestion(params).then(res=>{
                        if(res.data == 'ok') {
                            this.value = ''
                            this.phone = ''
                            this.desc = ''
                            Toast('提交成功')
                        }
                    })
                }
            },
            ...mapActions(['insertSuggestion'])
        }
        
    }
</script>

<style lang='scss' scoped>
.suggestion{  
    .suggestion-content{
        background: #fafafa;
        position: absolute;
        top: 2.5rem;
        bottom: 2.5rem;
        //padding: 0 1.125rem;
        width: 100%;
        .title-chose{
            .mint-cell {
                min-height: 2.5rem;
            }
        }
        .desc{
            margin-top: .625rem;
            .desc-title{
                font-size: 12px;
                margin: 8px;
                display: block;
                color: #888;
            }
            textarea{
                width: 100%;
                border: none;
                border-top: 1px solid #eee;
                border-bottom: 1px solid #eee;
                &::-webkit-input-placeholder {
                    /* placeholder颜色  */
                    color: #aab2bd;
                    /* placeholder字体大小  */
                    font-size: 12px;
                    /* placeholder位置  */
                    padding: 4px;
                }
            }
            input{
                width: 100%;
                border: none;
                border-top: 1px solid #eee;
                border-bottom: 1px solid #eee;
                height: 2.5rem;
                background: #fff;
                &::-webkit-input-placeholder {
                    /* placeholder颜色  */
                    color: #aab2bd;
                    /* placeholder字体大小  */
                    font-size: 12px;
                    /* placeholder位置  */
                    padding: 4px;
                }
            }
        }
    }
    .footer{
        position: fixed;
        background: #eee;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2.5rem;
        button{
            width: 100%;
            height: 100%;
            border: none;
            background: red;
            color: #fff;
            font-size: .875rem;
        }
    }
    
}

</style>