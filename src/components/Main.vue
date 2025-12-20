<template>
    <div class="main">
        <el-scrollbar height="100%" @end-reached="loadMore">
            <!-- 文章列表框架，后期从API获取数据 -->
            <div v-if="articles.length > 0">
                <div v-for="article in articles" :key="article.id" class="article-item" @click="goToTopic(article)">
                    <h3>{{ article.title }}</h3>
                    <p class="article-summary">{{ article.summary }}</p>
                    <div class="article-meta">
                        <span>{{ article.author }}</span>
                        <span>{{ article.createTime }}</span>
                        <span>{{ article.commentCount }} 评论</span>
                    </div>
                </div>
            </div>
            <!-- 加载中状态 -->
            <div v-else-if="loading" class="loading-state">
                <el-skeleton :rows="3" animated />
            </div>
            <!-- 空状态 -->
            <div v-else class="empty-state">
                <el-empty description="暂无文章" />
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElSkeleton } from 'element-plus'
import request from './axios/request.js'

const router = useRouter()

// 文章列表数据，后期从API获取
const articles = ref([])
// 加载状态
const loading = ref(false)
// 分页参数
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 加载文章列表
const fetchArticles = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
        // 后期替换为真实API调用
        // const response = await axios.get('/api/articles', {
        //     params: { page: page.value, pageSize: pageSize.value }
        // })
        // articles.value = [...articles.value, ...response.data.articles]
        // hasMore.value = articles.value.length < response.data.total

        // 临时模拟，后期删除
        articles.value = []
        hasMore.value = false
    } catch (error) {
        console.error('加载文章失败:', error)
    } finally {
        loading.value = false
    }
}

// 加载更多
const loadMore = (direction) => {
    if (direction === 'bottom') {
        if (hasMore.value) {
            page.value++
            fetchArticles()
        }
    }
}

// 跳转到文章详情
const goToTopic = (article) => {
    router.push({
        name: 'Topic',
        params: { id: article.id }
    })
}

// 组件挂载时加载文章列表
onMounted(() => {
    fetchArticles()
})
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
