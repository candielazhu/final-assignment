<template>
    <div class="main">
        <el-scrollbar height="100%" @end-reached="loadMore">
            <p v-for="item in num" :key="item" class="scrollbar-demo-item" @click="goToTopic(item)">
                {{ item }}
            </p>
        </el-scrollbar>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const num = ref(30)

const loadMore = (direction) => {
    if (direction === 'bottom') {
        num.value += 5
    }
}

const goToTopic = (item) => {
    // 导航到Topic页面，并传递item和id参数
    router.push({
        name: 'Topic',
        params: { item: item, id: item }
    })
}
</script>

<style scoped>

.main {
    padding: 20px;
    width: 100%;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.scrollbar-demo-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    margin: 10px;
    text-align: center;
    border-radius: 4px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s;
}

.scrollbar-demo-item:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-hover);
}

.el-slider {
    margin-top: 20px;
}
</style>
