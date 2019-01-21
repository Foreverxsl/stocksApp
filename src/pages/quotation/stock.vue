<template>
    <div class="stock">
        <myheader :title="title"></myheader>
        <div class="hushen">
            <!-- 指数板块 -->
            <div class="hushen-plate clearfix">
                <div class="clearfix"></div>
                <ul class="clearfix">
                    <li v-for="(item,index) in zsLists" :key="index" @click="toDetail(item)">                            
                        <div>{{item[1]}}</div>
                        <div :class="{color_red:item[31]>0,color_green:item[31]<0}">{{item[3]}}</div>
                        <div>
                            <span :class="{color_red:item[31]>0,color_green:item[31]<0}">{{item[31]}}</span>
                            <span :class="{color_red:item[31]>0,color_green:item[31]<0}">{{item[32]}}</span>
                        </div>                               
                    </li>
                </ul>
            </div>
            <!-- 榜单模块 -->
            <div class="listModule">
                <yd-accordion accordion>
                    <yd-accordion-item title="涨幅排行榜">
                        <ul>
                            <li v-for="(item,index) in riseMaxSort.slice(0,10)" @click="toDetail(item)">
                                <div><span>{{item[1]}}</span><span >{{item[2]}}</span></div>
                                <div :class="{color_red:item[31]>0}">{{item[3]}}</div>
                                <div :class="{color_red:item[31]>0}">+{{item[32]}}%</div>
                            </li>
                        </ul>
                    </yd-accordion-item>
                    <yd-accordion-item title="跌幅排行榜">
                        <ul>
                            <li v-for="(item,index) in riseMinSort.slice(0,10)" @click="toDetail(item)">
                                <div><span>{{item[1]}}</span><span >{{item[2]}}</span></div>
                                <div :class="{color_green:item[31]<0}">{{item[3]}}</div>
                                <div :class="{color_green:item[31]<0}">{{item[32]}}%</div>
                            </li>
                        </ul>
                    </yd-accordion-item>
                    <yd-accordion-item title="振幅排行榜">
                        <ul>
                            <li v-for="(item,index) in zfMaxSort.slice(0,10)" @click="toDetail(item)">
                                <div><span>{{item[1]}}</span><span>{{item[2]}}</span></div>
                                <div :class="{color_green:item[31]<0,color_red:item[31]>0}">{{item[3]}}</div>
                                <div>{{item[43]}}%</div>
                            </li>
                        </ul>
                    </yd-accordion-item>
                    <yd-accordion-item title="换手率排行榜">
                        <ul>
                            <li v-for="(item,index) in handMaxSort.slice(0,10)" @click="toDetail(item)">
                                <div><span>{{item[1]}}</span><span>{{item[2]}}</span></div>
                                <div :class="{color_green:item[31]<0,color_red:item[31]>0}">{{item[3]}}</div>
                                <div>{{item[38]}}%</div>
                            </li>
                        </ul>
                    </yd-accordion-item>
                </yd-accordion>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import myheader from '@/components/Header'
