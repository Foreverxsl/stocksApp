<template>
    <div class="stocksDetails">
        <headerBack :title="title"></headerBack>
        <!-- 基本信息展示 -->
        <div class="message">
            <ul class="clearfix">
                <li><span :class="baseData[0] > baseData[9]? 'risered':'downgreen'">{{baseData[0]}}</span>
                    <span :class="baseData[1] > 0? 'risered':'downgreen'">{{baseData[1]}}</span>
                    <span :class="baseData[2] > 0? 'risered':'downgreen'">[{{baseData[2]}}%]</span></li>
                <li><span>今开: </span><span :class="baseData[3] > baseData[9]? 'risered':'downgreen'">{{baseData[3]}}</span></li>
                <li><span>最高: </span><span :class="baseData[4] > baseData[9]? 'risered':'downgreen'">{{baseData[4]}}</span></li>
                <li><span>最低: </span><span :class="baseData[7] > baseData[9]? 'risered':'downgreen'">{{baseData[7]}}</span></li>
                <li><span>昨收: </span><span>{{baseData[9]}}</span></li>
                <li><span>成交量: </span><span>{{baseData[6]}}</span></li>
                <li><span>振幅: </span><span>{{baseData[8]}}%</span></li>
            </ul>
        </div>
        <!-- 更多信息展示 -->
        <!-- 分时/周k/月k/日k/分钟图 -->
        <div class="echarts">
            <div class="echarts-header">
                <mt-navbar v-model="selected">
                    <mt-tab-item id="1">分时</mt-tab-item>
                    <mt-tab-item id="2">日k</mt-tab-item>
                    <mt-tab-item id="3">周k</mt-tab-item>
                    <mt-tab-item id="4">月k</mt-tab-item>
                </mt-navbar>
                <!-- tab-container -->
                <mt-tab-container v-model="selected">
                    <mt-tab-container-item id="1">
                        <div id="main" style="height:18rem;" class="tab_nav"></div> 
                    </mt-tab-container-item>
                    <mt-tab-container-item id="2">
                        <div style="padding: 12px 4px 12px 0;" v-if="dayreslength==0 ||dayreslength =='' ">
                            <img style="width: 104%;height:16.8rem;margin-left:-0.75rem" :src="dayPic" />
                        </div>
                        <div id="dayk" style="height:18rem;" class="tab_nav" v-else></div>
                    </mt-tab-container-item>
                    <mt-tab-container-item id="3">
                        <div style="padding: 12px 4px 12px 0;" v-if="weekreslength==0 ||weekreslength =='' ">
                            <img style="width: 104%;height:16.8rem;margin-left:-0.75rem" :src="weekPic" />
                        </div>
                        <div id="weekk" style="height:18rem;" class="tab_nav" v-else></div>
                    </mt-tab-container-item>
                    <mt-tab-container-item id="4">
                        <div style="padding: 12px 4px 12px 0;" v-if="monthreslength==0 ||monthreslength =='' ">
                            <img style="width: 104%;height:16.8rem;margin-left:-0.75rem" :src="monthPic" />
                        </div>
                        <div id="mouthsk" style="height:18rem;" class="tab_nav" v-else></div>
                    </mt-tab-container-item>
                </mt-tab-container>
            </div>
            <!-- <div id="echatrsZhu" style="width: 100%;height: 4.7rem;border-top: 1px solid #ececec;"></div> -->
        </div>
        <div class="zixuangu" @click="addStock()" v-if="isShow==false && username">
            <span class="add_icon"></span>添加自选股
        </div>
        <div class="zixuangu" @click="deleteStock()" v-if="isShow==true && username">
            <span class="del_icon"></span>删除自选股
        </div>
        <!-- 遮罩 -->
        <div class="stockMack" v-show="isshow == true"></div>
        <div class="cjnews">
            <p v-if="isZQ">证券要闻</p>
            <p v-else>股票资讯</p>
        </div> 
        <stockNews :name="urlName"></stockNews>
    </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import formatterDateTime from '../utils/utils'
import qs from 'qs'
// 引入选择时间的操作表 从下方拉出
import {
    Navbar,
    TabItem
} from 'mint-ui'

