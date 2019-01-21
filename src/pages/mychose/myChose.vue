<template>
    <div class="myChose">
        <!-- <pull-refresh :refreshing="isRefreshing" :on-refresh="onRefresh" > -->
        <myheader :title="title"></myheader>
        <div class="search">
            <search @childToParent='parentGetChild'></search>
        </div>
        <div class="myChose_content" v-if="isShow==false">   
            <div class="list_title">
                <div class="edit header_edit">
                    <router-link to="/stockEdit"><span></span>编辑</router-link>
                </div>
                <div class="header_new">
                    <span class="txt">最新价</span>
                    <span class="priceChange" :class="{price_up:priceGoChange==1,price_down:priceGoChange==2}"></span>
                </div>
                <div class="header_change">
                    <span class="txt">涨幅</span>
                    <span class="priceChange" :class="{price_up:this.riseGoChange==1,price_down:this.riseGoChange==2}"></span>
                </div>
            </div>
            <div class="myChose_stock">
                <ul class="stock_list clearfix">
                    <li class="list_body  clearfix" v-for="(item, index) in selfStock" @click="toDetail(item)">
                        <div class="edit">
                            <div class="stock_name">{{item.name || item.stkName}}</div>
                            <div class="stock_under">
                                <span class="code">{{item.code || item.stkCode}}</span>
                            </div>
                        </div>
                        <div class="new" :class="{color_red:item.risePrice>0,color_green:item.risePrice<0}">{{item.price|| '--'}}</div>
                        <div class="change" :class="{color_red:item.risePrice>0,color_green:item.risePrice<0}">{{item.rise || '--'}}</div>
                    </li>
                    <li v-if="hasSelfStock">
                        <div class="add" @click="addStock()">
                            <span class="add_icon"></span>添加自选股
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <!-- </pull-refresh> -->
    </div>
</template>

