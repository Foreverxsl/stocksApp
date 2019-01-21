<template>
    <div>
        <header-back :title="title"></header-back>
        <div class="content">
            <div class="title">
                <p>{{newTitle}}</p>
                <p>
                    <img src="../assets/eyes.png">
                    <span style="margin-right: 0.5rem;">{{newPublished}}</span>
                    <img src="../assets/clock.png"> 
                    <span>{{newTime}}</span>
                </p>
            </div>
            <div class="relatedStock">
                <p>
                    <span>相关股票：</span>
                    <span class="stock">{{codeName}}</span>
                </p>
            </div>
            <!-- <div class="detail-pic" v-show="havePic">
                <img :src="pic" class="pic" alt="" />
            </div> -->
            <div class="detail">
                <p class="vhtml1" v-html="newContent"></p>
            </div>
        </div>
    </div>
</template>

<script>
import formatterDateTime from '../utils/utils'
import qs from 'qs'
import axios from 'axios'
import headerBack from './headerBack.vue'
    export default {
        data() {
            return {
                title: '新闻详情',
                newId: this.$route.query.newId,
                codeName: this.$route.query.codeName,
                newTitle: '',
                newTime: '',
                newContent: '',
                newPublished: '',
                pic: ''
            }
        },
        created () {
            //console.log(this.newId,"code"+this.codeName)
            this.getStockNewList()

        },
        components: {
            headerBack
        },
        computed: {
            //  havePic() {
            //     if(this.pic) {
            //         return true
            //     }
            //     return false
            // }
        },
        methods: {
            getStockNewList() {
                var url = 'http://route.showapi.com/109-35'
            var data = {
                "showapi_timestamp": formatterDateTime,
                "showapi_appid": '78647', //这里需要改成自己的appid
                "showapi_sign": '2130f52d3dc04518b0b2002a477e1819',  //这里需要改成自己的应用的密钥secret
                "id": this.newId,
                "needHtml": 1,
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
                    var data = res.data.showapi_res_body.pagebean.contentlist[0]
                    this.newlists = data
                    this.newTitle = data.title
                    this.newTime = data.pubDate
                    this.newPublished = data.source
                    this.newContent = data.html
                    /*if(data.imageurls.length == 1) {
                        this.pic = data.imageurls[0].url
                    } else {
                        this.pic = ''
                    }*/
                    console.log("新闻列表",data)
                })
                
            }
        },
    }
</script>

<style lang="scss">
.content {
  margin: 3.125rem .625rem .625rem .625rem;
  .title {
    border-bottom: solid 1px #d9dde0;
    p:first-child {
      font-size: .875rem;
      color: #312f2f;
    }
    p:last-child {
      font-size: .75rem;
      color: #5d5f61;
    }
    p img{
        vertical-align: middle;
        width: 0.75rem;
        height: 0.625rem;
    }
  }
  .relatedStock{
    font-size: .8125rem;
    // margin: 
    .stock{
      color:red;
      margin: 0 .3125rem;
    }
  }
  .detail-pic{
      margin-top: 1rem;
      width: 100%;
      .pic{
          width: 100%;
      }
  }
  .detail{
    margin-top: .9375rem;
    font-size: .875rem;
    line-height: 1.5625rem;
    .vhtml1 {
        img{
            width: 100%;
            margin-left: -1em;
        }
        p{
            text-indent: 1em;
        }

    }
  }
  p {
    margin: .625rem 0;
  }
}
</style>