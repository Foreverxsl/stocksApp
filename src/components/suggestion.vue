<template>
    <div>
        <header-back :title="title"></header-back>

    </div>
</template>

<script>
import headerBack from './headerBack'
    export default {
        data() {
            return {
                title: '意见反馈'
            }
        },
        components: {
            headerBack
        }
    }
</script>

<style scoped>

</style>