<script>
import myheader from '@/components/Header'
import search from './components/search'
/*import pullRefresh from "./pullRefresh.vue";*/
import axios from 'axios'
import formatterDateTime from '../../utils/utils'
import qs from 'qs'
import Vue from 'vue';
import echarts from 'echarts';
Vue.prototype.$echarts = echarts;
    export default {
        name: 'myChose',
        data() {
            return {
                title: '自选',
                isRefreshing: false,
                telphone: sessionStorage.username,
                isShow: '', //判断是否显示自选部分
                indexShow: false, //判断指数下拉框是否显示
                priceGoChange: 0, //判断最新价的变化
                riseGoChange: 0, //判断涨幅的变化
                selfStock: [], //子组件传过来的，搜索页添加的股票列表
                // codeList: [], //和db文件匹配到的结果的数组，页面的自选股展示有此数组渲染
                quotes: [], //存放每次请求回来的数据
                sort: "none", //请求自选股列表的入参，以什么样的排序方式请求数据
                type: "price", //请求自选股列表的入参，以什么指标来请求数据
                stkcode: [], //请求自选股列表的入参，传回后台的股票代码列表
                interval: "", //接收定时器的变量
            }
        },
        destroyed: function() {
            clearInterval(this.interval);
        },
        components: {
            myheader,
            search,
            /*pullRefresh*/
        },
        computed: {
            hasSelfStock() {
                if(this.selfStock.length == 0) {
                    return true
                }else {
                    return false
                }
            }
        },
        methods: {
            onRefresh() {
                this.isRefreshing = true;
                this.forDate()
                setTimeout(() => {
                    this.isRefreshing = false;
                }, 2000)
            },
            parentGetChild: function(val) { //将子组件search.vue传回来的值赋值给isShow,来判断content即自选股列表是否显示,子组件传回的值为false时显示
                //在点击取消按钮的时候调用requeatData函数
                if (val == false) {
                    // this.showIndexPicture();
                    // console.log('val', val)
                    this.selfStock = JSON.parse(localStorage.getItem(this.telphone));
                    console.log("自选列表", this.selfStock);
                    //获取请求自选股列表时  传回后台的股票代码列表
                    this.stkcode = [];
                    for (var i = 0; i < this.selfStock.length; i++) {
                        (this.stkcode).push(this.selfStock[i].stkcode || this.selfStock[i].market+this.selfStock[i].code);
                    }
                    //console.log("传回后台的代码列表", this.stkcode.join(','));
                    // console.log(JSON.stringify(this.stkcode));
                    var that = this;
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
                    if (this.selfStock.length > 0) { //若用户没有添加自选股，则不请求数据
                        this.forDate();
                        //在开盘时间段内才调用定时器，刷新最新价和涨幅数据 
                        if ((startTimeAm < new Date() && new Date() < endTimeAm) || (startTimePm < new Date() && new Date() < endTimePm)) {
                            that.interval = setInterval(that.forDate, 5000);
                        }
                    }
                }
                this.isShow = val; //子组件传回来的值付值给isShow以判断自选股展示部分是否显示
                console.log(this.isShow);
            },
            addStock: function() { //点击添加股票，判断content即自选股列表是否显示
                this.isShow = true;
            },
            goChange: function() { //最新价的升序降序还原
                // this.priceGoChange=1;
                this.riseGoChange = 0;
                this.type = "price";
                this.priceGoChange++;
                //点击最新价的图标时，改变排序方式的入参
                switch (this.priceGoChange) {
                    case 3:
                        this.sort = "none";
                        this.forDate();
                        // console.log("排序还原", this.priceGoChange);
                        break;
                    case 1:
                        this.sort = "asc";
                        this.forDate();
                        // console.log("升序", this.priceGoChange);
                        break;
                    case 2:
                        this.sort = "desc";
                        this.forDate();
                        // console.log("降序", this.priceGoChange);
                        break;
                }
                // console.log("判断升降序2-------", this.priceGoChange);
                if (this.priceGoChange == 3) {
                    this.priceGoChange = 0;
                }
            },
            riseChange: function() { //涨幅的升序降序还原
                this.priceGoChange = 0;
                this.type = "rise";
                this.riseGoChange++;
                //点击涨幅的图标时，改变排序方式的入参
                switch (this.riseGoChange) {
                    case 3:
                        this.sort = "none";
                        this.forDate();
                        break;
                    case 1:
                        this.sort = "asc";
                        this.forDate();
                        break;
                    case 2:
                        this.sort = "desc";
                        this.forDate();
                        break;
                }
                if (this.riseGoChange == 3) {
                    this.riseGoChange = 0;
                }
            },
            toDetail: function(item) { //点击自选股展示的每一条跳转至个股详情页
                this.$router.push({
                    path: '/stockDetails/stkCode=' + item.stkCode + '&stkName=' + encodeURI(item.stkName)
                });
                console.log(item);
            },
            forDate: function() {
                //请求自选股列表的数据，获取最新价 涨幅
                var that = this;
                // var startTime = new Date().getTime();
                //if(this.stkcode == "sh000001")
                var stklist = that.stkcode.join(',')
                axios({
                        url: `http://qt.gtimg.cn/q=${stklist}`,
                        //url: 'http://101.231.93.232:14014/indexData/getIndexData',
                        method: 'get',
                        /*data: {
                            "stklist": that.stkcode,
                            "xdxrType": "pre",
                            "sort": that.sort,
                            "type": that.type,
                            "startNum": 0,
                            "endNum": that.stkcode.length
                        }*/
                })
                .then(function(res) {
                    that.quotes = [];
                    var data = res.data.split('~'); //取返回的结果
                    for(var i= 0; i < data.length; i+= 53){
                        that.quotes.push(data.slice(i,i+53));
                    }
                    that.quotes.pop()
                    //console.log("start",that.quotes)
                    for(var j = 0; j < that.quotes.length; j++) {
                        if(that.quotes[j][0].indexOf("sh")>-1){
                            that.quotes[j][0] ='sh'+that.quotes[j][2]
                        }else{
                            that.quotes[j][0] ='sz'+that.quotes[j][2]
                        }
                    }
                    if ((that.quotes).length != 0) { //判断请求回来是有数据的
                        for (var i = 0; i < that.quotes.length; i++) {
                            that.quotes[i].stkCode = that.quotes[i][0];
                            that.quotes[i].stkName = that.quotes[i][1];
                            that.quotes[i].code = that.quotes[i][0].slice(2);
                            that.quotes[i].price = Number(that.quotes[i][3]).toFixed(2);
                            that.quotes[i].rise = Number(that.quotes[i][32]).toFixed(2) + "%";
                            that.quotes[i].risePrice = that.quotes[i][31];                               
                        }
                        //console.log("quotes",that.quotes)
                        that.selfStock = that.quotes;
                    }
                    //console.log("请求赋值后直接使用的结果", that.selfStock);
                })
                // var endTime = new Date().getTime();
                // console.log("时间差", (endTime - startTime));
            },
        }
        
    }
</script>

