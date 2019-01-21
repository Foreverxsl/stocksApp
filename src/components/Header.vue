<template>
    <mt-header fixed :title="title"></mt-header>
</template>

<script>
    export default {
        name: 'myheader',
        props: {
            title: String,
        }
        
    }
</script>

<style scoped>
.mint-header {
  font-size: 1rem;
  height: 2.5rem;
  z-index: 99;
  line-height: 1.125rem;
}
</style>