import axios from 'axios'
import {Accordion, AccordionItem} from 'vue-ydui/dist/lib.px/accordion';
Vue.component(Accordion.name, Accordion);
Vue.component(AccordionItem.name, AccordionItem);
    export default {
        data() {
            return {
                title: '行情',
                allStocks: localStorage.allStocks,
                zsLists: [],
                stkcode: [],
                riseMaxSort: [],
                riseMinSort: [],
                zfMaxSort: [],
                handMaxSort: [],
                indexMax: 0,
                indexMin: 0,
                indexZf: 0,
                indexHand: 0,
                riseMax: [],
                riseMin: [],
                zfMax: [],
                handMax: [],
                interval: "", //接收定时器的变量
            }
        },
        components: {
            myheader
        },
        created() {
            //console.log(this.allStocks)
            this.getStockInfos()
            this.updateStocks()
            this.getstkCode()
            this.riseSortMax()
            this.riseSortMin()
            this.zfSort()
            this.handSort()
        },
        destroyed: function() {
            clearInterval(this.interval);
        },
        methods: {
            // 实时更新数据
            updateStocks() {
                var startTimeAm = new Date();
                startTimeAm.setHours(9);
                startTimeAm.setMinutes(30);
                startTimeAm.setSeconds(0);
                // console.log("startTimeAm", startTimeAm);
                var endTimeAm = new Date();
                endTimeAm.setHours(11);
                endTimeAm.setMinutes(30);
                endTimeAm.setSeconds(0);
                // console.log("endTimeAm", endTimeAm);
                var startTimePm = new Date();
                startTimePm.setHours(13);
                startTimePm.setMinutes(0);
                startTimePm.setSeconds(0);
                // console.log("startTimePm", startTimePm);
                var endTimePm = new Date();
                endTimePm.setHours(15);
                endTimePm.setMinutes(0);
                endTimePm.setSeconds(0);
                if ((startTimeAm < new Date() && new Date() < endTimeAm) || (startTimePm < new Date() && new Date() < endTimePm)) {
                    this.interval = setInterval(this.getStockInfos, 5000);
                }

            },
            // 请求指数列表的数据，获取最新价 涨幅
            getStockInfos() {
                var stklist = 'sh000001,sz399001,sz399006,sh000300,sh000016,sh000905'
                var result = []
                axios({
                        url: `http://qt.gtimg.cn/q=${stklist}`,
                        method: 'get',
                    })
                    .then((res) => {
                        var data = res.data.split('~'); //取返回的结果
                        for(var i= 0; i < data.length; i+= 53){
                            result.push(data.slice(i,i+53));
                        }
                        result.pop()
                        //console.log("start",result)
                        if ((result).length != 0) { //判断请求回来是有数据的
                            for (var i = 0; i < result.length; i++) {
                                if(result[i][0].indexOf("sh")>-1){
                                    result[i][0] ='sh'+result[i][2]
                                }else{
                                    result[i][0] ='sz'+result[i][2]
                                }                          
                            }
                            //console.log("请求赋值后直接使用的结果", result);
                            this.zsLists = result
                        }               
                    })
                },
                // 每900只股票分为一组
                getstkCode() {
                    if(localStorage.stkGroup) {
                        //console.log('json',json)
                        this.stkcode = JSON.parse(localStorage.stkGroup)
                    }
                    var stkCode=[],stkGroup=[],data=JSON.parse(this.allStocks);
                    for(var i=0; i < data.length; i++) {
                        data[i].stkcode = data[i].market+data[i].code
                        stkCode.push(data[i].stkcode)
                    }
                    for(var i=0;i<stkCode.length;i+=900){
                        stkGroup.push(stkCode.slice(i,i+900));
                    }
                    this.stkcode = stkGroup
                    localStorage.setItem("stkGroup",JSON.stringify(this.stkcode))
                },
                // 股票涨幅排序
                riseSortMax() {
                    var key = this.indexMax;
                    if (key > 4) {
                        //console.log('超过限定数');
                        return;
                    }      
                    var stkcode = this.stkcode,result = []
                    axios({
                        url: `http://qt.gtimg.cn/q=${stkcode[key]}`,
                        method: 'get',
                    })
                    .then((res) => {
                        var data = res.data.split('~'); //取返回的结果
                        for(var i= 0; i < data.length; i+= 53){
                            result.push(data.slice(i,i+53));
                        }
                        result.pop()
                        if ((result).length != 0) { //判断请求回来是有数据的
                            for (let i = 0; i < result.length; i++) {
                                if(result[i][0].indexOf("sh")>-1){
                                    result[i][0] ='sh'+result[i][2]
                                }else{
                                    result[i][0] ='sz'+result[i][2]
                                }                               
                            }
                            for(let j = 0; j<result.length; j++) {
                                if(result[j][32]>8){
                                    this.riseMax.push(result[j])
                                }
                            }
                            this.indexMax++
                            this.riseSortMax()
                            this.riseMaxSort = this.riseMax.sort(function(a,b){
                                return b[32]-a[32];
                            })                   
                        }
                    })
                },
                // 股票跌幅排序
                riseSortMin(){
                    var key = this.indexMin;
                    if (key > 4) {
                        //console.log('超过限定数');
                        return;
                    }      
                    var stkcode = this.stkcode,result = []
                    axios({
                        url: `http://qt.gtimg.cn/q=${stkcode[key]}`,
                        method: 'get',
                    })
                    .then((res) => {
                        var data = res.data.split('~'); //取返回的结果
                        for(var i= 0; i < data.length; i+= 53){
                            result.push(data.slice(i,i+53));
                        }
                        result.pop()
                        if ((result).length != 0) { //判断请求回来是有数据的
                            for (let i = 0; i < result.length; i++) {
                                if(result[i][0].indexOf("sh")>-1){
                                    result[i][0] ='sh'+result[i][2]
                                }else{
                                    result[i][0] ='sz'+result[i][2]
                                }                               
                            }
                            for(let j = 0; j<result.length; j++) {
                                if(result[j][32]<-4){
                                    this.riseMin.push(result[j])
                                }
                            }
                            this.indexMin++
                            this.riseSortMin()
                            this.riseMinSort = this.riseMin.sort(function(a,b){
                                return a[32]-b[32];
                            })  
                            //console.log('最小值',this.riseMinSort)                 
                        }
                    })
                },
                // 股票振幅排序
                zfSort(){
                    var key = this.indexZf;
                    if (key > 4) {
                        //console.log('超过限定数');
                        return;
                    }      
                    var stkcode = this.stkcode,result = []
                    axios({
                        url: `http://qt.gtimg.cn/q=${stkcode[key]}`,
                        method: 'get',
                    })
                    .then((res) => {
                        var data = res.data.split('~'); //取返回的结果
                        for(var i= 0; i < data.length; i+= 53){
                            result.push(data.slice(i,i+53));
                        }
                        result.pop()
                        if ((result).length != 0) { //判断请求回来是有数据的
                            for (let i = 0; i < result.length; i++) {
                                if(result[i][0].indexOf("sh")>-1){
                                    result[i][0] ='sh'+result[i][2]
                                }else{
                                    result[i][0] ='sz'+result[i][2]
                                }                               
                            }
                            for(let j = 0; j<result.length; j++) {
                                this.zfMax.push(result[j])
                            }
                            this.indexZf++
                            this.zfSort()
                            this.zfMaxSort = this.zfMax.sort(function(a,b){
                                return b[43]-a[43];
                            })  
                            //console.log('振幅',this.zfMaxSort)                 
                        }
                    })
                },
                handSort() {
                    var key = this.indexHand;
                    if (key > 4) {
                        //console.log('超过限定数');
                        return;
                    }      
                    var stkcode = this.stkcode,result = []
                    axios({
                        url: `http://qt.gtimg.cn/q=${stkcode[key]}`,
                        method: 'get',
                    })
                    .then((res) => {
                        var data = res.data.split('~'); //取返回的结果
                        for(var i= 0; i < data.length; i+= 53){
                            result.push(data.slice(i,i+53));
                        }
                        result.pop()
                        if ((result).length != 0) { //判断请求回来是有数据的
                            for (let i = 0; i < result.length; i++) {
                                if(result[i][0].indexOf("sh")>-1){
                                    result[i][0] ='sh'+result[i][2]
                                }else{
                                    result[i][0] ='sz'+result[i][2]
                                }                               
                            }
                            for(let j = 0; j<result.length; j++) {
                                this.handMax.push(result[j])
                            }
                            this.indexHand++
                            this.handSort()
                            this.handMaxSort = this.handMax.sort(function(a,b){
                                return b[38]-a[38];
                            })  
                            //console.log('换手率',this.handMaxSort)                 
                        }
                    })
                },
                toDetail: function(item) { //点击跳转至个股详情页
                    this.$router.push({
                        path: '/stockDetails/stkCode=' + item[0] + '&stkName=' + encodeURI(item[1])
                    });
                }
            },
    }