<style lang='scss' scoped>
.clearfix:after {
    content: " ";
    display: block;
    clear: both;
    height: 0;
}
.clearfix {
    zoom: 1;
}
.myChose {
    position: relative;
    background-color: #fff;
    .search {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #fff;
        z-index: 20;
    }
    .myChose_padding {
        padding: 0 0.9375rem;
    }
    .mint-search {
        margin-top: 2.5rem;
        height: 2.6rem;
    }
    .myChose_content {
        background-color: #fff;
        padding-bottom: 5rem;
        min-height: 100vh;
        z-index: 20;
        position: fixed;
        width: 100%;
        top: 5.125rem;
        .myChose_index {
            border-bottom: 1px solid #f0f0f0;
            position: fixed;
            width: 100%;
            background-color: #fff;
            position: relative;
        }
        .stock_list {
            width: 100%;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            padding: 0;
            margin: 0;
            li {
                border-bottom: 1px solid #f0f0f0;
                &:last-child {
                    border: none;
                }
                div {
                    float: left;
                    width: 32%;
                    .up_change {
                        background: url("../../assets/icon_up.2.svg");
                        background-repeat: no-repeat;
                        background-size: 100%;
                        position: absolute;
                        top: 0.9rem;
                        right: 0;
                    }
                    .up {
                        display: inline-block;
                        width: 0.3125rem;
                        height: 0.28125rem;
                        background: url("../../assets/icon_up.1.svg");
                        background-repeat: no-repeat;
                        background-size: 100%;
                        position: absolute;
                        top: 0.9rem;
                        right: 0;
                    }
                    .down {
                        display: inline-block;
                        width: 0.3125rem;
                        height: 0.28125rem;
                        background: url("../../assets/icon_down.1.svg");
                        background-repeat: no-repeat;
                        background-size: 100%;
                        position: absolute;
                        bottom: 0.9rem;
                        right: 0;
                    }
                    .down_change {
                        background: url("../../assets/icon_down.2.svg");
                        background-repeat: no-repeat;
                        background-size: 100%;
                        position: absolute;
                        bottom: 0.9rem;
                        right: 0;
                    }
                    &.new {
                        text-align: right;
                        font-size: 1rem;
                        /*color: #FF363F;*/
                        line-height: 3.25rem;
                    }
                    &.change {
                        padding-right: 0.5rem;
                        text-align: right;
                        font-size: 1rem;
                        line-height: 3.25rem;
                    }
                }       
            }
            .stock_name {
                width: 100%;
                margin-top: 0.5625rem;
                font-size: 1rem;
                color: #303030;
                line-height: 1rem;
            }
            .stock_under {
                padding: 0;
                margin-bottom: 0.5625rem;
                margin-top: 0.372rem;
                width: 100%;
                height: 0.8125rem;
                .code {
                    font-size: 0.8125rem;
                    color: #B9B9B9;
                    line-height: 0.8125rem;
                }
                
            }
            .add {
                text-align: center;
                margin-top: 1.5625rem;
                font-size: 0.9375rem;
                color: rgb(248, 46, 46);
                line-height: 0.9375rem;
                width: 100%!important;
                position: absolute;
                width: 100%;
                .add_icon {
                    display: inline-block;
                    width: 0.90625rem;
                    height: 0.90625rem;
                    background: url(../../assets/icon_add.svg);
                    background-repeat: no-repeat;
                    background-size: 100%;
                    vertical-align: middle;
                    margin-right: 0.375rem;
                }
            }
        }
        .header_edit {
            font-size: 0.9375rem;
            line-height: 2.2rem;
            text-align: left;
            position: relative;
            span {
                display: inline-block;
                width: 0.6875rem;
                height: 0.6875rem;
                background: url("../../assets/icon_edit1.svg");
                background-repeat: no-repeat;
                background-size: 100%;
                margin-right: 0.5rem;
            }
        }
        .header_new {
            text-align: right;
            position: relative;
            font-size: 0.9375rem;
            line-height: 2.2rem;
        }
        .txt {
            margin-right: 0.4rem;
        }
        .header_change {
            padding-right: 0.9375rem;
            text-align: right;
            position: relative;
            font-size: 0.9375rem;
            line-height: 2.2rem;
        }
    }
    .edit {
        text-align: left;
        padding-left: 0.9375rem;
    }
    .myChose_stock {
        overflow-y: scroll;
        position: absolute;
        width: 100%;
        height: 100%;
        margin-bottom: 10rem;
        border-top: 1px solid #f0f0f0;
    }
    .list_title {
        background-color: #f7f7f7;
        &>div {
            display: inline-block;
            width: 32%;
        }
    }
    .color_red {
        color: #FF363F;
    }
    .color_green {
        color: #1CCE18;
    }
}
.mint-searchbar {
    padding: 0.45rem 0.9375rem;
}

/*以下样式为最新价，涨幅的排序部分*/
/* .myChose .priceChange {
    display: inline-block;
    width: 0.4375rem;
    height: 0.25rem;
    background: url("../../assets/icon_normal.svg");
    background-repeat: no-repeat;
    background-size: 100%;
} 
.myChose .price_up {
    display: inline-block;
    width: 0.4375rem;
    height: 0.625rem;
    background: url("../../assets/icon_upup.svg");
    background-repeat: no-repeat;
    background-size: 100%;
}
.myChose .price_down {
    display: inline-block;
    width: 0.4375rem;
    height: 0.625rem;
    background: url("../../assets/icon_downdown.svg");
    background-repeat: no-repeat;
    background-size: 100%;
}*/
</style>