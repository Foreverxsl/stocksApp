<template>
  <section class="financial-list">
    <section class="collect" @click="jumpPage">
      <aside>
       <h2>{{news.title}}</h2>
        <section class="Cleft clearfix">
          <img src="../../../assets/clock.png" style="width:0.75rem;height:0.625rem;">
          <span> {{news.date}}</span>
        </section>
        <div style="clear: both"></div>
      </aside>
      <aside>
        <img :src="news.thumbnail_pic_s">
      </aside>
      <div style="clear: both"></div>
    </section>
  </section>
</template>

<script>
export default {
  name: 'newsCell',
   props:['news'],
  data () {
    return {
    }
  },
  created() {
    //   console.log(this.news)
  },
  methods: {
    jumpPage: function () {
      this.$router.push({path:"/newsDetail/"+this.news.uniquekey,query: { newUrl: this.news.url,published: this.news.author_name }})
      //window.location.href = this.news.url
    }
  }
}
</script>

<style lang='scss' scoped>
.financial-list {
    width: 100%;
    height: 100%;
    background-color: white;
    padding: 0.625rem 0;
    border-bottom: 1px solid #eee;
    .collect {
        width: 94%;
        margin: 0 auto;
        aside:nth-of-type(1) {
            width: 69%;
            float: left;
        }
        aside:nth-of-type(2) {
            width: 29%;
            height: 5.2rem;
            float: left;
            margin-left: 2%;
            img{
                width: 100%;
                height: 100%;
            }
        }
        aside .Cleft {
            width: 50%;
            float: left;
            margin-top: 1rem;
            span{
                font-size: 0.625rem;
                color: #999999;
                width: 4.375rem;
                margin-left: -0.156rem;
                white-space: nowrap;
                text-overflow: ellipsis;
                -o-text-overflow: ellipsis;
                overflow: hidden;
            }
            img{
                width: 0.56rem;
                height: 0.75rem;
                margin-top: 0.25rem;
                margin-right: 0.2rem;
            }
        }
        h2 {
            width: 100%;
            font-size: 0.8125rem;
            color: #333333;
            line-height: 1rem;
            text-overflow: ellipsis;
            -o-text-overflow: ellipsis;
            overflow: hidden;
        }

    }
}
</style>
