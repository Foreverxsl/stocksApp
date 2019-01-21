<template>
    <div class="about">
        <headerBack :title="title"></headerBack>
        <div class="about-content">
            <div class="banner">
                <img src="../../static/imgs/user.jpg" />
            </div>
            <div class="detail">
                <p>
                   小猪看股App是一款基于移动平台的股票查询软件。主要功能包括首页大盘信息展示，
                   大盘分时图展示以及每日财经新闻推送。
                </p>
                <p>
                    行情页面展示当天实时指数信息以及股票的涨跌幅、振幅以及换手率排行榜。单击股票列表可以
                    进入股票详情页面。详情页面包括该股票的分时图、日K图、周K图、月K图的展示以及该股票的新闻推送。
                </p>
                <p>
                    自选股页面用户可以进行搜索并添加想要关注的股票，并有自选股编辑功能可以实现对自选股的删除、
                    置顶和拖动。
                </p>
                <p>投资有风险，入市需谨慎。</p>
            </div>
        </div>
        <div class="footer">
            <p>Copyright &copy;2018-2019</p>
            <p>广州大学软件学院15信工一：蔡锦煌</p>
        </div>
    </div>
</template>

<script>
import headerBack from './headerBack'
    export default {
        name: 'about',
        data() {
            return {
                title: '关于我们'
            }
        },
        components: {
            headerBack
        }
        
    }
</script>

<style lang='scss' scoped>
.about{  
    .about-content{
        background: #fafafa;
        position: absolute;
        top: 2.5rem;
        bottom: 3.125rem;
        padding: 0 1.125rem;
        .banner{
            height: 13.75rem;
            padding: 1.25rem 0;
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 1px solid #eaeaea;
            img{
                width: 8.125rem;
                height: 8.125rem;
                border-radius: 50%;
            }
        }
        .detail{
            margin-top: 1.25rem;
            p{
                font-size: 14px;
                margin-top: .625rem;
            }
        }
    }
    .footer{
        position: fixed;
        background: #eee;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        height: 3.125rem;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        p{
            font-size: 12px;
            margin: .3125rem 0;
        }
    }
    
}

</style>