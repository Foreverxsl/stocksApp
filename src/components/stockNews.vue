<template>
  <div class="currentNew">     
    <ul style="padding-bottom:10px;overflow:hidden;" v-infinite-scroll="loadMore" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
      <li v-for="(item,index) in newlists" :key="index" @click="toNewDetail(item.id,name)">
        <p>{{item.title}}</p>
        <div class="date">
          <img src="../assets/clock.png"> 
          <span>{{item.pubDate}}</span>
        </div>
      </li>
      <div class="no-more" v-if="!bRequest">加载完成~</div>  
    </ul>
    <p style="display:flex;justify-content:center;" v-show="isMoreLoading" class="page-infinite-loading">
        <mt-spinner type="fading-circle"></mt-spinner>
    </p> 
  </div>
</template>
<script>
import formatterDateTime from '../utils/utils'
import qs from 'qs'
import axios from 'axios'
import Vue from 'vue'
import { InfiniteScroll } from 'mint-ui';
Vue.use(InfiniteScroll);
export default {
    name: 'stockNews',
    props: ["name"],
    data() {
        return {
            newlists: [],
            loading: true,
            page: 1,
            bRequest: true,
            isMoreLoading: false
        };
    },
    mounted() {
        this.getNewsDetail()
    },
    methods: {
        getNewsDetail() {
            console.log("股票名"+this.name)
            var url = 'http://route.showapi.com/109-35'
            var data = {
                "showapi_timestamp": formatterDateTime,
                "showapi_appid": '78647', //这里需要改成自己的appid
                "showapi_sign": '2130f52d3dc04518b0b2002a477e1819',  //这里需要改成自己的应用的密钥secret
                "title": this.name,
                "maxResult": "10",
                "page": this.page,
            }
            axios.post(
                //'http://qt.gtimg.cn/q=sh000001'
                url,
                qs.stringify(data),{
                    headers:{
                        'Content-Type':'application/x-www-form-urlencoded'
                        }
                    }
                )
                .then((res) => {
                    var data = res.data.showapi_res_body.pagebean.contentlist
                    if(data.length === 0){
                        this.bRequest = false
                        this.isMoreLoading = false
                        this.loading = true
                    }else {
                        this.isMoreLoading = false
                        this.loading = false
                        this.newlists = this.newlists.concat(data)
                        console.log(this.newlists)
                    }
                    /*console.log("页数"+this.page)
                    if(this.page > 5){
                        this.bRequest = false
                        this.isMoreLoading = false
                        this.loading = true
                    }else {
                        
                        this.isMoreLoading = false
                        this.loading = false
                        this.newlists = data.slice(0,(this.page+1)*10)//this.newlists.concat(data)
                    }*/
                    //this.newlists = data
                    //this.loading = false
                    this.page++
                    console.log("新闻列表",data)
                }) 
            },
            loadMore() {
                this.isMoreLoading = true
                this.loading = true;            
                setTimeout(() => {
                    this.getNewsDetail();
                }, 1000);
            },
            toNewDetail(id,codename) {
                this.$router.push({path:"/stockNewDetail/"+id,query: { newId: id,codeName: codename}})
            }
        },
    
    }
</script>
<style scoped lang="scss">
.currentNew {
  border-bottom: 2px #fff solid;
  margin: 6px 0;
  ul {
    padding: 0;
    margin: 0;
    li {
        padding: 10px 12px;
        border-bottom: 1px solid #f0f0f0;
        p{
            line-height: 24px;
            font-size: 14px;
            color:#333;
        }
        .date{
            margin-top: 10px;
            img{
                vertical-align: middle;
                width: 0.75rem;
                height: 0.625rem;
                margin-right: .1rem;
            }
        }
    }
    .no-more{
        padding-top: .25rem;
        text-align: center;
    }
  }
}
</style>


