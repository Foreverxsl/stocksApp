<template>
    <mt-header fixed :title="title">
        <mt-button @click="goBack" icon="back" slot="left"></mt-button>
    </mt-header>
</template>

<script>
    export default {
        name: 'headerback',
        props: {
            title: String
        },
        methods: {
            goBack() {
                this.$router.go(-1)
            }
        },
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