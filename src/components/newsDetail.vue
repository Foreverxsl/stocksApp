<template>
    <div>
        <headerBack :title="title"></headerBack>
        <div class="content">
            <div class="title">
                <p>{{newTitle}}</p>
                <div style="float:left;margin-bottom: .625rem;"> 
                    <img src="../assets/clock.png" class="clock">
                    <span>{{newTime}}</span>
                </div>
                <div style="float:left; margin: -.15rem 0 0 1.6rem;">
                    <img src="../assets/author.png" class="published">
                    <span>{{newPublished}}</span>
                </div>
            </div>
            <!-- <div class="detail-pic" v-show="havePic">
                <img :src="pic" class="pic" alt="" />
            </div> -->
            <div class="detail">
                <div class="vhtml" v-html="newContent"></div>
            </div>
        </div>
    </div>
</template>

<script>
import headerBack from './headerBack'
import formatterDateTime from '../utils/utils'
import qs from 'qs'
import axios from 'axios'
    export default {
        data() {
            return {
                title: '新闻详情',
                newUrl: this.$route.query.newUrl,
                newPublished: this.$route.query.published,
                newTitle: '',
                newTime: '',
                newContent: '',
                pic: ''
            }
        },
        components: {
            headerBack          
        },
        created () {
            console.log(this.newUrl)
            this.getNewsDetail()
        },
        computed: {
            // havePic() {
            //     if(this.pic) {
            //         return true
            //     }
            //     return false
            // }
        },
        methods: {
            getNewsDetail() {
                var url = 'http://route.showapi.com/883-1'
                var data = {
                    "showapi_timestamp": formatterDateTime,
                    "showapi_appid": '85473', //这里需要改成自己的appid
                    "showapi_sign": '95c0a5096275453e8035871c43ddd5cd',  //这里需要改成自己的应用的密钥secret
                    "url": this.newUrl,
                    "needContent": "0",
                    "needHtml": "1",
                    "needAll_list": "0" 
                }
                axios.post(
                    url,
                    qs.stringify(data),{
                        headers:{
                            'Content-Type':'application/x-www-form-urlencoded'
                            }
                        }
                    )
                    .then((res)=> {
                        var data = res.data.showapi_res_body
                        console.log("新闻详情",data)
                        this.newTime = data.time
                        this.newTitle = data.title
                        this.newContent = data.html
                        // if(data.img_list.length == 1) {
                        //     this.pic = data.img_list[0].url
                        // } else if(data.img_list.length > 1) {
                        //     this.pic = data.img_list[1].url
                        // } else {
                        //     this.pic = ''
                        // }
                    })        
            }
        },
    }
</script>

<style lang='scss'>
.vhtml {
    p{
        text-indent: 1em;
    }
    img{
        width:100%;
        margin-left: -1em;
    }
    
}
.content {
  margin: 3.4375rem .625rem .625rem .625rem;
  .title {
    border-bottom: solid 1px #d9dde0;
    overflow: hidden;
    p:first-child {
      font-size: .9375rem;
    }
    p:last-child {
      font-size: .75rem;
      color: #5d5f61;
    }
    .clock,.published {
        width: 0.75rem;
        height: 0.75rem;
        vertical-align: middle;
    }
  }
  .detail-pic{
      margin-top: .625rem;
      width: 100%;
      .pic{
          width: 100%;
      }
  }
  .detail{
    margin-top: .9375rem;
    font-size: .875rem;
    line-height: 1.5625rem;
    .v-html{
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
    margin: 0 0 .625rem 0;
  }
}
</style>