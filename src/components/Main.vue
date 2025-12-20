<template>
    <div class="main">
        <el-scrollbar height="100%" @end-reached="loadMore">
            <div v-if="articles.list.length > 0">
                <div v-for="article in articles.list" :key="article.id" class="article-item" @click="goToTopic(article)">
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
import request from '../axios/request.js'


const router = useRouter()

// 文章列表数据
const articles = ref({
    list: []
})
const getData =function(){
    request({
        url:'/mock/getarticles',
        method:'get'
    }).then(res=>{
        articles.value.list = res.data.data
        console.log(res.data.data)
    }).catch(err=>{
        console.log(err)
    })
}

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
        articles.value.list = []
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

// 组件挂载时自动加载文章列表
onMounted(() => {
    getData()
})
</script>

<style scoped>
.main {
    padding: 20px;
    width: 100%;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.article-item {
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.article-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-item h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.article-summary {
    margin: 10px 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-tertiary);
}

.article-meta span {
    margin-right: 15px;
}

.loading-state {
    padding: 20px;
}

.empty-state {
    padding: 40px 0;
    text-align: center;
}

.el-scrollbar {
    height: calc(100vh - 100px);
}
</style>
