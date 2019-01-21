<template>
  <transition :name="transitionName">
    <div class="back-to-ceiling" @click="backToTop(6)">
      <svg width="16" height="16" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg" class="Icon Icon--backToTopArrow" aria-hidden="true" style="height: 1rem; width: 1rem;">
        <title>回到顶部</title>
        <g>
          <path d="M12.036 15.59c0 .55-.453.995-.997.995H5.032c-.55 0-.997-.445-.997-.996V8.584H1.03c-1.1 0-1.36-.633-.578-1.416L7.33.29c.39-.39 1.026-.385 1.412 0l6.878 6.88c.782.78.523 1.415-.58 1.415h-3.004v7.004z" fill-rule="evenodd"></path>
        </g>
      </svg>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
  props: {
    transitionName: {
      type: String,
      default: 'fade'
    }
  },
  methods: {
    backToTop(rate) {
      /*document.body.scrollTop=0;
        document.documentElement.scrollTop=0;*/
        let doc = document.body.scrollTop? document.body : document.documentElement;
        let scrollTop = doc.scrollTop;
        let top = function () {
            scrollTop = scrollTop + (0 - scrollTop) / (rate || 2);
            // 临界判断，终止动画
            if (scrollTop < 1) {
                doc.scrollTop = 0;
                return;
            }
            doc.scrollTop = scrollTop;
            // 动画执行!
            requestAnimationFrame(top);
        };
        top();
    }
  }
}
</script>

<style lang='scss' scoped>
  .back-to-ceiling {
    position: fixed;
    display: inline-block;
    text-align: center;
    cursor: pointer;
    right: 2rem;
    bottom: 4.625rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius : 0.625rem;
    line-height: 3rem;
    background: #e7eaf1;
    z-index: 99;
    &:hover {
        background: #d5dbe7;
    }
    .Icon {
        fill: #9aaabf;
        background: none;
    }
  }
  .fade-enter-active,.fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter,.fade-leave-to {
    opacity: 0
  }

</style>
