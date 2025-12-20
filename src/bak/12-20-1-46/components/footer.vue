<template>
    <div class="footer-container">
        <el-config-provider :locale="locale">
            <el-table mb-1 :data="[]" />
            <el-pagination :total="100" />
        </el-config-provider>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const language = ref('zh-cn')
</script>

<style scoped>
</style>
