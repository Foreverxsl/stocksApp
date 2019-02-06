<template>
    <div class="home">   
        <pull-refresh :refreshing="isRefreshing" :on-refresh="onRefresh" >
            <myheader :title="title"></myheader>
            <div class="home_content">
                <mt-swipe :auto="8000">
                    <mt-swipe-item v-for="(item,index) in items" :key="index">
                        <img :src="item.url" class="img"/>
                        <span class="desc"></span>
                    </mt-swipe-item>
                </mt-swipe>
                <div class="home_index">
                    <ul class="index_list home_padding clearfix">
                        <!-- <li class="" @click="selected='1'"> -->
                        <li class="" @click="shangzhenSelected()">
                            <div class="price" :class="{color_red:shangIndex.rise>0,color_green:shangIndex.rise<0}">{{shangIndex.price}}</div>
                            <div class="under">
                                <span class="name">上证</span>
                                <span class="extent" :class="{color_red:shangIndex.rise>0,color_green:shangIndex.rise<0}">{{shangIndex.rise +'%'}}</span>
                            </div>
                        </li>
                        <!-- <li @click="selected='2'"> -->
                        <li @click="shenzhengSelected()">
                            <div class="price" :class="{color_red:shenIndex.rise>0,color_green:shenIndex.rise<0}">{{shenIndex.price}}</div>
                            <div class="under">
                                <span class="name">深证</span>
                                <span class="extent" :class="{color_red:shenIndex.rise>0,color_green:shenIndex.rise<0}">{{shenIndex.rise  +'%'}}</span>
                            </div>
                        </li>
                        <!-- <li @click="selected='3'"> -->
                        <li @click="chuangyeSelected()">
                            <div class="price" :class="{color_red:chuangyeIndex.rise>0,color_green:chuangyeIndex.rise<0}">{{chuangyeIndex.price}}</div>
                            <div class="under">
                                <span class="name">创业</span>
                                <span class="extent" :class="{color_red:chuangyeIndex.rise>0,color_green:chuangyeIndex.rise<0}">{{chuangyeIndex.rise  +'%'}}</span>
                            </div>
                        </li>
                    </ul>
                    <span class="index_picture" @click="showIndexPicture()" :class="[this.indexShow ? changeBackground : originalBackground]"></span>
                    <div class="index_model" v-if="indexShow==true">
                        <!-- navbar -->
                        <mt-navbar class="page-part" v-model="selected">
                            <mt-tab-item id="1"></mt-tab-item>
                            <mt-tab-item id="2"></mt-tab-item>
                            <mt-tab-item id="3"></mt-tab-item>
                        </mt-navbar>
                        <!-- tabcontainer -->
                        <mt-tab-container v-model="selected" id='echartsBox'>
                            <mt-tab-container-item id="1" swipeable>
                                <div id="Ssci" style="width:100%;height:10rem;"></div>
                            </mt-tab-container-item>
                            <mt-tab-container-item id="2">
                                <div id="Szi" style="height:10rem;"></div>
                            </mt-tab-container-item>
                            <mt-tab-container-item id="3">
                                <div id="Gi" style="height:10rem;"></div>
                            </mt-tab-container-item>
                        </mt-tab-container>
                    </div>
                </div> 
                <div class="cjnews">
                    <p style="font-size:.875rem;color:rgb(51, 51, 51);font-weight:bold">每日财经</p>
                </div>    
                <div class="news" v-for="(item, key) in articleList">
                    <news-cell :news="item" :key="key"></news-cell>
                </div>
            </div>
        </pull-refresh>
        <back-to-top v-show="showTop" transitionName="fade"></back-to-top>
    </div>
</template>

