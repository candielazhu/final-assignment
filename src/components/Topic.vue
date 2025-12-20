<template>
    <div class="topic-container">
        <el-scrollbar class="scrollbar-demo" ref="scrollbarRef">
            <div class="header">
                &nbsp;
                <h2>{{ article.title || '文章详情' }}</h2>
                <el-button type="primary" @click="goBack">返回</el-button>
            </div>
            
            <!-- 加载中状态 -->
            <div v-if="loading" class="loading-state">
                <el-skeleton :rows="5" animated />
            </div>
            
            <!-- 文章内容 -->
            <div v-else-if="article.id" class="content-wrapper">
                <div class="markdown-content" ref="markdownRef" v-html="htmlContent">
                </div>
                <!-- 锚点容器 -->
                <div class="anchor-container" v-if="anchors.length > 0">
                    <div class="anchor-title">文章目录</div>
                    <div class="anchor-list">
                        <div v-for="anchor in anchors" :key="anchor.id"
                            :class="['anchor-item', { 'active': activeAnchor === anchor.id }]"
                            :style="{ paddingLeft: `${(anchor.level - 1) * 15}px` }" @click="scrollToAnchor(anchor.id)">
                            {{ anchor.text }}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 文章不存在状态 -->
            <div v-else class="empty-state">
                文章不存在
            </div>
            
            <!-- 评论组件 -->
            <Comment v-if="article.id" :article-id="article.id" @update:comment-count="updateCommentCount" />
        </el-scrollbar>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElButton, ElSkeleton } from 'element-plus'
import { marked } from 'marked'
import Comment from './Comment.vue'

const route = useRoute()
const router = useRouter()
const markdownRef = ref(null)

// 文章数据，后期从API获取
const article = ref({
    id: null,
    title: '',
    content: '',
    author: '',
    createTime: '',
    commentCount: 0
})

// 加载状态
const loading = ref(false)

// 锚点相关数据
const anchors = ref([])
const activeAnchor = ref('')

// 生成唯一ID
const generateId = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// 将 Markdown 转换为 HTML，并添加ID
const htmlContent = computed(() => {
    if (!article.value.content) return ''
    const html = marked(article.value.content)
    // 在返回HTML前，我们会在DOM更新后提取标题并生成锚点
    return html
})

// 提取标题并生成锚点
const extractAnchors = () => {
    if (!markdownRef.value) return

    const headings = markdownRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const newAnchors = []

    headings.forEach(heading => {
        const level = parseInt(heading.tagName[1])
        const text = heading.textContent.trim()
        const id = generateId(text)

        // 给标题添加ID
        heading.id = id

        newAnchors.push({
            id,
            text,
            level
        })
    })

    anchors.value = newAnchors
}

// 滚动到指定锚点
const scrollToAnchor = (id) => {
    const element = document.getElementById(id)
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
        activeAnchor.value = id
    }
}

// 监听滚动，高亮当前锚点
const handleScroll = () => {
    if (!markdownRef.value || anchors.value.length === 0) return

    // 获取markdown内容容器的滚动位置
    const markdownRect = markdownRef.value.getBoundingClientRect()
    const scrollPosition = window.scrollY + window.innerHeight / 3 // 调整滚动位置，使用视口高度的1/3作为判断点

    let currentActive = ''

    // 从后往前检查，找到第一个可见的标题
    for (let i = anchors.value.length - 1; i >= 0; i--) {
        const anchor = anchors.value[i]
        const element = document.getElementById(anchor.id)
        if (element) {
            const elementRect = element.getBoundingClientRect()
            // 计算元素相对于文档顶部的位置
            const elementTop = elementRect.top + window.scrollY

            // 当标题进入视口1/3位置时，高亮该锚点
            if (elementTop <= scrollPosition) {
                currentActive = anchor.id
                break
            }
        }
    }

    activeAnchor.value = currentActive
}

// 获取文章详情
const fetchArticleDetail = async () => {
    const id = route.params.id
    if (!id) return
    
    loading.value = true
    try {
        // 后期替换为真实API调用
        // const response = await axios.get(`/api/articles/${id}`)
        // article.value = response.data.article
        
        // 临时模拟，后期删除
        article.value = {
            id: id,
            title: '示例文章标题',
            content: '# 示例文章\n\n这是一篇示例文章，用于展示文章详情页面。\n\n## 第一部分\n\n### 1.1 小节标题\n这是第一部分的内容。\n\n## 第二部分\n\n### 2.1 小节标题\n这是第二部分的内容。',
            author: '示例作者',
            createTime: '2023-01-01',
            commentCount: 0
        }
    } catch (error) {
        console.error('获取文章详情失败:', error)
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.go(-1) // 返回上一页
}

// 更新评论数量
const updateCommentCount = (count) => {
    // 这里可以更新文章的评论数量
    article.value.commentCount = count
    console.log('评论数量:', count)
}

// 监听htmlContent变化，重新提取锚点
watch(htmlContent, () => {
    nextTick(() => {
        extractAnchors()
    })
})

// 监听路由参数变化，重新获取文章详情
watch(() => route.params.id, (newId) => {
    if (newId) {
        fetchArticleDetail()
    }
})

// 组件挂载后提取锚点并添加滚动监听
onMounted(() => {
    // 获取文章详情
    fetchArticleDetail()
    
    window.addEventListener('scroll', handleScroll)
})

// 组件卸载前移除滚动监听
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.topic-container {
    padding: 20px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 80vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

/* 内容和锚点的布局 */
.content-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.markdown-content {
    flex: 1;
    padding: 20px;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    line-height: 1.8;
    overflow-y: auto;
    max-height: 70vh;
    border: 1px solid var(--border-color);
}

/* 锚点容器样式 */
.anchor-container {
    position: sticky;
    top: 20px;
    width: 250px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    max-height: 70vh;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.anchor-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: var(--text-primary);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
}

.anchor-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.anchor-item {
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
}

.anchor-item:hover {
    color: var(--primary-color);
    background-color: var(--bg-secondary);
}

.anchor-item.active {
    color: var(--primary-color);
    font-weight: bold;
    background-color: var(--bg-secondary);
    border-left: 3px solid var(--primary-color);
}

/* Markdown 内容样式 */
.markdown-content h1 {
    font-size: 2em;
    margin-bottom: 0.83em;
    color: var(--text-primary);
    padding-bottom: 0.3em;
    border-bottom: 2px solid var(--border-color);
}

.markdown-content h2 {
    font-size: 1.5em;
    margin: 1em 0 0.83em 0;
    color: var(--text-primary);
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--border-color);
}

.markdown-content h3 {
    font-size: 1.25em;
    margin: 1em 0 0.83em 0;
    color: var(--text-primary);
}

.markdown-content h4 {
    font-size: 1.1em;
    margin: 1em 0 0.83em 0;
    color: var(--text-primary);
}

.markdown-content p {
    margin: 0.83em 0;
    color: var(--text-primary);
}

/* 评论输入框 */
.comment-input {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}



/* 响应式设计 */
@media (max-width: 1024px) {
    .content-wrapper {
        flex-direction: column;
    }

    .anchor-container {
        width: 100%;
        position: static;
        max-height: none;
    }
}
</style>