</script>

<style lang='scss' scoped>
.color_red {
    color: #FF363F;
}
.color_green {
    color: #1CCE18;
}
.stock {
    padding-bottom: 3.4273rem;
    .hushen{
        .hushen-plate {
            padding-top: 2.5rem;
            padding-right: .375rem;
            padding-left: 4px;
            background-color: #fafafa;
            div {
                width: 100%;
                height: 0.625rem;
            }
            ul {
                padding: 0 0 .25rem 0;
                margin: 0;
                li {
                    background: #fff;
                    list-style: none;
                    float: left;
                    width: 31.333%;
                    height: 4.96875rem;
                    margin: 1%;
                    border: 1px solid #fafafa;
                    padding-top: 0.3125rem;
                    padding-bottom: 0.3125rem;
                    text-align: center;
                    div:nth-child(1) {
                        height: 40%;
                        line-height: 1.5625rem;
                        font-size: 0.9375rem;
                    }
                    div:nth-child(2) {
                        height: 40%;
                        line-height: 1.25rem;
                        font-size: 1.25rem;
                    }
                }            
            }
        }
        .listModule {
            padding-right: 0.9375rem;
            padding-left: 0.9375rem;
            margin-bottom: 0.3125rem;
            background-color: #fff;
            ul>li {
                height: 3.15625rem;
                color: #303030;
                border-bottom: 1px solid #ececec;
                text-align: center;
                &>div{
                    float: left;
                    &:nth-child(1) {
                        width: 40%;
                        padding-top: 0.5rem;
                        text-align: left;
                        &>span{
                            display: inline-block;
                            line-height: 1.2rem;
                            &:nth-child(1) {
                                display: block;
                                font-size: 1rem;
                                color: #303030;
                            }
                            &:nth-child(2) {
                                font-size: 0.8125rem;
                                color: #b9b9b9;
                                margin-right: 0.2rem;
                            }
                            &:nth-child(3) {
                                color: #fff;
                                height: 1rem;
                                background-color: #FD9819;
                                border-radius: 2px;
                            }
                        }
                    }
                    &:nth-child(2),&:nth-child(3){
                        width: 30%;
                        line-height: 3.15625rem;
                        font-size: 1rem;
                    }
                }
            }
        }
        
    }
}

.yd-accordion-title {
    height: 2.5rem;
}
.yd-accordion-head{
    padding: 0;
    height: 40px;
}
.yd-accordion>div {
    position: relative;
}
.yd-accordion>div a {
    position: absolute;
    top: 0;
    right: 0;
}
.yd-accordion-title>span {
    display: block;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    height: 2.5rem;
    line-height: 2.5rem;
    font-size: .875rem;
}
.yd-accordion-title>i:after {
    border: none;
}
.yd-accordion {
    position: relative;
}
/*板块样式*/
.clearfix {
    zoom: 1;
}
.clearfix:after {
    content: "";
    display: block;
    clear: both;
}
.clearfix {
    zoom: 1;
}

</style>