// 引入头部组件
import headerBack from './headerBack'
import stockNews from './stockNews'
// 引入eacharts 挂在vue原型链上
import echarts from 'echarts'
Vue.prototype.$echarts = echarts
Vue.component(Navbar.name, Navbar)
Vue.component(TabItem.name, TabItem)
export default {
    name: 'stocksDetails',
    data () {
        return {
            tabNum: false,
            urlCode: '', // 股票代码
            urlName: decodeURIComponent(window.location.href.split('=')[2]), // 股票名字
            title: '', // 顶部的标题
            dayPic: `http://image.sinajs.cn/newchart/daily/n/${window.location.href.split('=')[1].split('&')[0]}.gif`,
            weekPic: `http://image.sinajs.cn/newchart/weekly/n/${window.location.href.split('=')[1].split('&')[0]}.gif`,
            monthPic: `http://image.sinajs.cn/newchart/monthly/n/${window.location.href.split('=')[1].split('&')[0]}.gif`,
            baseData: [],
            isshow: false, // 隐藏显示的控制
            dateTime6: '',
            selected: '1', // tab默认选择第一个
            totalDate: '', // 作为时间的入参
            giTime: [], // 分时时间轴数据
            giPrice: [], // 分时price数据
            giPriceMax: [], // 分时的最大值数据
            giPriceMin: [], // 分时的最小值数据
            oldTime: '', // 分时上一次数据推送的时间
            giPreClose: [], // 分时上一交易日的收盘价
            giMa: [], // 分时上的ma
            giVol: [], // 分时的成交量
            giRise: [], // 分时的涨跌幅
            giPriceMaxFloat: [], // 分时的最大值数据的涨幅
            giPriceMinFloat: [], // 分时的最小值数据的涨幅
            giRisePrice: [], // 联动时需要的涨跌数据
            timeArray: [],
            weekkdata: [], // 周ky轴的数据
            weekkTime: [], // 周k x时间轴数据
            weekkMa5: [], // 周k 5日均线数据
            weekkMa10: [], // 周k 10日均线数据
            weekkMa20: [], // 周k 20日均线数据
            weekkMa30: [], // 周k 30日均线数据
            weekkVol: [], // 周k 成交量数据
            weekkRise: [], // 周k 振幅数据
            weekmax: '', // 周k的最大值
            weekmin: '', // 周k的最小值
            weekava: '',
            daykData: [], // 日k y轴的数据
            daykTime: [], // 日k x轴的数据
            daykMa5: [], // 日k 5日均线
            daykMa10: [], // 日k 10日均线
            daykMa20: [], // 日k 20日均线
            daykMa30: [], // 日k 30日均线
            daykVol: [], // 日k 成交量数据
            daykMax: [], // 日k 最大值
            daykMin: [], // 日k 最小值
            daymax: '', // 日k最大值
            daymin: '', // 日k最小值
            daykRise: [], // 日k 振幅数据
            dayava: '',
            monthkData: [], // 月k y轴的数据
            monthkTime: [], // 月k x轴的数据
            monthkMa5: [], // 月k  5日均线数据
            monthkMa10: [], // 月k  10日均线数据
            monthkMa20: [], // 月k  20日均线数据
            monthkMa30: [], // 月k  30日均线数据
            monthkVol: [], // 月k 成交量数据
            monthkRise: [], // 月k 振幅数据
            monthmax: 0, // 月k的最大值
            monthmin: 0, // 月k的最小值
            monthava: [],
            tabCount: [0, 0, 0, 0, 0],
            // cancelText: "取消"
            isShow: false, // 判断是显示添加股票还是删除股票
            telphone: sessionStorage.username, //获取用户名
            selfStock: JSON.parse(localStorage.getItem(sessionStorage.username)), // 取自选股列表的数据，为判断显示“添加自选股”or“删除自选股”
            ParticularsData: [], // 明细
            dealData1: [], // 分时图成交量数据 1
            dealData2: [], // 分时图成交量数据 2
            dealTime: [], // 分时图成交量时间轴
            flag: false,
            // 基本信息的中介保存数据容器 记录数据的功能避免反复请求基本信息接口
            touchPrice: '', // 触摸结束后还原价格
            touchOpen: '', // 触摸结束后还原开盘价
            touchHigh: '', // 触摸结束后还原最高价
            touchLow: '', // 触摸结束后还原最低价  
            touchRise: '', // 触摸结束后还原涨幅   
            touchrisePrice: '', // 触摸结束后还原涨跌  
            touchAmt: '', // 触摸结束后还原成交额
            touchTurnover: '', // 触摸结束后还原换手
            touchVolRatio: '', // 触摸结束还原量比
            myChartGi: '', // 分时图的实例化对象
            giOption: '', // 分时图option
            mychartDay: '', // 日k图的实例化对象
            dayOption: '', // 日k图option
            mychartWeek: '', // 周k图的实例化对象
            weekOption: '', // 周k图option
            mychartMonth: '', // 月k图的实例化对象
            monthOption: '', // 月k图option
            width: '', // 屏幕的宽度   
            dayreslength: '', // 记录日k历史数据的长度 
            monthreslength: '', // 记录月k历史数据的长度
            weekreslength: '', // 记录周k历史数据的长度
            tit: 'pre' // 默认选择不复权   控制复权的类型
        }
    },
    mounted: function () {
        // 获取基本数据
        this.getbaseData()
        // 日k的数据获取
        this.getdaykData(this.tit)
        // 周k的数据的获取
        this.getWeekkdata(this.tit)
        // 月k数据的获取
        this.getmonthkData(this.tit)
        // 获取url参数
        this.getUrldata()
        // 确定页面显示“添加自选股”还是“删除自选股”
        this.cutDown()
        // this.drawEchartsminutesk()
    },
    components: {
        headerBack,
        stockNews
    }, 
    watch: {
        // 监视tab栏切换到分钟的时候 让下方的分钟选择出来  切换到不同的tab栏 调出echart
        selected: function (val, oldVal) {
            if (val === '1' && this.tabCount[0] < 1) {
                this.tabCount[0]++
            }
            if (val === '2' && this.tabCount[1] < 1) {
                this.tabCount[1]++
            }
            if (val === '3' && this.tabCount[2] < 1) {
                this.tabCount[2]++
            }
            if (val === '4' && this.tabCount[3] < 1) {
                this.tabCount[3]++
            }
            if (val === '1') {
                this.tabNum = false
                this.currentVal = 1
            }
            if (val === '2') {
                this.tabNum = false
                this.currentVal = 2
                this.getdaykData(this.tit, this.drawEchartsdayk)
            }
            if (val === '3') {
                this.tabNum = false
                this.currentVal = 3
                this.getWeekkdata(this.tit, this.drawEchartsweekk)
            }
            if (val === '4') {
                this.tabNum = false
                this.currentVal = 4
                this.getmonthkData(this.tit, this.drawEchartsmonthk)
            }
        }
    },
    computed: {
        isZQ() {
            if(this.urlCode =='sh000001' || this.urlCode =='sz399001' || this.urlCode =='sz399006' ||
               this.urlCode =='sh000300' || this.urlCode =='sh000016' || this.urlCode =='sh000905'){
                   return true
               } else {
                   return false
               }
        },
        username() {
            if(sessionStorage.username) {
                return true
            }else{
                return false
            }
        }
    },
    methods: {  
        forTime: function (hour, startMinutes, endMinutes) {
            // this.timeArray = [];
            for (var i = startMinutes; i <= endMinutes; i++) {
                var timeStr = hour + ':' + (i < 10 ? ('0' + i) : i)
                this.timeArray.push(timeStr)
            }
            // return this.timeArray
        },
        getUrldata: function () {
            var url = window.location.href.split('=')
            this.urlCode = url[1].split('&')[0]
            this.title = this.urlName + '(' + this.urlCode.slice(2) + ')'
            var day = new Date()
            var year = day.getFullYear() // 得到年份
            var month = day.getMonth() + 1 // 得到月份
            var date = day.getDate() // 得到日期
            if (month < 10) {
                month = '0' + month
            }
            if (date < 10) {
                date = '0' + date
            }
            this.totalDate = '' + year + month + date
        },
        // 点击按钮 下拉的按钮消失
        showMore: function () {
            this.isshow = !this.isshow
        },
        // 点击按钮 上拉的按钮消失
        hideMore: function () {
            this.isshow = !this.isshow
        },
        // 绑定分钟点击按钮 让下方的分钟选择出来
        // 个股详情基本信息的获取
        getbaseData: function (callback) {
            var base = this
            base.getUrldata()
            // console.log(base.tit);
            // 分时图时间time的初始化
            var hoursList = [{
                'hour': '09',
                'startMinutes': '30',
                'endMinutes': '59'
            }, {
                'hour': '10',
                'startMinutes': '0',
                'endMinutes': '59'
            }, {
                'hour': '11',
                'startMinutes': '0',
                'endMinutes': '30'
            }, {
                'hour': '13',
                'startMinutes': '0',
                'endMinutes': '59'
            }, {
                'hour': '14',
                'startMinutes': '0',
                'endMinutes': '59'
            }, {
                'hour': '15',
                'startMinutes': '0',
                'endMinutes': '0'
            }]
            // var minutesList = []
            for (var i = 0; i < hoursList.length; i++) {
                base.forTime(hoursList[i].hour, hoursList[i].startMinutes, hoursList[i].endMinutes)
            };
            var url = "";
            var changedata = {}
            var dpStocks = JSON.parse(localStorage.dpstocks)  
            var index= []
            //console.log(dpStocks)
            for(var i =0; i < dpStocks.length; i++){
                if(dpStocks[i].market+dpStocks[i].code == this.urlCode){
                    index = [dpStocks[i]]
                    //console.log(index)              
                }
                //console.log(url)
            }
            // http请求
            if(index.length == 1) {
                url = 'http://route.showapi.com/131-45'
            } else {
                url = 'http://route.showapi.com/131-46'
            }
            var data = {
                "showapi_timestamp": formatterDateTime,
                "showapi_appid": '85473', //这里需要改成自己的appid
                "showapi_sign": '95c0a5096275453e8035871c43ddd5cd',  //这里需要改成自己的应用的密钥secret
                "stocks": this.urlCode.slice(2)
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
                .then(function (res) {
                    if(url ==  'http://route.showapi.com/131-45') {
                        changedata = res.data.showapi_res_body.indexList[0]
                        changedata.open =  Number(changedata.todayOpenPrice).toFixed(2)
                    } else {
                        changedata = res.data.showapi_res_body.list[0]
                        changedata.open =  Number(changedata.openPrice).toFixed(2)                    
                    }

                    if (Number(changedata.tradeNum) > 100000000) {
                        changedata.tradeNum = (Number(changedata.tradeNum) / 10000000000).toFixed(2) + '亿手'
                    } else if (Number(changedata.tradeNum) > 10000) {
                        changedata.tradeNum = (Number(changedata.tradeNum) / 1000000).toFixed(2) + '万手'
                    }
                    changedata.nowPrice = Number(changedata.nowPrice).toFixed(2)
                    changedata.diff_money = Number(changedata.diff_money).toFixed(2)
                    changedata.diff_rate = Number(changedata.diff_rate).toFixed(2)
                    changedata.yestodayClosePrice =  Number(changedata.yestodayClosePrice).toFixed(2)
                    changedata.todayMax = Number(changedata.todayMax).toFixed(2)
                    changedata.turnover = Number(changedata.turnover).toFixed(2)
                    changedata.todayMin = Number(changedata.todayMin).toFixed(2)
                    changedata.volRatio = Number(changedata.swing).toFixed(2)
                    console.log(changedata)
                        // 分时图未实例化之前 对分时的这块进行占位 防止样式紊乱
                    base.width = document.body.clientWidth
                    document.getElementById('main').style.width = 1 * base.width + 'px'
                    // 分时图
                    base.getShare(base.drawEchartShare)
                    // 记录touch事件之前的最近的数据
                    base.touchPrice = changedata.nowPrice // 触摸结束后还原价格
                    base.touchOpen = changedata.open // 触摸结束后还原开盘价
                    base.touchHigh = changedata.todayMax // 触摸结束后还原最高价
                    base.touchLow = changedata.todayMin // 触摸结束后还原最低价 
                    base.touchRise = changedata.diff_rate // 触摸结束后还原涨幅
                    base.touchrisePrice = changedata.diff_money // 触摸结束后还原涨跌  
                    base.touchAmt = changedata.tradeNum // 触摸结束后还原成交额
                    base.touchTurnover = changedata.turnover // 触摸结束后还原换手
                    base.touchVolRatio = changedata.volRatio // 触摸结束还原量比
                    base.baseData = [changedata.nowPrice, changedata.diff_money, changedata.diff_rate, changedata.open, changedata.todayMax, changedata.turnover, changedata.tradeNum, changedata.todayMin, changedata.volRatio,changedata.yestodayClosePrice]
                })
            // 监听如果屏幕滑动结束 重新调用请求基本信息的接口
            document.addEventListener('touchend', function (e) {
                // base.getbaseData();
                // 如果触摸的目标是canvas对象 那么则重置基本信息数据
                // console.log(e.target.tagName == "CANVAS");
                /*if (e.target.tagName === 'CANVAS') {
                    // base.getbaseData();
                    // 把最近的记录的数据重新还原到页面中
                    // console.log([base.touchPrice,base.touchOpen,base.touchHigh,base.touchLow]);
                    Vue.set(base.baseData, 0, base.touchPrice)
                    Vue.set(base.baseData, 3, base.touchOpen)
                    Vue.set(base.baseData, 4, base.touchHigh)
                    Vue.set(base.baseData, 7, base.touchLow)
                    Vue.set(base.baseData, 2, base.touchRise)
                    Vue.set(base.baseData, 1, base.touchrisePrice)
                    Vue.set(base.baseData, 5, base.touchTurnover)
                    Vue.set(base.baseData, 6, base.touchAmt)
                    Vue.set(base.baseData, 8, base.touchVolRatio)
                    base.flag = false
                }*/
            })
            // 监听如果屏幕滑动过程中  那么让基本信息的推送结束掉
            document.addEventListener('touchmove', function (e) {
                // console.log(e.target.tagName == "CANVAS");
                if (e.target.tagName === 'CANVAS') {
                    base.flag = true
                }
            })
        },
        // 日k图数据
        getdaykData: function (tit,callback) {
            var weekk = this
            // console.log(tit);
            weekk.getUrldata()
            weekk.daykMa5 = []
            weekk.daykMa10 = []
            weekk.daykMa20 = []
            weekk.daykMa30 = []
            weekk.daykVol = []
            weekk.daykRise = []
            weekk.daykData = []
            weekk.daykTime = []
            weekk.daymax = ''
            weekk.daymin = ''
            weekk.dayava = ''
            axios({
                    url: 'http://101.231.93.232:14014/latestData/getKlineData',
                    method: 'POST',
                    data: {
                        'stkcode': weekk.urlCode,
                        'xdxrType': tit,
                        'period': 'day',
                        'time': weekk.totalDate,
                        'num': 50
                    }
                })
                .then(function (res) {                
                    var resdata = res.data.result
                    var reslength = resdata.length
                    //console.log("日K",reslength)
                    weekk.dayreslength = reslength
                    if(reslength === 0){
                        weekk.daymax = 0
                        weekk.daymin = 0
                    }else{
                        weekk.daymax = resdata[0].high
                        weekk.daymin = resdata[0].low
                    }                  
                    // console.log('日k数据', res)
                    for (var i = 0; i < resdata.length; i++) {
                        // 开盘，收盘，最低，最高
                        if (resdata[i].ma5 === 0) {
                            resdata[i].ma5 = ''
                        }
                        if (resdata[i].ma10 === 0) {
                            resdata[i].ma10 = ''
                        }
                        if (resdata[i].ma20 === 0) {
                            resdata[i].ma20 = ''
                        }
                        if (resdata[i].ma30 === 0) {
                            resdata[i].ma30 = ''
                        }
                        if (weekk.daymax - resdata[i].high < 0) {
                            weekk.daymax = resdata[i].high
                        }
                        if (weekk.daymin - resdata[i].low > 0) {
                            weekk.daymin = resdata[i].low
                        }
                        resdata[i].rise = (resdata[i].rise).toFixed(2)
                        resdata[i].open = (resdata[i].open).toFixed(2)
                        resdata[i].price = (resdata[i].price).toFixed(2)
                        resdata[i].low = (resdata[i].low).toFixed(2)
                        resdata[i].high = (resdata[i].high).toFixed(2)
                        weekk.daykData.push([resdata[i].open, resdata[i].price, resdata[i].low, resdata[i].high])
                        weekk.daykTime.push(resdata[i].time.split(' ')[0])
                        weekk.daykMa5.push(resdata[i].ma5)
                        weekk.daykMa10.push(resdata[i].ma10)
                        weekk.daykMa20.push(resdata[i].ma20)
                        weekk.daykMa30.push(resdata[i].ma30)
                        weekk.daykVol.push(resdata[i].vol)
                        weekk.daykRise.push(resdata[i].rise)
                    }
                    weekk.daymax = weekk.daymax.toFixed(2)
                    weekk.dayava = (Number(weekk.daymax)+weekk.daymin).toFixed(2)/2
                   // console.log('日K时间',weekk.dayava)
                    // 处理新股条件下少于50条的情况下对x轴进行处理
                    if (weekk.daykTime.length < 50) {
                        // console.log(weekk.daykTime.length);
                        for (var k = weekk.daykTime.length; k < 50; k++) {
                            weekk.daykTime[k] = ''
                        }
                    }
                    // console.log(weekk.daykData)
                    // console.log(callback)
                    if (callback && typeof callback === 'function') {
                            callback()
                        }
                })
        },
        // 周k图数据
        getWeekkdata: function (tit,callback) {
            var weekk = this
            weekk.getUrldata()
            weekk.weekkdata = []
            weekk.weekkTime = []
            weekk.weekkMa5 = []
            weekk.weekkMa10 = []
            weekk.weekkMa20 = []
            weekk.weekkMa30 = []
            weekk.weekkVol = []
            weekk.weekmax = ''
            weekk.weekmin = ''
            weekk.weekkRise = []
            weekk.weekava = ''
            axios({
                    url: 'http://101.231.93.232:14014/latestData/getKlineData',
                    method: 'POST',
                    data: {
                        'stkcode': weekk.urlCode,
                        'xdxrType': tit,
                        'period': 'week',
                        'time': weekk.totalDate,
                        'num': 50
                    }
                })
                .then(function (res) {
                    // console.log(res.data.result);
                    var resdata = res.data.result
                    var reslength = resdata.length
                    weekk.weekreslength = reslength
                    // console.log(resdata);
                    if(reslength === 0){
                        weekk.weekmax = 0
                        weekk.weekmin = 0
                    }else{
                        weekk.weekmax = resdata[0].high
                        weekk.weekmin = resdata[0].low
                    }                   
                    // console.log("周k数据",resdata);
                    for (var i = 0; i < resdata.length; i++) {
                        // console.log(resdata[i]);
                        // console.log([resdata[i].open,resdata[i].preClose,resdata[i].low,resdata[i].high]);
                        // 开盘，收盘，最低，最高
                        // console.log(week.weekkdata);
                        if (resdata[i].ma5 === 0) {
                            resdata[i].ma5 = ''
                        }
                        if (resdata[i].ma10 === 0) {
                            resdata[i].ma10 = ''
                        }
                        if (resdata[i].ma20 === 0) {
                            resdata[i].ma20 = ''
                        }
                        if (resdata[i].ma30 === 0) {
                            resdata[i].ma30 = ''
                        }
                        if (resdata[i].amt > 100000000) {
                            resdata[i].amt = (resdata[i].amt / 100000000).toFixed(2) + '亿手'
                        } else if (resdata[i].amt > 10000) {
                            resdata[i].amt = (resdata[i].amt / 10000).toFixed(2) + '万手'
                        }
                        resdata[i].rise = (resdata[i].rise).toFixed(2)
                        resdata[i].open = (resdata[i].open).toFixed(2)
                        resdata[i].price = (resdata[i].price).toFixed(2)
                        resdata[i].low = (resdata[i].low).toFixed(2)
                        resdata[i].high = (resdata[i].high).toFixed(2)
                        if (weekk.weekmax - resdata[i].high < 0) {
                            weekk.weekmax = resdata[i].high
                        }
                        if (weekk.weekmin - resdata[i].low > 0) {
                            weekk.weekmin = resdata[i].low
                        }
                        weekk.weekkdata.push([resdata[i].open, resdata[i].price, resdata[i].low, resdata[i].high])
                        weekk.weekkTime.push(resdata[i].time.split(' ')[0])
                        weekk.weekkMa5.push(resdata[i].ma5)
                        weekk.weekkMa10.push(resdata[i].ma10)
                        weekk.weekkMa20.push(resdata[i].ma20)
                        weekk.weekkMa30.push(resdata[i].ma30)
                        weekk.weekkVol.push(resdata[i].vol)
                        weekk.weekkRise.push(resdata[i].rise)
                    }
                    weekk.weekava = (Number(weekk.weekmax)+Number(weekk.weekmin)).toFixed(2)/2;
                    // weekk.weekmax = Math.ceil(weekk.weekmax);
                    // weekk.weekmin = Math.floor(weekk.weekmin);
                    if (weekk.weekkTime.length < 50) {
                        for (var k = weekk.weekkTime.length; k < 50; k++) {
                            weekk.weekkTime[k] = ''
                        }
                    }
                    // console.log(callback)
                    if (callback && typeof callback === 'function') {
                            callback()
                        }
                })
        },
        // 月k图数据
        getmonthkData: function (tit,callback) {
            var weekk = this
            weekk.getUrldata()
            weekk.monthkData = []
            weekk.monthkTime = []
            weekk.monthkMa5 = []
            weekk.monthkMa10 = []
            weekk.monthkMa20 = []
            weekk.monthkMa30 = []
            weekk.monthkVol = []
            weekk.monthkRise = []
            weekk.monthmax = 0
            weekk.monthmin = 0
            weekk.monthava = []
            axios({
                    url: 'http://101.231.93.232:14014/latestData/getKlineData',
                    method: 'POST',
                    data: {
                        'stkcode': weekk.urlCode,
                        'xdxrType': tit,
                        'period': 'month',
                        'time': weekk.totalDate,
                        'num': 50
                    }
                })
                .then(function (res) {
                    var resdata = res.data.result
                    var reslength = resdata.length
                    weekk.monthreslength = reslength
                    // console.log(resdata)
                    // console.log(reslength);
                    // console.log(res);
                    // console.log(weekk.weekkdata)
                    if(reslength === 0){
                        weekk.monthmax = 0
                        weekk.monthmin = 0
                    }else{
                        weekk.monthmax = resdata[0].high
                        weekk.monthmin = resdata[0].low
                    }                    
                    for (var i = 0; i < resdata.length; i++) {
                        // 开盘，收盘，最低，最高
                        if (resdata[i].ma5 === 0) {
                            resdata[i].ma5 = ''
                        }
                        if (resdata[i].ma10 === 0) {
                            resdata[i].ma10 = ''
                        }
                        if (resdata[i].ma20 === 0) {
                            resdata[i].ma20 = ''
                        }
                        if (resdata[i].ma30 === 0) {
                            resdata[i].ma30 = ''
                        }
                        resdata[i].rise = (resdata[i].rise).toFixed(2)
                        resdata[i].open = (resdata[i].open).toFixed(2)
                        resdata[i].price = (resdata[i].price).toFixed(2)
                        resdata[i].low = (resdata[i].low).toFixed(2)
                        resdata[i].high = (resdata[i].high).toFixed(2)
                        // console.log('低', resdata[i].low)
                        // console.log('搞', resdata[i].high)
                        if (weekk.monthmax - resdata[i].high < 0) {
                            weekk.monthmax = resdata[i].high
                        }
                        if (weekk.monthmin - resdata[i].low > 0) {
                            weekk.monthmin = resdata[i].low
                        }
                        // console.log(weekk.monthmax)
                        // console.log(weekk.monthmin)
                        weekk.monthkData.push([resdata[i].open, resdata[i].price, resdata[i].low, resdata[i].high])
                        weekk.monthkTime.push(resdata[i].time.split(' ')[0])
                        weekk.monthkMa5.push(resdata[i].ma5)
                        weekk.monthkMa10.push(resdata[i].ma10)
                        weekk.monthkMa20.push(resdata[i].ma20)
                        weekk.monthkMa30.push(resdata[i].ma30)
                        weekk.monthkVol.push(resdata[i].vol)
                        weekk.monthkRise.push(resdata[i].rise)
                    }
                    // console.log(weekk.monthmax)
                    // console.log(weekk.monthmin)
                    // weekk.monthmax = weekk.monthmax.toFixed(2)
                    for (var j = 0; j < 50; j++) {
                        weekk.monthava.push(((Number(weekk.monthmax) + Number(weekk.monthmin)) / 2).toFixed(2))
                    }
                    // weekk.monthmax = Math.ceil(weekk.monthmax);
                    // weekk.monthmin = Math.floor(weekk.monthmin);
                    // console.log(weekk.monthkTime);
                    // console.log(weekk.monthkData);
                    if (weekk.monthkTime.length < 50) {
                        for (var k = weekk.monthkTime.length; k < 50; k++) {
                            weekk.monthkTime[k] = ''
                        }
                    }
                    if (callback && typeof callback === 'function') {
                            callback()
                        }

                })
        },
        // 分时图数据
        getShare: function (callback) {
            var gi = this
            gi.getUrldata()
            gi.giTime = []
            gi.giPrice = []
            gi.giVol = []
            gi.giRise = []
            gi.giMa = []
            var url = "";
            // http请求
            var dpStocks = JSON.parse(localStorage.dpstocks)  
            var index= []
            for(var i =0; i < dpStocks.length; i++){
                if(dpStocks[i].market+dpStocks[i].code == this.urlCode){
                    index = [dpStocks[i]]
                    console.log(index)              
                }
                //console.log(url)
            }
            // http请求
            if(index.length == 1) {
                url = 'http://route.showapi.com/131-51'
            } else {
                url = 'http://route.showapi.com/131-49'
            }
            console.log(url)
            var data = {
                "showapi_timestamp": formatterDateTime,
                "showapi_appid": '85473', //这里需要改成自己的appid
                "showapi_sign": '95c0a5096275453e8035871c43ddd5cd',  //这里需要改成自己的应用的密钥secret
                "code": this.urlCode.slice(2)
            }
            axios.post(
                url,
                qs.stringify(data),{
                    headers:{
                        'Content-Type':'application/x-www-form-urlencoded'
                        }
                    }
                )
                .then(function (res) {
                    if (res.data.showapi_res_body.dataList[0].minuteList.length != 0) {
                        var resdata = res.data.showapi_res_body.dataList;
                        for (var i = 0; i < 242; i++) { // 取昨日收盘价,需要以虚线绘制昨日收盘价的折线
                            gi.giPreClose[i] = Number(resdata[0].yestclose);
                        };
                        for (var i = 0; i < resdata[0].minuteList.length; i++) {
                            gi.giPrice.push(Number(resdata[0].minuteList[i].nowPrice))
                            gi.giVol.push(Number(resdata[0].minuteList[i].volume))
                            var price = Number(resdata[0].minuteList[i].nowPrice);
                            var yestclose = Number(resdata[0].yestclose);
                            gi.giRise.push((price-yestclose)/yestclose)
                        }
                        gi.giPriceMaxinum = Math.max.apply(null,gi.giPrice)
                        gi.giPriceMininum = Math.min.apply(null,gi.giPrice)
                        var maxCut = Math.abs(gi.giPriceMaxinum - Number(resdata[0].yestclose))
                        var minCut = Math.abs(gi.giPriceMininum - Number(resdata[0].yestclose))
                        if (maxCut > minCut) {
                            gi.giPriceMax = (Number(resdata[0].yestclose) + maxCut).toFixed(2)
                            gi.giPriceMin = (Number(resdata[0].yestclose) - maxCut).toFixed(2)
                            gi.giPriceMaxFloat = (maxCut / Number(resdata[0].yestclose) * 100).toFixed(2)
                            gi.giPriceMinFloat = ((-1) * gi.giPriceMaxFloat).toFixed(2)
                        } else {
                            gi.giPriceMax = (Number(resdata[0].yestclose) + minCut).toFixed(2)
                            gi.giPriceMin = (Number(resdata[0].yestclose) - minCut).toFixed(2)
                            gi.giPriceMaxFloat = (minCut / Number(resdata[0].yestclose) * 100).toFixed(2)
                            gi.giPriceMinFloat = ((-1) * gi.giPriceMaxFloat).toFixed(2)
                        }
                        if (callback && typeof callback === 'function') {
                           callback(gi.giTime, gi.giPrice, gi.giPriceMax, gi.giPriceMin, gi.giPreClose, gi.giMa, gi.giVol, gi.giRise, gi.giPriceMaxFloat, gi.giPriceMinFloat, gi.giRisePrice)
                        }
                    }
                })
        },
        // echart 分时图的制作
        drawEchartShare: function (time, price, max, min, preClose, ma, vol, rise, maxFloat, minFloat, risePrice) {
            if (this.typeIndex === true) {
                this.width = document.body.clientWidth
                // console.log(this.width);
                document.getElementById('main').style.width = 1 * this.width + 'px'
                //document.getElementsByClassName('fiveFiel')[0].style.width = 0.3 * this.width + 'px'
            } else {
                this.width = document.body.clientWidth
                // console.log(this.width);
                document.getElementById('main').style.width = 1 * this.width + 'px'
                //document.getElementsByClassName('fiveFiel')[0].style.width = '0px'
            }
            var myChartGi = echarts.init(document.getElementById('main'))
            preClose = this.giPreClose // 赋值，不重新赋值的情况下图形上的数据会消失
            vol = this.giVol // 赋值，不重新赋值的情况下图形上的数据会消失
            rise = this.giRise // 赋值，不重新赋值的情况下图形上的数据会消失
            time = this.timeArray
            // console.log(this.baseData);
            var that = this
            // setTimeout(function(){console.log(this.baseData);},1000);
            var option = {
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: '#fff',
                    textStyle: {
                        fontWeight: 'lighter',
                        fontSize: 10,
                        color: '#8c8989'
                    },
                    transitionDuration: 0,
                    position: function (pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = {
                            top: '55%'
                        }
                        return obj
                    },
                    formatter: function(params) {
                        if (params.length == 3) {
                            if (params[0].seriesName == '现价') {
                                params[2].value = params[2].value / 100
                                if (params[2].value > 100000000) {
                                  params[2].value = (params[2].value / 100000000).toFixed(2) + '亿手'
                                } else if (params[2].value > 10000) {
                                  params[2].value = (params[2].value / 10000).toFixed(2) + '万手'
                                } else {
                                  params[2].value = Math.ceil(params[2].value) + '手'
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
                                  params[0].value = (params[0].value / 100000000).toFixed(2) + '亿手'
                                } else if (params[0].value > 10000) {
                                  params[0].value = (params[0].value / 10000).toFixed(2) + '万手'
                                } else {
                                  params[0].value = Math.ceil(params[0].value) + '手'
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
                        }
                    }
                },
                axisPointer: {
                    link: {
                        xAxisIndex: 'all'
                    }
                },
                grid: [{
                    left: '1%',
                    right: '1%',
                    top: '2%',
                    height: '70%'
                }, {
                    left: '1%',
                    right: '1%',
                    top: '72%',
                    height: '20%'
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
                    axisLabel: {
                        show: false,
                        'interval': 60
                    },
                    axisTick: {
                        show: false
                    },
                    margin: 15,
                    axisLine: {
                        onZero: false,
                        lineStyle: {
                            color: '#ccc',
                            width: 0.5
                        }
                    },
                    axisPointer: {
                        label: {
                            show: false
                        }
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
                            color: '#ccc'
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
                            color: '#ccc'
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
                    transitionDuration: 0,
                    animation: false,
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
                        show: true
                    },
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#ccc'
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
                        fill: '#ec0000'
                    }
                }, {
                    type: 'text',
                    right: 'right',
                    bottom: '30%',
                    style: {
                        text: minFloat + '%',
                        fill: '#00da3c'
                    }
                }, {
                    type: 'text',
                    left: 'left',
                    top: 'top',
                    style: {
                        text: max,
                        fill: '#ec0000'
                    }
                }, {
                    type: 'text',
                    left: 'left',
                    bottom: '30%',
                    style: {
                        text: min,
                        fill: '#00da3c'
                    }
                }, {
                    type: 'text',
                    left: 'left',
                    bottom: '64%',
                    style: {
                        text: preClose[0],
                        fill: '#ccc'
                    }
                },
                {
                    type: 'text',
                    left: '1%',
                    bottom: '24%',
                    style: {
                        text: '9:30',
                        fill: '#ccc',
                        font: ' 0.8em "Open Sans",PingFangSC-Regular'
                    }
                }, {
                    type: 'text',
                    left: 'center',
                    bottom: '24%',
                    style: {
                        text: '11:30/13:00',
                        fill: '#ccc',
                        font: ' 0.8em "Open Sans",PingFangSC-Regular'
                    }
                }, {
                    type: 'text',
                    right: '1%',
                    bottom: '24%',
                    style: {
                        text: '15:00',
                        fill: '#ccc',
                        font: ' 0.8em "Open Sans",PingFangSC-Regular'
                    }
                }],
                series: [{
                    animation: false,
                    name: '现价',
                    type: 'line',
                    symbol: 'none',
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
                    areaStyle: {
                        smooth: true,
                        type: 'default',
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(36,137,232,0.2)'
                            }, {
                                offset: 1,
                                color: 'rgba(36,137,232,0.05)'
                            }])
                        }
                    }
                }, {
                    animation: false,
                    name: '昨收',
                    type: 'line',
                    symbol: 'none',
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
                    }
                }, {
                    animation: false,
                    name: '均线',
                    type: 'line',
                    stack: '',
                    smooth: true,
                    showSymbol: false,
                    data: ma,
                    lineStyle: {
                        normal: {
                            color: 'rgb(253,152,25)',
                            width: 1
                        }
                    }
                }, {
                    animation: false,
                    name: '成交量',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: vol,
                    itemStyle: {
                        normal: {
                            color: function (vol) {
                                var giColorList = []
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
                }, {
                    animation: false,
                    name: '涨跌数据',
                    type: 'line',
                    stack: '',
                    smooth: true,
                    showSymbol: false,
                    data: risePrice,
                    itemStyle: {
                        normal: {
                            color: 'white'
                        }
                    }
                }]
            }
            this.myChartGi = myChartGi
            this.giOption = option
            myChartGi.setOption(option)
            // console.log(this.typeIndex);
            window.onresize = function () {
                // console.log(that.typeIndex);
                if (that.typeIndex === true) {
                    that.width = document.body.clientWidth
                    // console.log(that.width);
                    document.getElementById('main').style.width = 1 * that.width + 'px'
                   // document.getElementsByClassName('fiveFiel')[0].style.width = 0.3 * that.width + 'px'
                    myChartGi.resize()
                } else {
                    that.width = document.body.clientWidth
                    // console.log(that.width);
                    document.getElementById('main').style.width = 1 * that.width + 'px'
                    //document.getElementsByClassName('fiveFiel')[0].style.width = '0px'
                    myChartGi.resize()
                }
            }
        },
        // echarts 日k图的制作
        drawEchartsdayk: function () {
            if (this.mychartDay != null && this.mychartDay != "" && this.mychartDay != undefined) {
                    this.mychartDay.dispose()
            }
            this.width = document.body.clientWidth
            document.getElementById('dayk').style.width = this.width + 'px'
            // document.getElementById('dayk').style.height = '20rem'
            // console.log(document.getElementById('dayk').style.width)
            // console.log(document.getElementById('dayk').style.height)
            var myChartweekk1 = echarts.init(document.getElementById('dayk'))
            var that = this
            var vol = that.daykVol
            var option2 = {
                tooltip: {
                    trigger: 'axis',
                    textStyle: {
                        fontWeight: 'lighter',
                        fontSize: 10,
                        color: '#fff'
                    },
                    transitionDuration: 0,
                    position: function (pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = {top: 0};
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    },
                    axisPointer: {
                        type: 'cross',
                        snap: true,
                        crossStyle: {
                            type: 'solid',
                            showSymbol: false
                        }
                    }
                },
                axisPointer: {
                    link: [{
                        xAxisIndex: 'all'
                    }]
                },
                legend: {
                    data: [{
                        name: 'ma5',
                        icon: 'line'
                    }, {
                        name: 'ma10',
                        icon: 'line'
                    }, {
                        name: 'ma20',
                        icon: 'line'
                    }, {
                        name: 'ma30',
                        icon: 'line'
                    }],
                    left: '0'
                },
                grid: [{
                    left: '1%',
                    right: '1%',
                    top: '12%',
                    height: '58%'
                }, {
                    left: '1%',
                    right: '1%',
                    top: '75%',
                    height: '20%'
                }],
                xAxis: [{
                    // show: false,
                    type: 'category',
                    data: that.daykTime,
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        // rotate: 5, //刻度旋转45度角
                        // right: 5,
                        // show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    }
                }, {
                    // show: true,
                    type: 'category',
                    data: that.daykTime,
                    gridIndex: 1,
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    axisPointer: {
                        label: {
                            show: false
                        }
                    }
                }],
                yAxis: [{
                    // type: 'category',
                    show: true,
                    scale: false,
                    splitNumber: 10,
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250,250,250,0.3)','rgba(240,240,240,0.6)']
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false,
                        inside: true,
                        formatter: '{value}\n'
                    },
                    // max: maxy,
                    // min:miny,
                    max: that.daymax,
                    min: that.daymin
                }, {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    axisLabel: {
                        show: false
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
                    left: '2%',
                    top: '10%',
                    style: {
                        text: that.daymax,
                        fill: '#ccc'
                    }
                }, {
                    type: 'text',
                    left: '2%',
                    top: '66%',
                    style: {
                        text: that.daymin,
                        fill: '#ccc'
                    }
                }, {
                    type: 'text',
                    left: '2%',
                    top: '37%',
                    style: {
                        text: that.dayava,
                        fill: '#ccc'
                    }
                }],
                series: [{
                    animation: false,
                    type: 'candlestick',
                    name: '日K',
                    barWidth: 5,
                    data: that.daykData,
                    itemStyle: {
                        normal: {
                            color: '#ef232a',
                            color0: '#14b143',
                            borderColor: '#ef232a',
                            borderColor0: '#14b143'
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma5',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.daykMa5,
                    itemStyle: {
                        normal: {
                            // color: "white",
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#62b0fa'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma10',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.daykMa10,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#a1a3a5'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma20',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.daykMa20,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#f6b769'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma30',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.daykMa30,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#fb756b'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'Volume',
                    type: 'bar',
                    barWidth: 5,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: vol,
                    itemStyle: {
                        normal: {
                            color: function (vol) {
                                var giColorList = []
                                for (var i = 0; i < that.daykRise.length; i++) {
                                    if (that.daykRise[i] > 0) {
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
            }
            myChartweekk1.setOption(option2)
            that.mychartDay = myChartweekk1
            that.dayOption = option2
            window.onresize = function () {
                this.width = document.body.clientWidth
                document.getElementById('dayk').style.width = this.width + 'px'
                myChartweekk1.resize()
            }
        },
        // echarts 周k图的制作
        drawEchartsweekk: function () {
            if (this.mychartWeek != null && this.mychartWeek != "" && this.mychartWeek != undefined) {
                    this.mychartWeek.dispose()
            }
            this.width = document.body.clientWidth
            document.getElementById('weekk').style.width = this.width + 'px'
            var myChartweekk = echarts.init(document.getElementById('weekk'))
            var that = this
            var vol = that.weekkVol
            var option2 = {
                tooltip: {
                    trigger: 'axis',
                    textStyle: {
                        fontWeight: 'lighter',
                        fontSize: 10,
                        color: '#fff'
                    },
                    transitionDuration: 0,
                    position: function (pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = {top: 0};
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    },
                    axisPointer: {
                        type: 'cross',
                        snap: true,
                        crossStyle: {
                            type: 'solid',
                            showSymbol: false
                        }
                    }
                },
                axisPointer: {
                    link: [{
                        xAxisIndex: 'all'
                    }]
                },
                legend: {
                    data: [{
                        name: 'ma5',
                        icon: 'line'
                    }, {
                        name: 'ma10',
                        icon: 'line'
                    }, {
                        name: 'ma20',
                        icon: 'line'
                    }, {
                        name: 'ma30',
                        icon: 'line'
                    }],
                    left: '0'
                },
                grid: [{
                    left: '1%',
                    right: '1%',
                    top: '12%',
                    height: '58%'
                }, {
                    left: '1%',
                    right: '1%',
                    top: '75%',
                    height: '20%'
                }],
                xAxis: [{
                    // show: false,
                    type: 'category',
                    data: that.weekkTime,
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        // rotate: 5, //刻度旋转45度角
                        // right: 5,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    }
                }, {
                    // show: true,
                    type: 'category',
                    data: that.weekkTime,
                    gridIndex: 1,
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    axisPointer: {
                        label: {
                            show: false
                        }
                    }
                }],
                yAxis: [{
                    show: true,
                    scale: true,
                    splitNumber: 10,
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250,250,250,0.3)','rgba(240,240,240,0.6)']
                        }
                    },
                    // minInterval: 1,
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false,
                        inside: true,
                        formatter: '{value}\n'
                    },
                    max: that.weekmax,
                    min: that.weekmin,
                    transitionDuration: 0,
                    animation: false
                }, {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    axisLabel: {
                        show: false
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
                    left: '2%',
                    top: '10%',
                    style: {
                        text: that.weekmax,
                        fill: '#ccc'
                    }
                }, {
                    type: 'text',
                    left: '2%',
                    top: '66%',
                    style: {
                        text: that.weekmin,
                        fill: '#ccc'
                    }
                }, {
                    type: 'text',
                    left: '2%',
                    top: '37%',
                    style: {
                        text: that.weekava,
                        fill: '#ccc'
                    }
                }],
                series: [{
                    animation: false,
                    type: 'candlestick',
                    name: '周K',
                    barWidth: 5,
                    data: that.weekkdata,
                    itemStyle: {
                        normal: {
                            color: '#ef232a',
                            color0: '#14b143',
                            borderColor: '#ef232a',
                            borderColor0: '#14b143'
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma5',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.weekkMa5,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#62b0fa'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma10',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.weekkMa10,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#a1a3a5'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma20',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.weekkMa20,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#f6b769'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma30',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.weekkMa30,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#fb756b'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'Volume',
                    type: 'bar',
                    barWidth: 5,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: vol,
                    itemStyle: {
                        normal: {
                            color: function (vol) {
                                var giColorList = []
                                for (var i = 0; i < that.weekkRise.length; i++) {
                                    if (that.weekkRise[i] > 0) {
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
            }
            myChartweekk.setOption(option2)
                // mychartWeek: '', //周k图的实例化对象
                // weekOption: '', //周k图option
            that.mychartWeek = myChartweekk
            that.weekOption = option2
            window.onresize = function () {
                this.width = document.body.clientWidth
                document.getElementById('weekk').style.width = this.width + 'px'
                myChartweekk.resize()
            }
        },
        // echarts 月k图的制作
        drawEchartsmonthk: function () {
            if (this.mychartMonth != null && this.mychartMonth != "" && this.mychartMonth != undefined) {
                    this.mychartMonth.dispose()
            }
            this.width = document.body.clientWidth
            document.getElementById('mouthsk').style.width = this.width + 'px'
            var myChartweekk = echarts.init(document.getElementById('mouthsk'))
                // console.log(time);
            var that = this
            var vol = that.monthkVol
            var option2 = {
                tooltip: {
                    trigger: 'axis',
                    textStyle: {
                        fontWeight: 'lighter',
                        fontSize: 10,
                        color: '#fff'
                    },
                    transitionDuration: 0,
                    position: function (pos, params, dom, rect, size) {
                        // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                        var obj = {top: 0};
                        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                        return obj;
                    },
                    axisPointer: {
                        type: 'cross',
                        snap: true,
                        crossStyle: {
                            type: 'solid',
                            showSymbol: false
                        }
                    }
                },
                axisPointer: {
                    link: [{
                        xAxisIndex: 'all'
                    }]
                },
                legend: {
                    data: [{
                        name: 'ma5',
                        icon: 'line'
                    }, {
                        name: 'ma10',
                        icon: 'line'
                    }, {
                        name: 'ma20',
                        icon: 'line'
                    }, {
                        name: 'ma30',
                        icon: 'line'
                    }],
                    left: '0'

                },
                grid: [{
                    left: '1%',
                    right: '1%',
                    top: '12%',
                    height: '58%'
                }, {
                    left: '1%',
                    right: '1%',
                    top: '75%',
                    height: '20%'
                }],
                xAxis: [{
                    type: 'category',
                    data: that.monthkTime,
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    }
                }, {
                    // show: true,
                    type: 'category',
                    data: that.monthkTime,
                    gridIndex: 1,
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    axisPointer: {
                        label: {
                            show: false
                        }
                    }
                }],
                graphic: [{
                    type: 'text',
                    left: '2%',
                    top: '10%',
                    style: {
                        text: that.monthmax,
                        fill: '#ccc'
                    }
                }, {
                    type: 'text',
                    left: '2%',
                    top: '66%',
                    style: {
                        text: that.monthmin,
                        fill: '#ccc'
                    }
                }, {
                    type: 'text',
                    left: '2%',
                    top: '37%',
                    style: {
                        text: that.monthava[0],
                        fill: '#ccc'
                    }
                }],
                yAxis: [{
                    show: true,
                    scale: true,
                    splitNumber: 10,
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250,250,250,0.3)','rgba(240,240,240,0.6)']
                        }
                    },
                    // minInterval: 1,
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false,
                        inside: true,
                        formatter: '{value}\n'
                    },
                    max: that.monthmax,
                    min: that.monthmin,
                    transitionDuration: 0,
                    animation: false
                }, {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLine: {
                        lineStyle: {
                            show: false,
                            color: '#ccc'
                        }
                    },
                    axisLabel: {
                        show: false
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
                series: [{
                    animation: false,
                    type: 'candlestick',
                    name: '月K',
                    barWidth: 5,
                    data: that.monthkData,
                    itemStyle: {
                        normal: {
                            color: '#ef232a',
                            color0: '#14b143',
                            borderColor: '#ef232a',
                            borderColor0: '#14b143'
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma5',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.monthkMa5,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#62b0fa'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma10',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.monthkMa10,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#a1a3a5'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma20',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.monthkMa20,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#f6b769'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'ma30',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.monthkMa30,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 1, // 折线宽度
                                color: '#fb756b'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'monthava',
                    type: 'line',
                    showSymbol: false,
                    symbol: 'none',
                    data: that.monthava,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                type: 'dashed',
                                width: 1, // 折线宽度
                                color: '#ccc'
                            }
                        }
                    }
                }, {
                    animation: false,
                    name: 'Volume',
                    type: 'bar',
                    barWidth: 5,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: vol,
                    itemStyle: {
                        normal: {
                            color: function (vol) {
                                var giColorList = []
                                for (var i = 0; i < that.monthkRise.length; i++) {
                                    if (that.monthkRise[i] > 0) {
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
            }
            myChartweekk.setOption(option2)
                // mychartMonth: '', //月k图的实例化对象
                // monthOption: '', //月k图option
            that.mychartMonth = myChartweekk
            that.monthOption = option2
            window.onresize = function () {
                this.width = document.body.clientWidth
                document.getElementById('mouthsk').style.width = this.width + 'px'
                myChartweekk.resize()
            }
        },
        cutDown: function () { // 判断添加自选股还是删除自选股
            // console.log("详情页的股票代码", this.urlCode);
            // console.log(this.selfStock);
            if (this.selfStock) {
                for (var i = 0; i < this.selfStock.length; i++) {
                    if (this.selfStock[i].stkcode === this.urlCode) {
                        this.isShow = true
                        continue
                    }
                }
            }
        },
        addStock: function () { // 添加自选股
            var addStock = {}
            addStock.stkcode = this.urlCode
            addStock.type = true
            addStock.code = this.urlCode.slice(2)
            addStock.name = this.urlName
            this.selfStock.unshift(addStock)
            localStorage.setItem(this.telphone, JSON.stringify(this.selfStock))
                // console.log(this.selfStock);
            this.isShow = !this.isShow
            this.$toast({
                message: '添加成功',
                // iconClass: 'icon icon-success',
                duration: 1000
            })
        },
        deleteStock: function () { // 删除自选股
            for (var i = 0; i < this.selfStock.length; i++) {
                if (this.selfStock[i].stkcode === this.urlCode) {
                    this.selfStock.splice(i, 1)
                }
                localStorage.setItem(this.telphone, JSON.stringify(this.selfStock))
            }
            // console.log(this.selfStock);
            this.isShow = !this.isShow
            this.$toast({
                message: '删除成功',
                // iconClass: 'icon icon-success',
                duration: 1000
            })
        },
        toDetail: function (urlCode, name) {
            this.$router.push({
                path: '/particularsMore/stkCode=' + urlCode + '&stkName=' + name
            })
            // location.hash = '/views/ParticularsMore/stkCode=' + urlCode + '&stkName=' + name
        }
    },
}
</script>

<style lang='scss' scoped>
.stocksDetails .clearfix:after {
    content: "";
    display: block;
    clear: both;
}
.stocksDetails .clearfix {
    zoom: 1;
}
.stocksDetails .header span {
    display: inline-block;
    height: 2.75rem;
    line-height: 2.75rem;
    color: #fff;
    text-align: center;
    font-size: 1.125rem;
}
.stocksDetails .header span:nth-child(1) {
    float: left;
}
.stocksDetails .header span:nth-child(1) a {
    display: inline-block;
    height: 2.75rem;
    line-height: 2.75rem;
    color: #fff;
    text-align: center;
}
.stocksDetails .header span:nth-child(2) {
    display: block;
    text-align: center;
}
/*基本信息展示*/
.stocksDetails {
    padding-top: 2.5rem;
    padding-bottom: 2.5rem;
}
.stocksDetails .message {
    height: 4.6875rem;
    background-color: #fff;
    padding-left: 0.2rem;
}
.stocksDetails .message ul>li {
    float: left;
}
.stocksDetails .message ul>li:nth-child(1) {
    width: 28%;
    margin-right: 0.2rem;
    padding-left: 0.4rem;
    height: 4.6875rem;
}
.stocksDetails .message ul>li:nth-child(1) span:nth-child(1) {
    font-size: 1.5rem;
    font-weight: 500;
    display: block;
    text-align: left;
    padding-left: 0.2rem;
    height: 3rem;
    line-height: 3rem;
}
.stocksDetails .message ul>li:nth-child(1) span:nth-child(2),
.stocksDetails .message ul>li:nth-child(1) span:nth-child(3) {
    font-size: 0.8125rem;
}
.stocksDetails .message ul>li:nth-child(n+2):nth-child(-n+4) {
    height: 2.3rem;
    line-height: 2.5rem;
    display: inline-block;
    font-size: 0.75rem;
    color: #505050;
}
.stocksDetails .message ul>li:nth-child(n+5):nth-child(-n+7) {
    height: 2.3rem;
    line-height: 2.2rem;
    display: inline-block;
    font-size: 0.75rem;
    color: #505050;
}
.stocksDetails .message ul>li:nth-child(n+2) span:nth-child(1) {
    margin-right: 0.05rem;
}
.stocksDetails .message ul>li:nth-child(2), .stocksDetails .message ul>li:nth-child(4){
    width: 22%;
    margin-left: 0.12rem;
}
.stocksDetails .message ul>li:nth-child(3) {
    width: 24%;
    margin-left: 0.3rem;
}
.stocksDetails .message ul>li:nth-child(5) {
    width: 22%;
    margin-left: -0.1rem;
}
.stocksDetails .message ul>li:nth-child(6) {
    width: 27%;
}
.stocksDetails .message ul>li:nth-child(7) {
    width: 18%;
    margin-left: 0.1rem;
}
/*删除添加自选股样式*/
.stocksDetails .zixuangu {
    height: 2.5rem;
    background: #fafafa;
    font-family: PingFangSC-Regular;
    font-size: 0.9375rem;
    color: rgb(248, 46, 46);
    letter-spacing: 0.21px;
    text-align: center;
    line-height: 2.5rem;
    font-weight: 500;
    position: fixed;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
}
/*周k/月k/日k/分时图样式*/
.stocksDetails .echarts {
    margin-top: 3px;
    height: 19.5rem;
    background-color: #fff;
}
.stocksDetails .mint-navbar {
    border-top: 1px solid #ececec;
    border-bottom: 1px solid #ececec;
    margin-top: 0;
    background-color: #fff;
    height: 1.8rem;
}
.stocksDetails .echarts-header .mint-navbar .mint-tab-item {
    padding: 0.4rem 0;
    height: 1.6rem;
    line-height: 1.6rem;
    font-family: PingFangSC-Regular;
    font-size: 0.8125rem;
    letter-spacing: 0.23px;
    display: inline-block;
}
.stocksDetails .echarts-header .mint-navbar .mint-tab-item.is-selected {
    border-bottom: none;
    color: red;
}
/*辨别升降颜色的区分样式*/
.stocksDetails .risered {
    color: #FF363F;
}
.stocksDetails .downgreen {
    color: #1CCE18;
}
/*日k图的样式*/
.stocksDetails .mint-header {
    height: 2.5rem;
}
.stocksDetails #dayk div:nth-child(1) {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    padding: 0px;
    margin: 0px;
    border-width: 0px;
}
.stocksDetails #dayk div:nth-child(2) {
    width: 85%;
    z-index: 2!important;
}
.stocksDetails #dayk div:nth-child(2) span {
    /*padding-right: 0.7rem;*/
    font-size: 0.6rem;
    display: inline-block;
}
.stocksDetails #weekk div:nth-child(2) {
    width: 85%;
    z-index: 2!important;
}
.stocksDetails #mouthsk div:nth-child(2) {
    width: 85%;
    z-index: 2!important;
}
.stocksDetails #dayk canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    padding: 0px;
    margin: 0px;
    border-width: 0px;
}
/*周k*/
.stocksDetails #weekk div:nth-child(1) {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    padding: 0px;
    margin: 0px;
    border-width: 0px;
}
.stocksDetails #weekk div:nth-child(2) span {
    /*padding-right: 0.7rem;*/
    font-size: 0.6rem;
    display: inline-block;
}

.stocksDetails #weekk canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    padding: 0px;
    margin: 0px;
    border-width: 0px;
}
/*月k*/
.stocksDetails #mouthsk div:nth-child(1) {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    padding: 0px;
    margin: 0px;
    border-width: 0px;
}
.stocksDetails #mouthsk div:nth-child(2) span {
    /*padding-right: 0.7rem;*/
    font-size: 0.6rem;
    display: inline-block;
}
.stocksDetails #mouthsk canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    padding: 0px;
    margin: 0px;
    border-width: 0px;
}
.stocksDetails .add_icon {
    display: inline-block;
    width: 0.90625rem;
    height: 0.90625rem;
    background: url(../assets/icon_add.svg);
    /*background-repeat: no-repeat;*/
    background-size: 100%;
    margin-right: 0.375rem;
}
.stocksDetails .del_icon {
    display: inline-block;
    width: 0.90625rem;
    height: 0.90625rem;
    background: url(../assets/icon_del.svg);
    background-repeat: no-repeat;
    background-size: 100%;
    margin-right: 0.375rem;
}
.stocksDetails .color_red {
    color: #FF363F;
}

.stocksDetails .color_green {
    color: #1CCE18;
}
.cjnews{
    margin-top: 10px;
    padding-top: 0.5rem;
    text-align: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    border-top: 1px solid #eee;
}
.cjnews p{
    color: #ff363f;
    font-size:.875rem;
}
</style>