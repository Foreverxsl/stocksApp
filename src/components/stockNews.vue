<template>
  <div class="currentNew">     
    <ul>
      <li v-for="(item,index) in newlists" :key="item.id" @click="toNewDetail(item.id,name)">
        <p>{{item.title}}</p>
        <div class="date">
          <img src="../assets/clock.png"> 
          <span>{{item.pubDate}}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import formatterDateTime from '../utils/utils'
import qs from 'qs'
import axios from 'axios'
export default {
    name: 'stockNews',
    props: ["name"],
    data() {
        return {
            newlists: [],
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
                "maxResult": "30",
                "page": "1",
            }
            axios.post(
                url,
                qs.stringify(data),{
                    headers:{
                        'Content-Type':'application/x-www-form-urlencoded'
                        }
                    }
                )
                .then((res) => {
                    var data = res.data.showapi_res_body.pagebean.contentlist
                    this.newlists = data
                    console.log("新闻列表",data)
                })
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
  }
}
</style>


