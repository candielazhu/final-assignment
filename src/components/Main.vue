<template>
    <div class="main">
        <el-scrollbar height="100%" @end-reached="loadMore">
            <div v-if="articles.list.length > 0">
                <div v-for="article in articles.list" :key="article.id" class="article-item"
                    @click="goToTopic(article)">
                    <div class="article-main">
                        <div class="article-title-row">
                            <h3>{{ article.title }}</h3>
                            <el-tag v-if="article.status === 'draft'" type="info" size="small">草稿</el-tag>
                        </div>
                        <p class="article-summary">{{ article.summary }}</p>
                        <div class="article-meta">
                            <span>{{ article.author_name || article.author }}</span>
                            <span>{{ formatDate(article.created_at || article.createTime) }}</span>
                            <div>
                                <span>{{ article.reading || article.view_count || article.views || 0 }} 浏览</span>
                                <span>{{ Number(article.comment_count || article.commentCount || 0) }} 评论</span>
                            </div>
                        </div>
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
import request from '../axios/request'

const router = useRouter()

// 文章列表数据
const articles = ref({
    list: []
})

// 加载状态
const loading = ref(false)
// 分页参数
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 日期格式化函数
const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
}

// 获取文章数据
const getData = async function () {
    // 重置分页参数
    page.value = 1
    hasMore.value = true
    loading.value = true
    
    // 获取当前登录用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}

    try {
        const res = await request({
            url: '/articles',
            method: 'get',
            params: {
                user_id: userInfo.id || null
            }
        })
        let articleList = res.data.data || []
        console.log('获取到的文章数据:', articleList)

        // 排序：草稿文章置顶，已发布文章按创建时间倒序
        articleList.sort((a, b) => {
            // 先按状态排序，草稿排在前面
            if (a.status === 'draft' && b.status !== 'draft') return -1
            if (a.status !== 'draft' && b.status === 'draft') return 1

            // 状态相同，按创建时间倒序
            const dateA = new Date(a.created_at || a.createTime)
            const dateB = new Date(b.created_at || b.createTime)
            return dateB - dateA
        })

        articles.value.list = articleList
        // 如果初始加载的文章数量小于pageSize，说明没有更多文章
        hasMore.value = articleList.length >= pageSize.value
    } catch (err) {
        console.error('获取文章列表失败:', err)
        articles.value.list = []
    } finally {
        loading.value = false
    }
}

// 加载文章列表
const fetchArticles = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
        // 获取当前登录用户信息
        const userInfoStr = localStorage.getItem('userInfo')
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}

        const res = await request({
            url: '/articles',
            method: 'get',
            params: {
                user_id: userInfo.id || null,
                page: page.value,
                pageSize: pageSize.value
            }
        })
        
        let newArticles = res.data.data || []
        
        if (newArticles.length === 0) {
            hasMore.value = false
        } else {
            // 合并新文章到现有列表
            articles.value.list = [...articles.value.list, ...newArticles]
        }
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
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.article-main {
    width: 100%;
}

.article-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.article-title-row h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    margin-right: 10px;
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