<script>
import myheader from '@/components/Header'
import newsCell from './components/newsCell'
import backToTop from './components/backTop'
import pullRefresh from '@/components/pullRefresh'
import formatterDateTime from '../../utils/utils'
import qs from 'qs'
import axios from 'axios'
import Vue from 'vue'
import {Swipe, SwipeItem,Toast} from 'mint-ui'
import 'mint-ui/lib/style.css'
import echarts from 'echarts';
Vue.prototype.$echarts = echarts;

    export default {
        name: 'home',
        data() {
            return {
                title: '首页',
                showTop: false,
                isRefreshing: false,
                articleList: [], // 文章列表
                selected: "1", //自检自带，默认显示tab栏id为1的
                indexShow: false, //判断指数下拉框是否显示
                changeBackground: "changeBackground", //v-bind:class要求指向的类名
                originalBackground: "originalBackground",
                priceGoChange: 0, //判断最新价的变化
                riseGoChange: 0, //判断涨幅的变化
                selfStock: [], //子组件传过来的，搜索页添加的股票列表
                // codeList: [], //和db文件匹配到的结果的数组，页面的自选股展示有此数组渲染
                quotes: [], //存放每次请求回来的数据
                sort: "none", //请求自选股列表的入参，以什么样的排序方式请求数据
                type: "price", //请求自选股列表的入参，以什么指标来请求数据
                stkcode: [], //请求自选股列表的入参，传回后台的股票代码列表
                shangIndex: {
                    price: "--",
                    rise: "--"
                }, //存储上证指数的数据
                shenIndex: {
                    price: "--",
                    rise: "--"
                }, //存储深证指数的数据
                chuangyeIndex: {
                    price: "--",
                    rise: "--"
                }, //存储创业指数的数据
                totalDate: '', // 日期例如 20171101
                tabCount: [0, 0, 0], //给tab栏点击计数  防止重复渲染
                ssciTime: [], //上证指数时间轴数据
                ssciPrice: [], //上证指数price数据
                ssciPriceMax: [], // 上证指数的最大值数据
                ssciPriceMin: [], // 上证指数的最小值数据
                ssciPriceMaxinum: [], // 上证指数的最小值数据,仅用于存储
                ssciPriceMininum: [], // 上证指数的最小值数据,仅用于存储
                ssciOldTime: '', //上证指数上一次数据推送的时间
                ssciPreClose: [], //上证指数上一交易日的收盘价
                ssciMa: [], //上证指数上的ma
                ssciVol: [], //上证指数的成交量
                ssciRise: [], //上证指数的涨跌幅
                ssciPriceMaxFloat: [], // 深证指数的最大值数据的涨幅
                ssciPriceMinFloat: [], // 深证指数的最小值数据的涨幅
                sziTime: [], //深证指数时间轴数据
                sziPrice: [], //深证指数price数据
                sziPriceMax: [], // 深证指数的最大值数据
                sziPriceMin: [], // 深证指数的最小值数据
                sziPriceMaxinum: [], // 深证指数的最小值数据,仅用于存储
                sziPriceMininum: [], // 深证指数的最小值数据,仅用于存储
                sziOldTime: '', //深证指数上一次数据推送的时间
                sziPreClose: [], //深证指数数上一交易日的收盘价
                sziMa: [], //深证指数上的ma
                sziVol: [], //深证指数的成交量
                sziRise: [], //深证指数的涨跌幅
                sziPriceMaxFloat: [], // 深证指数的最大值数据的涨幅
                sziPriceMinFloat: [], // 深证指数的最小值数据的涨幅
                giTime: [], //创业板指数时间轴数据
                giPrice: [], //创业板指数price数据
                giPriceMax: [], // 创业板指数的最大值数据
                giPriceMin: [], // 创业板指数的最小值数据
                giPriceMaxinum: [], // 创业板指数的最小值数据,仅用于存储
                giPriceMininum: [], // 创业板指数的最小值数据,仅用于存储
                oldTime: '', //创业板指上一次数据推送的时间
                giPreClose: [], //创业板指上一交易日的收盘价
                giMa: [], //创业板指上的ma
                giVol: [], //创业扳指的成交量
                giRise: [], //创业扳指的涨跌幅
                giPriceMaxFloat: [], // 创业板指数的最大值数据的涨幅
                giPriceMinFloat: [], // 创业板指数的最小值数据的涨幅
                timeArray: [], //分时图的时间轴
                indexFlag: true, //判断tab栏切换的点击事件是否执行完毕
                ssciEcharts: null, //上证echarts图的实例
                ssciOption: null, //深证echarts图的实例
                sziEcharts: null, //创业板指echarts图的实例
                sziOption: null, //上证echarts图的option
                giEcharts: null, //深证echarts图的option
                giOption: null, //创业板指echarts图的option
                items: [
                    {url: 'http://localhost:8080/static/imgs/banner3.jpg'},
                    {url: 'http://localhost:8080/static/imgs/banner4.jpg'},
                    {url: 'http://localhost:8080/static/imgs/banner1.jpg'}
                ]
            }
        },
        components: {
            myheader,
            newsCell,
            backToTop,
            pullRefresh,
            'mt-swipe': Swipe,
            'mt-swipe-item': SwipeItem,
        },
        created() {
            this.indexData();
            this.getArticleData();
            this.getAllStocks();
            this.getDPStockInfo();
            //window.addEventListener('scroll', this.handleScroll);  
        },
        activated () {
            this.indexData();
            //this.getArticleData();
            window.addEventListener('scroll', this.handleScroll); 
        },
        beforeDestroy () {
            window.removeEventListener('scroll', this.handleScroll)
        },
        watch: {     
            indexShow(val, oldVal) { //指数分时图下拉框显示的时候，时间轴赋值
                if (val == true) {
                    var hoursList = [{
                        "hour": "09",
                        "startMinutes": "30",
                        "endMinutes": "59"
                    }, {
                        "hour": "10",
                        "startMinutes": "0",
                        "endMinutes": "59"
                    }, {
                        "hour": "11",
                        "startMinutes": "0",
                        "endMinutes": "30"
                    }, {
                        "hour": "13",
                        "startMinutes": "0",
                        "endMinutes": "59"
                    }, {
                        "hour": "14",
                        "startMinutes": "0",
                        "endMinutes": "59"
                    }, {
                        "hour": "15",
                        "startMinutes": "0",
                        "endMinutes": "0"
                    }];
                    var minutesList = [];
                    for (var i = 0; i < hoursList.length; i++) {
                        this.forTime(hoursList[i].hour, hoursList[i].startMinutes, hoursList[i].endMinutes)
                            // console.log("循环", i)
                    }
                    //console.log("时间时间时间", this.timeArray);
                } else if (val == false) {
                    this.timeArray = [];
                    var that = this;
                }
            }
        },
        methods: {
            // 下拉刷新
            onRefresh() {
                this.isRefreshing = true;
                setTimeout(() => {
                    this.getArticleData()
                    this.isRefreshing = false;
                }, 2000)
            },
            // 获取所有股票信息
            getAllStocks() {
                if(!localStorage.allStocks) {
                    axios({
                        url: 'http://localhost:8080/static/mock/allStocks.json',
                        method: 'get',
                    })
                    .then(function(res) {
                        var data = res.data.contentlist
                        console.log("allStocks",data);
                        localStorage.setItem('allStocks', JSON.stringify(data));
                        that.flag = !that.flag;
                    })
                }
            },
            // 获取大盘股票基本信息 
            getDPStockInfo: function() {
                if(!localStorage.dpstocks){
                    axios({
                        url: 'http://localhost:8080/static/mock/dp.json',
                        method: 'get',
                    })
                    .then(function(res) {
                        var data = res.data.contentlist
                        localStorage.setItem('dpstocks', JSON.stringify(data));
                        that.flag = !that.flag;
                        // console.log( that.flag)
                    })
                }
            },
            handleScroll() {
                let curHeight = document.documentElement.scrollTop || document.body.scrollTop;  //滚动高度
                let viewHeight = document.documentElement.clientHeight;
                //console.log("curHeight"+curHeight)
                //console.log("viewHeight"+viewHeight)
                if (curHeight > viewHeight) {
                    this.showTop = true;
                    //console.log("true")
                }
                else {
                    this.showTop = false;
                    //console.log("false")
                }
            },
            // 获取新闻列表
            getArticleData() {
                axios.post("/api?type=caijing&key=9e84f33def298f7f436fddbab7ce668c")
                .then(res => {
                    this.articleList = res.data.result.data
                    console.log('更新成功',this.articleList)
                    /*Toast({
                        message: '更新成功',
                        duration: 2000
                        });*/
                    window.scrollTo(0,0)
                }).catch(err => {
                    console.log(err)
                    Toast({
                        message: '请求异常',
                        duration: 2000
                        });
                })
            },
            showIndexPicture() { //点击箭头判断 指数的下拉框是否显示
                this.indexShow = !this.indexShow;
                this.tabCount = [0, 0, 0];
                this.selected = "1";
                if (this.indexShow && this.selected == '1' && this.tabCount[0] < 1) {
                    this.tabCount[0]++;
                    this.getSscidata(this.drawEchartSsci);
                } else if (this.indexShow && this.selected == '2' && this.tabCount[1] < 1) {
                    this.tabCount[1]++;
                    this.getSzidata(this.drawEchartSzi);
                } else if (this.indexShow && this.selected == '3' && this.tabCount[2] < 1) {
                    this.tabCount[2]++;
                    this.getGidata(this.drawEchartGi);
                }
            },
            //获取指数的信息
            indexData() {
                var that = this;
                var url = 'http://route.showapi.com/131-45'
                var data = {
                    "showapi_timestamp": formatterDateTime,
                    "showapi_appid": '85473', //这里需要改成自己的appid
                    "showapi_sign": '95c0a5096275453e8035871c43ddd5cd',  //这里需要改成自己的应用的密钥secret
                    "stocks": 'sh000001,sz399001,sz399006'
                }
                axios.post(
                    url,
                    qs.stringify(data),{
                        headers:{
                            'Content-Type':'application/x-www-form-urlencoded'
                            }
                        }
                    )
                    .then(function(res) {
                        var data = res.data.showapi_res_body.indexList
                        // //console.log('指数的行情数据', that.shangIndex);
                        that.shangIndex.price = Number(data[0].nowPrice).toFixed(2);
                        that.shangIndex.rise = Number(data[0].diff_rate).toFixed(2);
                        // that.shenIndex = res.data.split(",");
                        that.shenIndex.price = Number(data[1].nowPrice).toFixed(2);
                        that.shenIndex.rise = Number(data[1].diff_rate).toFixed(2);
                        // that.chuangyeIndex = res.data.split(",");
                        that.chuangyeIndex.price = Number(data[2].nowPrice).toFixed(2);
                        that.chuangyeIndex.rise = Number(data[2].diff_rate).toFixed(2);
                        console.log(data)
                    })
            },
            // 上证指数分时数据
            getSscidata(callback) {
                this.indexFlag = false;
                var ssci = this;
                ssci.ssciPrice = [];
                ssci.ssciVol = [];
                ssci.ssciRise = [];
                var url = 'http://route.showapi.com/131-51';
                var data = {
                    "showapi_timestamp": formatterDateTime,
                    "showapi_appid": '85473', //这里需要改成自己的appid
                    "showapi_sign": '95c0a5096275453e8035871c43ddd5cd',  //这里需要改成自己的应用的密钥secret
                    "code":"000001",
                }
                axios.post(
                    url,
                    qs.stringify(data),
                    {
                        headers:{
                            'Content-Type':'application/x-www-form-urlencoded'
                            }
                        }
                    )
                    .then(function(res) {
                        console.log(res.data.showapi_res_body.dataList[0])
                        if (res.data.showapi_res_body.dataList[0].minuteList.length != 0) {
                            var resdata = res.data.showapi_res_body.dataList;
                            //console.log("上证指数", resdata[240].time)
                            console.log("昨日"+resdata[0].yestclose)
                            for (var i = 0; i < 242; i++) { //取昨日收盘价
                                ssci.ssciPreClose[i] = Number(resdata[0].yestclose);
                            };
                            for (var i = 0; i < resdata[0].minuteList.length; i++) {
                                ssci.ssciPrice.push(Number(resdata[0].minuteList[i].nowPrice));
                                ssci.ssciVol.push(Number(resdata[0].minuteList[i].volume));
                                var price = Number(resdata[0].minuteList[i].nowPrice);
                                var yestclose = Number(resdata[0].yestclose);
                                ssci.ssciRise.push((price-yestclose)/yestclose);
                            }
                            console.log("最大值"+Math.max.apply(null,ssci.ssciPrice))
                            console.log("最小值"+Math.min.apply(null,ssci.ssciPrice))
                            ssci.ssciPriceMaxinum = Math.max.apply(null,ssci.ssciPrice);
                            ssci.ssciPriceMininum = Math.min.apply(null,ssci.ssciPrice);
                            //计算分时图四个角的最大值，最小值，最大浮动，最小浮动
                            var maxCut = Math.abs(ssci.ssciPriceMaxinum - Number(resdata[0].yestclose));
                            var minCut = Math.abs(ssci.ssciPriceMininum - Number(resdata[0].yestclose));
                            console.log("max"+maxCut+" "+"min"+minCut)
                            if (maxCut > minCut) {
                                ssci.ssciPriceMax = ssci.ssciPriceMaxinum.toFixed(2);
                                ssci.ssciPriceMin = (Number(resdata[0].yestclose) - maxCut).toFixed(2);
                                ssci.ssciPriceMaxFloat = (maxCut / Number(resdata[0].yestclose) * 100).toFixed(2);
                                ssci.ssciPriceMinFloat = ((-1) * ssci.ssciPriceMaxFloat).toFixed(2);
                            } else {
                                ssci.ssciPriceMax = (Number(resdata[0].yestclose) + minCut).toFixed(2);
                                ssci.ssciPriceMin = (Number(resdata[0].yestclose) - minCut).toFixed(2);
                                ssci.ssciPriceMaxFloat = (minCut / Number(resdata[0].yestclose) * 100).toFixed(2);
                                ssci.ssciPriceMinFloat = ((-1) * ssci.ssciPriceMaxFloat).toFixed(2);
                            }
                            if (callback && typeof callback == "function") {
                                callback(ssci.ssciTime, ssci.ssciPrice, ssci.ssciPriceMax, ssci.ssciPriceMin, ssci.ssciPreClose, ssci.ssciMa, ssci.ssciVol, ssci.ssciRise, ssci.ssciPriceMaxFloat, ssci.ssciPriceMinFloat);
                            }
                        }
                    })
                this.indexFlag = true;
            },
            // 上证指数图的制作
            drawEchartSsci(time, price, max, min, preClose, ma, vol, rise, maxFloat, minFloat) {
                // console.log("绘制上证指数图",this.tabCount[0]);
                var echartsBox = document.getElementById('echartsBox');
                var Ssci = document.getElementById('Ssci');
                //用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
                var resizeSsci = function() {
                    Ssci.style.width = echartsBox.clientWidth + 'px';
                    Ssci.style.height = echartsBox.clientHeight + 'px';
                };
                //设置容器高宽
                resizeSsci();
                // var myChartSsci = echarts.init(document.getElementById("Ssci"));
                var myChartSsci = echarts.init(document.getElementById("Ssci"));
                window.onresize = myChartSsci.resize;
                this.ssciEcharts = myChartSsci;
                preClose = this.ssciPreClose; //赋值，不重新赋值的情况下图形上的数据会消失
                vol = this.ssciVol; //赋值，不重新赋值的情况下图形上的数据会消失
                rise = this.ssciRise; //赋值，不重新赋值的情况下图形上的数据会消失
                time = this.timeArray;
                this.ssciOption = {
                    animation: false,
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: '#fff',
                        textStyle: {
                            fontWeight: 'lighter',
                            fontSize: 10,
                            color: '#8c8989'
                        },
                        transitionDuration: 0,
                        position(pos, params, dom, rect, size) {
                            // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                            var obj = {
                                top: '56%'
                            };
                            // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                            return obj;
                        },
                        formatter(params) {
                            if (params.length == 3) {
                                if (params[0].seriesName == '现价') {
                                    params[2].value = params[2].value / 100
                                    if (params[2].value > 100000000) {
                                    params[2].value = (params[2].value / 100000000).toFixed(2) + '亿'
                                    } else if (params[2].value > 10000) {
                                    params[2].value = (params[2].value / 10000).toFixed(2) + '万'
                                    } else {
                                    params[2].value = Math.ceil(params[2].value)
                                    }
                                    var res = '<div style = ' + 'width:100%;font-Size:0.6rem;' + '>时间：' + params[0].axisValue;
                                    res += '&nbsp;&nbsp;&nbsp;现价：';
                                    res += params[0].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;昨收：';
                                    res += params[1].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;成交量：';
                                    res += params[2].value;
                                    res += '</div>';
                                    return res;
                                } else if (params[0].seriesName == '成交量') {
                                    params[0].value = params[0].value / 100
                                    if (params[0].value > 100000000) {
                                    params[0].value = (params[0].value / 100000000).toFixed(2) + '亿'
                                    } else if (params[0].value > 10000) {
                                    params[0].value = (params[0].value / 10000).toFixed(2) + '万'
                                    } else {
                                    params[0].value = Math.ceil(params[0].value)
                                    }
                                    var res = '<div style = ' + 'width:100%;font-Size:0.6rem;' + '>时间：' + params[0].axisValue;
                                    res += '&nbsp;&nbsp;&nbsp;现价：';
                                    res += params[1].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;昨收：';
                                    res += params[2].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;成交量：';
                                    res += params[0].value;
                                    res += '</div>';
                                    return res;
                                }
                            } else {
                                return
                            }
                        },
                        axisPointer: {
                            type: 'cross',
                            snap: true,
                            crossStyle: {
                                type: 'solid'
                            },
                        }
                    },
                    axisPointer: {
                        link: {
                            xAxisIndex: 'all'
                        },
                    },
                    grid: [{
                        left: '1%',
                        right: '1%',
                        top: 0,
                        height: '55%',
                    }, {
                        left: '1%',
                        right: '1%',
                        top: '56.5%',
                        height: '35%'
                    }],
                    xAxis: [{
                        splitLine: {　　　　
                            show: true,
                            lineStyle: {
                                color: '#ccc',
                                width: 0.5
                            }　　　
                        },
                        type: 'category',
                        data: time,

                        axisTick: {
                            show: false,
                        },
                        margin: 15,
                        // 'axisLabel': {
                        //     'interval': 60,
                        // },
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: "#ccc",
                                width: 0.5,
                            }
                        },
                        axisPointer: {
                            label: {
                                show: false
                            }
                        },
                        axisLabel: {
                            show: false,
                            interval: 60,
                        }
                    }, {
                        type: 'category',
                        gridIndex: 1,
                        data: time,
                        scale: true,
                        boundaryGap: false,
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        splitNumber: 20,
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }],
                    yAxis: [{
                        show: false,
                        type: 'value',
                        splitNumber: 2,
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisLabel: {
                            show: false,
                            formatter: '{value}\n',
                            inside: true,
                            length: 20,
                            interval: 1
                        },
                        position: 'left',
                        max: max,
                        min: min,
                        silent: true,
                        scale: true,
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }, {
                        scale: true,
                        gridIndex: 1,
                        splitNumber: 2,
                        axisLabel: {
                            show: false
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }],
                    graphic: [{
                        type: 'text',
                        right: 'right',
                        top: 'top',
                        style: {
                            text: maxFloat + '%',
                            fill: '#ec0000',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    },{
                        type: 'text',
                        right: 'right',
                        bottom: '45%',
                        style: {
                            text: minFloat + '%',
                            fill: '#00da3c',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    },
                    {
                        type: 'text',
                        left: 'left',
                        top: 'top',
                        style: {
                            text: max,
                            fill: '#ec0000',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    },
                    {
                        type: 'text',
                        left: 'left',
                        bottom: '45%',
                        style: {
                            text: min,
                            fill: '#00da3c',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    },{
                        type: 'text',
                        left: 'left',
                        bottom: '69%',
                        style: {
                            text: preClose[0].toFixed(2),
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: '1%',
                        bottom: '37%',
                        style: {
                            text: '9:30',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'center',
                        bottom: '37%',
                        style: {
                            text: '11:30/13:00',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        right: '1%',
                        bottom: '37%',
                        style: {
                            text: '15:00',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }],
                    series: [{
                        name: '现价',
                        type: 'line',
                        animation: false,
                        symbol: "none",
                        stack: '',
                        smooth: true,
                        showSymbol: false,
                        data: price,
                        lineStyle: {
                            normal: {
                                color: 'rgba(36,137,232,0.5)',
                                width: 1
                            }
                        },
                    }, {
                        name: '昨收',
                        type: 'line',
                        animation: false,
                        symbol: "none",
                        stack: '',
                        smooth: true,
                        showSymbol: false,
                        data: preClose,
                        itemStyle: {
                            normal: {
                                // color: '#ccc'
                            }
                        },
                        lineStyle: {
                            normal: {
                                type: 'dashed',
                                color: '#ccc',
                                width: 1
                            }
                        },
                    }, {
                        name: '成交量',
                        type: 'bar',
                        animation: false,
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: vol,
                        itemStyle: {
                            normal: {
                                color(vol) {
                                    var ssciColorList = [];
                                    for (var i = 0; i < rise.length; i++) {
                                        if (rise[i] > 0) {
                                            ssciColorList.push('#ec0000')
                                        } else {
                                            ssciColorList.push('#00da3c')
                                        }
                                    }
                                    return ssciColorList[vol.dataIndex]
                                }
                            }
                        }
                    }]
                };
                myChartSsci.setOption(this.ssciOption);
                window.onresize = function() {
                    resizeSsci();
                    myChartSsci.resize();
                }
            },
            // 深证指数分时数据
            getSzidata(callback) {
                this.indexFlag = false;
                var szi = this;
                szi.sziTime = [];
                szi.sziPrice = [];
                szi.sziVol = [];
                szi.sziRise = [];
                var url = 'http://route.showapi.com/131-51';
                var data = {
                    "showapi_timestamp": formatterDateTime,
                    "showapi_appid": '85473', //这里需要改成自己的appid
                    "showapi_sign": '95c0a5096275453e8035871c43ddd5cd',  //这里需要改成自己的应用的密钥secret
                    "code":"399001",
                }
                axios.post(
                    url,
                    qs.stringify(data),
                    {
                        headers:{
                            'Content-Type':'application/x-www-form-urlencoded'
                            }
                        }
                    )
                    .then(function(res) {
                        // console.log("进入深证指数");
                        if (res.data.showapi_res_body.dataList[0].minuteList.length != 0) {
                            var resdata = res.data.showapi_res_body.dataList;
                            //console.log("深证指数", resdata)
                            for (var i = 0; i < 242; i++) { //取昨日收盘价
                                szi.sziPreClose[i] = Number(resdata[0].yestclose);
                            };
                            for (var i = 0; i < resdata[0].minuteList.length; i++) {
                                //szi.sziTime.push(resdata[i].time);
                                //console.log("时间"+szi.sziTime)
                                szi.sziPrice.push(Number(resdata[0].minuteList[i].nowPrice));
                                szi.sziVol.push(Number(resdata[0].minuteList[i].volume));
                                var price = Number(resdata[0].minuteList[i].nowPrice);
                                var yestclose = Number(resdata[0].yestclose);
                                szi.sziRise.push((price-yestclose)/yestclose);
                            }
                            szi.sziPriceMaxinum = Math.max.apply(null,szi.sziPrice);
                            szi.sziPriceMininum = Math.min.apply(null,szi.sziPrice);
                            // console.log("分时图的时间轴", szi.sziTime);
                            // console.log("分时图的现价price", szi.sziPrice);
                            var maxCut = Math.abs(szi.sziPriceMaxinum - Number(resdata[0].yestclose));
                            var minCut = Math.abs(szi.sziPriceMininum - Number(resdata[0].yestclose))
                            if (maxCut > minCut) {
                                szi.sziPriceMax = szi.sziPriceMaxinum.toFixed(2);
                                szi.sziPriceMin = (Number(resdata[0].yestclose) - maxCut).toFixed(2);
                                szi.sziPriceMaxFloat = (maxCut / Number(resdata[0].yestclose) * 100).toFixed(2);
                                szi.sziPriceMinFloat = ((-1) * szi.sziPriceMaxFloat).toFixed(2);
                            } else {
                                szi.sziPriceMax = (Number(resdata[0].yestclose) + minCut).toFixed(2);
                                szi.sziPriceMin = (Number(resdata[0].yestclose) - minCut).toFixed(2);
                                szi.sziPriceMaxFloat = (minCut / Number(resdata[0].yestclose) * 100).toFixed(2);
                                szi.sziPriceMinFloat = ((-1) * szi.sziPriceMaxFloat).toFixed(2);
                            }
                            if (callback && typeof callback == "function") {
                                callback(szi.sziTime, szi.sziPrice, szi.sziPriceMax, szi.sziPriceMin, szi.sziPreClose, szi.sziMa, szi.sziVol, szi.sziRisegi, szi.sziPriceMaxFloat, szi.sziPriceMinFloat);
                            }
                        }
                    })
                this.indexFlag = true;
            },
            // 深证指数图的制作
            drawEchartSzi(time, price, max, min, preClose, ma, vol, rise, maxFloat, minFloat) {
                // console.log("绘制深证指数图",this.tabCount[1]);
                var Szi = document.getElementById('Szi');
                var echartsBox = document.getElementById('echartsBox');
                //用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
                var resizeSsci = function() {
                    Szi.style.width = echartsBox.clientWidth + 'px';
                    Szi.style.height = echartsBox.clientHeight + 'px';
                };
                //设置容器高宽
                resizeSsci();
                var myChartSzi = echarts.init(document.getElementById("Szi"));
                window.onresize = myChartSzi.resize;
                this.sziEcharts = myChartSzi;
                preClose = this.sziPreClose; //赋值，不重新赋值的情况下图形上的数据会消失
                vol = this.sziVol; //赋值，不重新赋值的情况下图形上的数据会消失
                rise = this.sziRise; //赋值，不重新赋值的情况下图形上的数据会消失
                time = this.timeArray;
                this.sziOption = {
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: '#fff',
                        textStyle: {
                            fontWeight: 'lighter',
                            fontSize: 10,
                            color: '#8c8989'
                        },
                        transitionDuration: 0,
                        position: function(pos, params, dom, rect, size) {
                            // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                            var obj = {
                                top: '56%'
                            };
                            return obj;
                        },
                        formatter: function(params) {
                            // console.log("params",params)
                            if (params.length == 3) {
                                if (params[0].seriesName == '现价') {
                                    params[2].value = params[2].value / 100
                                    if (params[2].value > 100000000) {
                                    params[2].value = (params[2].value / 100000000).toFixed(2) + '亿'
                                    } else if (params[2].value > 10000) {
                                    params[2].value = (params[2].value / 10000).toFixed(2) + '万'
                                    } else {
                                    params[2].value = Math.ceil(params[2].value)
                                    }
                                    var res = '<div style = ' + 'width:100%;font-Size:0.6rem;' + '>时间：' + params[0].axisValue;
                                    res += '&nbsp;&nbsp;&nbsp;现价：';
                                    res += params[0].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;昨收：';
                                    res += params[1].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;成交量：';
                                    res += params[2].value;
                                    res += '</div>';
                                    return res;
                                } else if (params[0].seriesName == '成交量') {
                                    params[0].value = params[0].value / 100
                                    if (params[0].value > 100000000) {
                                    params[0].value = (params[0].value / 100000000).toFixed(2) + '亿'
                                    } else if (params[0].value > 10000) {
                                    params[0].value = (params[0].value / 10000).toFixed(2) + '万'
                                    } else {
                                    params[0].value = Math.ceil(params[0].value)
                                    }
                                    var res = '<div style = ' + 'width:100%;font-Size:0.6rem;' + '>时间：' + params[0].axisValue;
                                    res += '&nbsp;&nbsp;&nbsp;现价：';
                                    res += params[1].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;昨收：';
                                    res += params[2].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;成交量：';
                                    res += params[0].value;
                                    res += '</div>';
                                    return res;
                                }
                            } else {
                                return
                            }
                        },
                        axisPointer: {
                            type: 'cross',
                            snap: true,
                            crossStyle: {
                                type: 'solid'
                            },
                        }
                    },
                    axisPointer: {
                        link: [{
                            xAxisIndex: [0, 1]
                        }]
                    },
                    grid: [{
                        left: '1%',
                        right: '1%',
                        top: 0,
                        height: '55%',
                    }, {
                        left: '1%',
                        right: '1%',
                        top: '56.5%',
                        height: '35%'
                    }],
                    xAxis: [{
                        splitLine: {　　　　
                            show: true,
                            lineStyle: {
                                color: '#ccc',
                                width: 0.5
                            }　　　
                        },
                        type: 'category',
                        data: time,

                        axisTick: {
                            show: false,
                        },
                        margin: 15,
                        // 'axisLabel': {
                        //     'interval': 60,
                        // },
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: "#ccc",
                                width: 0.5,
                            }
                        },
                        axisPointer: {
                            label: {
                                show: false
                            }
                        },
                        axisLabel: {
                            show: false,
                            interval: 60,
                        }
                    }, {
                        type: 'category',
                        gridIndex: 1,
                        data: time,
                        scale: true,
                        boundaryGap: false,
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        splitNumber: 20,
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }],
                    yAxis: [{
                        show: false,
                        type: 'value',
                        splitNumber: 2,
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisLabel: {
                            show: false,
                            formatter: '{value}\n',
                            inside: true,
                            length: 20,
                            interval: 1
                        },
                        position: 'left',
                        max: max,
                        min: min,
                        silent: true,
                        scale: true,
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }, {
                        scale: true,
                        gridIndex: 1,
                        splitNumber: 2,
                        axisLabel: {
                            show: false
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }],
                    graphic: [{
                        type: 'text',
                        right: 'right',
                        top: 'top',
                        style: {
                            text: maxFloat + '%',
                            fill: '#ec0000',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        right: 'right',
                        bottom: '45%',
                        style: {
                            text: minFloat + '%',
                            fill: '#00da3c',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'left',
                        top: 'top',
                        style: {
                            text: max,
                            fill: '#ec0000',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'left',
                        bottom: '45%',
                        style: {
                            text: min,
                            fill: '#00da3c',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'left',
                        bottom: '69%',
                        style: {
                            text: preClose[0].toFixed(2),
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: '1%',
                        bottom: '37%',
                        style: {
                            text: '9:30',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'center',
                        bottom: '37%',
                        style: {
                            text: '11:30/13:00',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        right: '1%',
                        bottom: '37%',
                        style: {
                            text: '15:00',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }],
                    series: [{
                        name: '现价',
                        type: 'line',
                        animation: false,
                        symbol: "none",
                        stack: '',
                        smooth: true,
                        showSymbol: false,
                        data: price,
                        lineStyle: {
                            normal: {
                                color: 'rgba(36,137,232,0.5)',
                                width: 1
                            }
                        },
                    }, {
                        name: '昨收',
                        type: 'line',
                        animation: false,
                        symbol: "none",
                        stack: '',
                        smooth: true,
                        showSymbol: false,
                        data: preClose,
                        itemStyle: {
                            normal: {
                                // color: '#ccc'
                            }
                        },
                        lineStyle: {
                            normal: {
                                type: 'dashed',
                                color: '#ccc',
                                width: 1
                            }
                        },
                    }, {
                        name: '成交量',
                        type: 'bar',
                        animation: false,
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: vol,
                        itemStyle: {
                            normal: {
                                color: function(vol) {
                                    var sziColorList = [];
                                    for (var i = 0; i < rise.length; i++) {
                                        if (rise[i] > 0) {
                                            sziColorList.push('#ec0000')
                                        } else {
                                            sziColorList.push('#00da3c')
                                        }
                                    }
                                    return sziColorList[vol.dataIndex]
                                }
                            }
                        }
                    }]
                };
                myChartSzi.setOption(this.sziOption);
                window.onresize = function() {
                    resizeSsci();
                    myChartSzi.resize();
                }
            },
            // 创业板指数分时数据
            getGidata(callback) {
                this.indexFlag = false;
                var gi = this;
                gi.giTime = [];
                gi.giPrice = [];
                gi.giVol = [];
                gi.giRise = [];
                var url = 'http://route.showapi.com/131-51';
                var data = {
                    "showapi_timestamp": formatterDateTime,
                    "showapi_appid": '85473', //这里需要改成自己的appid
                    "showapi_sign": '95c0a5096275453e8035871c43ddd5cd',  //这里需要改成自己的应用的密钥secret
                    "code":"399006",
                }
                axios.post(
                    url,
                    qs.stringify(data),
                    {
                        headers:{
                            'Content-Type':'application/x-www-form-urlencoded'
                            }
                        }
                    )
                    .then(function(res) {
                        if (res.data.showapi_res_body.dataList[0].minuteList != 0) {
                            var resdata = res.data.showapi_res_body.dataList;
                            // console.log('resdata创业板指数', resdata);
                            //判断没有数据的情况
                            for (var i = 0; i < 240; i++) { //取昨日收盘价,需要以虚线绘制昨日收盘价的折线
                                gi.giPreClose[i] = Number(resdata[0].yestclose);
                            };
                            // console.log('昨收', gi.giPreClose);
                            for (var i = 0; i < resdata[0].minuteList.length; i++) {
                                gi.giPrice.push(Number(resdata[0].minuteList[i].nowPrice));
                                gi.giVol.push(Number(resdata[0].minuteList[i].volume));
                                var price = Number(resdata[0].minuteList[i].nowPrice);
                                var yestclose = Number(resdata[0].yestclose);
                                gi.giRise.push((price-yestclose)/yestclose);
                            }
                            gi.giPriceMaxinum = Math.max.apply(null,gi.giPrice);
                            gi.giPriceMininum = Math.min.apply(null,gi.giPrice);
                            var maxCut = Math.abs(gi.giPriceMaxinum - Number(resdata[0].yestclose));
                            var minCut = Math.abs(gi.giPriceMininum - Number(resdata[0].yestclose))
                            if (maxCut > minCut) {
                                gi.giPriceMax = gi.giPriceMaxinum.toFixed(2);
                                gi.giPriceMin = (Number(resdata[0].yestclose) - maxCut).toFixed(2);
                                gi.giPriceMaxFloat = (maxCut / Number(resdata[0].yestclose) * 100).toFixed(2);
                                gi.giPriceMinFloat = ((-1) * gi.giPriceMaxFloat).toFixed(2);
                            } else {
                                gi.giPriceMax = (Number(resdata[0].yestclose) + minCut).toFixed(2);
                                gi.giPriceMin = (Number(resdata[0].yestclose) - minCut).toFixed(2);
                                gi.giPriceMaxFloat = (minCut / Number(resdata[0].yestclose) * 100).toFixed(2);
                                gi.giPriceMinFloat = ((-1) * gi.giPriceMaxFloat).toFixed(2);
                            }
                            // console.log("时间轴的数据", gi.giTime)
                            if (callback && typeof callback == "function") {
                                callback(gi.giTime, gi.giPrice, gi.giPriceMax, gi.giPriceMin, gi.giPreClose, gi.giMa, gi.giVol, gi.giRise, gi.giPriceMaxFloat, gi.giPriceMinFloat);
                            }
                        }
                    })
                gi.indexFlag = true;
            },
            // 创业板指数图的制作
            drawEchartGi(time, price, max, min, preClose, ma, vol, rise, maxFloat, minFloat) {
                // console.log("绘制创业板指数图",this.tabCount[2]);
                var Gi = document.getElementById('Gi');
                var echartsBox = document.getElementById('echartsBox');
                //用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
                var resizeSsci = function() {
                    Gi.style.width = echartsBox.clientWidth + 'px';
                    Gi.style.height = echartsBox.clientHeight + 'px';
                    // console.log('echarts图前面尺寸的赋值')
                };
                //设置容器高宽
                resizeSsci();
                var myChartGi = echarts.init(document.getElementById("Gi"));
                window.onresize = myChartGi.resize;
                this.giEcharts = myChartGi;
                preClose = this.giPreClose; //赋值，不重新赋值的情况下图形上的数据会消失
                vol = this.giVol; //赋值，不重新赋值的情况下图形上的数据会消失
                rise = this.giRise; //赋值，不重新赋值的情况下图形上的数据会消失
                time = this.timeArray;
                this.giOption = {
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: '#fff',
                        textStyle: {
                            fontWeight: 'lighter',
                            fontSize: 10,
                            color: '#8c8989'
                        },
                        transitionDuration: 0,
                        position: function(pos, params, dom, rect, size) {
                            // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                            var obj = {
                                top: '56%'
                            };
                            // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                            return obj;
                        },
                        // formatter: '时间: {b0}, 昨收: {c0}<br />{b1}: {c1}',
                        formatter: function(params) {
                            console.log(params)
                            if (params.length == 3) {
                                if (params[0].seriesName == '现价') {
                                    params[2].value = params[2].value / 100
                                    if (params[2].value > 100000000) {
                                    params[2].value = (params[2].value / 100000000).toFixed(2) + '亿'
                                    } else if (params[2].value > 10000) {
                                    params[2].value = (params[2].value / 10000).toFixed(2) + '万'
                                    } else {
                                    params[2].value = Math.ceil(params[2].value)
                                    }
                                    var res = '<div style = ' + 'width:100%;font-Size:0.6rem;' + '>时间：' + params[0].axisValue;
                                    res += '&nbsp;&nbsp;&nbsp;现价：';
                                    res += params[0].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;昨收：';
                                    res += params[1].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;成交量：';
                                    res += params[2].value;
                                    res += '</div>';
                                    return res;
                                } else if (params[0].seriesName == '成交量') {
                                    params[0].value = params[0].value / 100
                                    if (params[0].value > 100000000) {
                                    params[0].value = (params[0].value / 100000000).toFixed(2) + '亿'
                                    } else if (params[0].value > 10000) {
                                    params[0].value = (params[0].value / 10000).toFixed(2) + '万'
                                    } else {
                                    params[0].value = Math.ceil(params[0].value)
                                    }
                                    var res = '<div style = ' + 'width:100%;font-Size:0.6rem;' + '>时间：' + params[0].axisValue;
                                    res += '&nbsp;&nbsp;&nbsp;现价：';
                                    res += params[1].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;昨收：';
                                    res += params[2].value.toFixed(2);
                                    res += '&nbsp;&nbsp;&nbsp;成交量：';
                                    res += params[0].value;
                                    res += '</div>';
                                    return res;
                                }
                            } else {
                                return
                            }
                        },
                        axisPointer: {
                            type: 'cross',
                            snap: true,
                            crossStyle: {
                                type: 'solid'
                            },
                        }
                    },
                    axisPointer: {
                        link: [{
                            xAxisIndex: [0, 1]
                        }]
                    },
                    grid: [{
                        left: '1%',
                        right: '1%',
                        top: 0,
                        height: '55%',
                    }, {
                        left: '1%',
                        right: '1%',
                        top: '56.5%',
                        height: '35%'
                    }],
                    xAxis: [{
                        splitLine: {　　　　
                            show: true,
                            lineStyle: {
                                color: '#ccc',
                                width: 0.5
                            }　　　
                        },
                        type: 'category',
                        data: time,

                        axisTick: {
                            show: false,
                        },
                        margin: 15,
                        // 'axisLabel': {
                        //     'interval': 60,
                        // },
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: "#ccc",
                                width: 0.5,
                            }
                        },
                        axisPointer: {
                            label: {
                                show: false
                            }
                        },
                        axisLabel: {
                            show: false,
                            interval: 60,
                        }
                    }, {
                        type: 'category',
                        gridIndex: 1,
                        data: time,
                        scale: true,
                        boundaryGap: false,
                        axisLine: {
                            onZero: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisLabel: {
                            show: false
                        },
                        splitNumber: 20,
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }],
                    yAxis: [{
                        show: false,
                        type: 'value',
                        splitNumber: 2,
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisLabel: {
                            show: false,
                            formatter: '{value}\n',
                            inside: true,
                            length: 20,
                            interval: 1
                        },
                        position: 'left',
                        max: max,
                        min: min,
                        silent: true,
                        scale: true,
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }, {
                        scale: true,
                        gridIndex: 1,
                        splitNumber: 2,
                        axisLabel: {
                            show: false
                        },
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: "#ccc"
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisPointer: {
                            label: {
                                show: false
                            }
                        }
                    }],
                    graphic: [{
                        type: 'text',
                        right: 'right',
                        top: 'top',
                        style: {
                            text: maxFloat + '%',
                            fill: '#ec0000',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        right: 'right',
                        bottom: '45%',
                        style: {
                            text: minFloat + '%',
                            fill: '#00da3c',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'left',
                        top: 'top',
                        style: {
                            text: max,
                            fill: '#ec0000',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'left',
                        bottom: '45%',
                        style: {
                            text: min,
                            fill: '#00da3c',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'left',
                        bottom: '69%',
                        style: {
                            text: preClose[0].toFixed(2),
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: '1%',
                        bottom: '37%',
                        style: {
                            text: '9:30',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        left: 'center',
                        bottom: '37%',
                        style: {
                            text: '11:30/13:00',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }, {
                        type: 'text',
                        right: '1%',
                        bottom: '37%',
                        style: {
                            text: '15:00',
                            fill: '#ccc',
                            font: ' 0.8em "Open Sans",PingFangSC-Regular'
                        }
                    }],
                    series: [{
                        name: '现价',
                        type: 'line',
                        animation: false,
                        symbol: "none",
                        stack: '',
                        smooth: true,
                        showSymbol: false,
                        data: price,
                        lineStyle: {
                            normal: {
                                color: 'rgba(36,137,232,0.5)',
                                width: 1
                            }
                        },
                    }, {
                        name: '昨收',
                        type: 'line',
                        animation: false,
                        symbol: "none",
                        stack: '',
                        smooth: true,
                        showSymbol: false,
                        data: preClose,
                        itemStyle: {
                            normal: {
                                // color: '#ccc'
                            }
                        },
                        lineStyle: {
                            normal: {
                                type: 'dashed',
                                color: '#ccc',
                                width: 1
                            }
                        },
                    }, {
                        name: '成交量',
                        type: 'bar',
                        animation: false,
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: vol,
                        itemStyle: {
                            normal: {
                                color: function(vol) {
                                    var giColorList = [];
                                    for (var i = 0; i < rise.length; i++) {
                                        if (rise[i] > 0) {
                                            giColorList.push('#ec0000')
                                        } else {
                                            giColorList.push('#00da3c')
                                        }
                                    }
                                    // return console.log("=============",giColorList);
                                    return giColorList[vol.dataIndex]
                                }
                            }
                        }
                    }]
                };
                myChartGi.setOption(this.giOption);
                // window.onresize = myChartGi.resize;
                window.onresize = function() {
                    // console.log('echarts图前面尺寸的赋值')
                    resizeSsci();
                    myChartGi.resize();
                }
            },
            shangzhenSelected() { //点击上证指数时，显示分时图
                if (this.indexFlag) {
                    this.indexShow = true;
                    this.selected = '1';
                    // console.log(this.selected);
                    if (this.tabCount[0] < 1) {
                        this.tabCount[0]++;
                        this.getSscidata(this.drawEchartSsci);
                    } else {
                        console.log("点击第二次")
                    }
                }
            },
            shenzhengSelected() { //点击深证指数时，显示分时图
                if (this.indexFlag) {
                    this.indexShow = true;
                    this.selected = '2';
                    // console.log(this.selected);
                    if (this.tabCount[1] < 1) {
                        this.tabCount[1]++;
                        this.getSzidata(this.drawEchartSzi);
                    } else {
                        console.log("深证多次点击")
                    }
                }
            },
            chuangyeSelected() { //点击创业指数时，显示分时图
                if (this.indexFlag) {
                    this.indexShow = true;
                    this.selected = '3';
                    // console.log(this.selected);
                    if (this.tabCount[2] < 1) {
                        this.tabCount[2]++;
                        this.getGidata(this.drawEchartGi);
                    } else {
                        console.log('创业板多次点击')
                    }
                }
            },
            forTime(hour, startMinutes, endMinutes) { //获取分时图x轴上的时间
                // this.timeArray = [];
                for (var i = startMinutes; i <= endMinutes; i++) {
                    var timeStr = hour + ":" + (i < 10 ? ("0" + i) : i)
                    this.timeArray.push(timeStr)
                }
            }  // return this.timeArray
        },

        
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

.home {
    position: relative;
    background-color: #fff;
    .home_padding {
        padding: 0 0.9375rem;
    }
    .home_content {
        padding-top: 2.5rem;
        padding-bottom: 3.5625rem;
        min-height: 100vh;
        z-index: 20;
        position: relative;
        width: 100%;
        .index_list {
            width: 100%;
            padding: 0.2rem;
            box-sizing: border-box;
            li {
                float: left;
                width: 33%;
                height: 3.4375rem;
                text-align: center;
                padding-bottom: 0.5rem;
                margin-right: 0.04rem;
                &:nth-child(3) .price{
                    border: none;
                }
                .price {
                    font-size: 1.125rem;
                    /* color: #FF363F; */
                    line-height: 1.6rem;
                    margin-top: 0.3rem;
                    border-right: 1px solid #eaeaea;
                }
                .under {
                    margin-top: 0.4rem;
                }
                .name {
                    font-size: 0.75rem;
                    color: #505050;
                    line-height: 0.75rem;
                    margin-right: 0.453rem;
                }
                .extent {
                    font-size: 0.75rem;
                    line-height: 0.75rem;
                    margin-left: 0.453rem;
                }
            }
        }
        .home_index{
            position: relative;
            .index_picture {
                display: inline-block;
                width: 1rem;
                height: 0.5625rem;
                position: absolute;
                right: 0.4rem;
                top: 1.875rem;
                background-repeat: no-repeat;
                background-size: 50%;
            }
            .originalBackground {
                background: url("../../assets/icon_down.svg");
                background-repeat: no-repeat;
                background-size: 50%;
            }
            .changeBackground {
                background: url("../../assets/icon_up.svg");
                background-repeat: no-repeat;
                background-size: 50%;
            }
            .index_model {
                width: 100%;
                height: 9.40625rem;
            }
            .mint-navbar {
                margin-top: 0;
                height: 4px;
                background-color: #fff;
                .mint-tab-item.is-selected {
                    border-top: 3px solid #26a2ff;
                    border-bottom: none;
                }
            }
            .mint-tab-container-item {
                border-top: 1px solid #f0f0f0;
            }
        }
        .haveIndexPicture {
            margin-bottom: 17rem;
            padding-bottom: 17rem;
        }
        .cjnews{
            padding-top:0.5rem;
            text-align:center;
            padding-bottom:0.5rem;
            border-bottom:0.0625rem solid #eee;
            border-top:0.0625rem solid #eee;
        }
    }
}
.color_red {
    color: #FF363F;
}
.color_green {
    color: #1CCE18;
}
/*轮播图样式*/
img {
    width: 100%;
 }

.mint-swipe {
    height: 10rem;
 }

.desc {
    font-weight: 600;
    opacity: .9;
    padding: 0.3rem;
    height: 1.25rem;
    line-height: 1.25rem;
    width: 100%;
    color: #fff;
    position: absolute;
    bottom: 0.5rem;
 }
</style>