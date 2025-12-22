<template>
    <div class="topic-container">
        <el-scrollbar class="scrollbar-demo" ref="scrollbarRef">
            <div class="header">
                &nbsp;
                <h2>{{ article.title || '文章详情' }}</h2>
                <div class="btn-container">
                    <!-- 只有文章作者才能看到编辑和删除按钮 -->
                    <el-button type="primary" @click="handleEditClick" v-if="isAuthor">编辑</el-button>
                    <el-popconfirm
                      v-if="isAuthor"
                      title="确定要删除这篇文章吗？"
                      confirm-button-text="确定"
                      cancel-button-text="取消"
                      @confirm="handleDeleteClick"
                    >
                      <template #reference>
                        <el-button type="danger">删除</el-button>
                      </template>
                    </el-popconfirm>
                    <el-button type="primary" @click="goBack">返回</el-button>
                </div>
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
import { ElButton, ElSkeleton, ElPopconfirm, ElMessage } from 'element-plus'
import { marked } from 'marked'
import Comment from './Comment.vue'
import request from '../axios/request'

const route = useRoute()
const router = useRouter()
const markdownRef = ref(null)

// 文章数据，后期从API获取
const article = ref({
    id: null,
    title: '',
    content: '',
    author: '',
    author_id: null, // 文章作者ID
    createTime: '',
    commentCount: 0
})

// 加载状态
const loading = ref(false)

// 锚点相关数据
const anchors = ref([])
const activeAnchor = ref('')

// 判断当前用户是否是文章作者
const isAuthor = computed(() => {
    // 获取当前登录用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const currentUserId = userInfo.id
    
    // 检查当前用户ID是否与文章作者ID匹配
    return currentUserId && article.value.author_id && currentUserId == article.value.author_id
})

// 编辑文章
const handleEditClick = () => {
    // 跳转到编辑页面，传递文章ID
    router.push({
        name: 'Write',
        query: { id: article.value.id }
    })
}

// 删除文章
const handleDeleteClick = async () => {
    try {
        const response = await request({
            url: `/articles/${article.value.id}`,
            method: 'delete'
        })
        
        if (response.data.code === 200) {
            // 使用ElMessage替代alert，提供更好的用户体验
            ElMessage.success('文章删除成功')
            // 跳转到首页
            router.push('/')
        } else {
            ElMessage.error('文章删除失败：' + response.data.message)
        }
    } catch (error) {
        console.error('删除文章失败:', error)
        ElMessage.error('文章删除失败，请稍后重试')
    }
}

// 生成唯一ID
const generateId = (text, index) => {
    const baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    // 添加索引确保ID唯一，避免重复标题导致的ID冲突
    return `${baseId}-${index}`
}

// 配置marked选项，确保所有标题都能正确转换
marked.setOptions({
    headerIds: false, // 禁用自动生成ID，我们将手动生成
    mangle: false, // 禁用ID混淆
    breaks: true, // 允许换行符转换为<br>
    gfm: true, // 启用GitHub风格的Markdown
    pedantic: false, // 禁用严格的Markdown规范
    sanitize: false, // 禁用HTML清理
    smartLists: true, // 启用智能列表格式化
    smartypants: false // 禁用智能标点转换
})

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

    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1])
        const text = heading.textContent.trim()
        // 传递索引确保生成唯一ID
        const id = generateId(text, index)

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

// 平滑滚动到指定锚点
const scrollToAnchor = (id) => {
    // 使用nextTick确保DOM已经更新
    nextTick(() => {
        const element = document.getElementById(id)
        if (!element || !markdownRef.value) return

        activeAnchor.value = id

        const container = markdownRef.value
        const targetPosition = element.offsetTop
        const startPosition = container.scrollTop
        const distance = targetPosition - startPosition
        const duration = anchorConfig.value.scrollSpeed
        let startTime = null

        // 使用requestAnimationFrame实现平滑滚动
        const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime
            const timeElapsed = currentTime - startTime
            const progress = Math.min(timeElapsed / duration, 1)
            
            // 使用缓动函数，使滚动更自然
            const easeInOutQuad = progress < 0.5 ? 
                2 * progress * progress : 
                1 - Math.pow(-2 * progress + 2, 2) / 2
            
            container.scrollTop = startPosition + distance * easeInOutQuad
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll)
            }
        }

        requestAnimationFrame(animateScroll)
    })
}

// 锚点配置选项
const anchorConfig = ref({
    scrollSpeed: 800, // 滚动速度，毫秒
    triggerThreshold: 0.3, // 触发阈值，视口高度的比例
    highlightStyle: {
        color: 'var(--primary-color)',
        fontWeight: 'bold',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '3px solid var(--primary-color)'
    }
})

// 监听滚动，高亮当前锚点
const handleScroll = () => {
    if (!markdownRef.value || anchors.value.length === 0) return

    // 获取markdown内容容器的滚动位置
    const containerScrollTop = markdownRef.value.scrollTop
    const containerHeight = markdownRef.value.clientHeight
    const triggerPosition = containerScrollTop + containerHeight * anchorConfig.value.triggerThreshold

    let currentActive = ''

    // 从后往前检查，找到第一个可见的标题
    for (let i = anchors.value.length - 1; i >= 0; i--) {
        const anchor = anchors.value[i]
        const element = document.getElementById(anchor.id)
        if (element) {
            // 获取元素相对于容器顶部的位置
            const elementTop = element.offsetTop

            // 当标题进入触发区域时，高亮该锚点
            if (elementTop <= triggerPosition) {
                currentActive = anchor.id
                break
            }
        }
    }

    activeAnchor.value = currentActive
}

// 获取文章详情
const fetchArticleDetail = async () => {
    const id = parseInt(route.params.id)
    if (!id) return
    
    // 获取当前登录用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}

    loading.value = true
    try {
        // 使用mock接口获取文章详情
        const response = await request({
            url: `/articles/${id}`,
            method: 'get',
            params: {
                user_id: userInfo.id || null
            }
        })

        if (response.data.code === 200) {
            article.value = response.data.data
        } else {
            console.error('获取文章详情失败:', response.data.message)
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
        // 确保滚动监听正确添加
        if (markdownRef.value) {
            // 先移除可能存在的监听，避免重复添加
            markdownRef.value.removeEventListener('scroll', handleScroll)
            // 重新添加滚动监听
            markdownRef.value.addEventListener('scroll', handleScroll)
        }
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

    // 监听markdown内容容器的滚动事件，而不是window的滚动事件
    if (markdownRef.value) {
        markdownRef.value.addEventListener('scroll', handleScroll)
    }
})

// 组件卸载前移除滚动监听
onUnmounted(() => {
    // 移除markdown内容容器的滚动监听
    if (markdownRef.value) {
        markdownRef.value.removeEventListener('scroll', handleScroll)
    }
})
</script>

<style scoped>
.topic-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 80vh;
    width: 100%;
    text-align: left;
    padding: 0;
    margin: 0;
}

.topic-container .el-scrollbar__view {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    width: 100%;
    max-width: 1000px; /* 限制最大宽度 */
}

/* 内容和锚点的布局 */
.content-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    max-width: 1000px; /* 限制最大宽度，保持良好的阅读体验 */
    margin: 0;
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
    text-align: left;
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