<template>
    <div class="search-result-container">
        <!-- 搜索条件区域 -->
        <div class="search-filters">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="标题">
                    <el-input v-model="searchForm.title" placeholder="输入标题关键词" clearable style="width: 200px"
                        @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="副标题">
                    <el-input v-model="searchForm.subtitle" placeholder="输入副标题关键词" clearable style="width: 200px"
                        @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="用户">
                    <el-input v-model="searchForm.username" placeholder="输入用户名或ID" clearable style="width: 150px"
                        @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch" :loading="isSearching">搜索</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 搜索结果统计和排序 -->
        <div class="result-header">
            <div class="result-count">
                找到 <span class="highlight">{{ totalResults }}</span> 条相关结果
            </div>
            <div class="sort-options">
                <span>排序方式：</span>
                <el-select v-model="sortBy" placeholder="请选择" size="small" @change="handleSortChange"
                    style="width: 90px;">
                    <el-option label="相关度" value="relevance" />
                    <el-option label="最新发布" value="createdAt" />
                    <el-option label="浏览量" value="views" />
                </el-select>
            </div>
        </div>

        <!-- 搜索结果列表 -->
        <div v-if="results.length > 0 && !isSearching">
            <el-scrollbar class="result-scrollbar">
                <div class="result-list">
                    <div v-for="result in results" :key="result.id" class="result-item" @click="goToArticle(result.id)">
                        <div class="result-title">
                            <h3 v-html="highlightKeywords(result.title, searchKeywords)"></h3>
                        </div>
                        <div class="result-subtitle" v-if="result.subtitle">
                            <p v-html="highlightKeywords(result.subtitle, searchKeywords)"></p>
                        </div>
                        <div class="result-meta">
                            <span class="author">{{ result.username }}</span>
                            <span class="time">{{ formatDate(result.createdAt) }}</span>
                            <span class="views">{{ result.views || 0 }} 浏览</span>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <!-- 搜索中状态 -->
        <div class="no-results" v-else-if="isSearching">
            <el-empty description="正在搜索...">
                <template #image>
                    <el-icon class="is-loading">
                        <Loading />
                    </el-icon>
                </template>
            </el-empty>
        </div>

        <!-- 无结果提示 -->
        <div class="no-results" v-else-if="totalResults === 0 && hasSearched">
            <el-empty>
                <template #image>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
                <template #description>
                    <div>
                        <p>未找到相关结果</p>
                        <div class="suggestions" v-if="suggestions.length > 0">
                            <p>您可能想要查找：</p>
                            <el-tag v-for="suggestion in suggestions" :key="suggestion" type="info"
                                @click="handleSuggestionClick(suggestion)" style="margin: 2px; cursor: pointer;">
                                {{ suggestion }}
                            </el-tag>
                        </div>
                    </div>
                </template>
            </el-empty>
        </div>

        <!-- 搜索历史 -->
        <div class="search-history" v-if="showHistory && searchHistory.length > 0 && !hasSearched">
            <div class="history-header">
                <h4>搜索历史</h4>
                <el-button link size="small" @click="clearHistory">清空</el-button>
            </div>
            <div class="history-tags">
                <el-tag v-for="(item, index) in searchHistory" :key="index" @click="handleHistoryClick(item)" closable
                    @close="removeHistoryItem(index)" style="cursor: pointer; margin: 4px;">
                    {{ item }}
                </el-tag>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Loading } from '@element-plus/icons-vue'
import request from '../axios/request'

const router = useRouter()
const route = useRoute()

// 搜索表单
const searchForm = ref({
    title: '',
    subtitle: '',
    username: ''
})

// 搜索状态
const isSearching = ref(false)
const hasSearched = ref(false)
const results = ref([])
const totalResults = ref(0)
const sortBy = ref('relevance')

// 搜索关键词
const searchKeywords = ref('')

// 搜索历史
const searchHistory = ref([])
const showHistory = ref(true)

// 搜索建议
const suggestions = ref(['Vue 3', '前端开发', 'JavaScript', 'Element Plus', 'Vue Router'])

// 高亮关键词
const highlightKeywords = (text, keywords) => {
    const safeText = typeof text === 'string' ? text : ''
    if (!keywords) return safeText
    try {
        const regex = new RegExp(`(${keywords})`, 'gi')
        return safeText.replace(regex, '<span class="highlight">$1</span>')
    } catch (error) {
        console.error('高亮关键词失败:', error)
        return safeText
    }
}

// 格式化日期
const formatDate = (dateString) => {
    try {
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? '' : date.toLocaleString()
    } catch (error) {
        console.error('格式化日期失败:', error)
        return ''
    }
}

// 跳转到文章详情
const goToArticle = (articleId) => {
    try {
        router.push(`/topic/${articleId}`)
    } catch (error) {
        console.error('跳转失败:', error)
        ElMessage.error('跳转失败，请重试')
    }
}

// 处理搜索
const handleSearch = async () => {
    console.log('====== 前端搜索开始 ======')
    console.log('搜索表单:', searchForm.value)

    // 检查是否有搜索条件
    const hasSearchTerm = searchForm.value.title || searchForm.value.subtitle || searchForm.value.username
    if (!hasSearchTerm) {
        ElMessage.warning('请输入至少一个搜索条件')
        return
    }

    isSearching.value = true
    hasSearched.value = true
    showHistory.value = false

    // 构建搜索关键词
    const keywords = [
        searchForm.value.title,
        searchForm.value.subtitle,
        searchForm.value.username
    ].filter(item => item).join(' ')

    searchKeywords.value = keywords
    console.log('搜索关键词:', keywords)

    // 保存搜索历史
    if (keywords) {
        addToSearchHistory(keywords)
    }

    try {
        // 获取当前用户ID
        let currentUserId = null
        try {
            const userInfo = localStorage.getItem('userInfo')
            if (userInfo) {
                const parsed = JSON.parse(userInfo)
                currentUserId = parsed.id
            }
        } catch (parseError) {
            console.error('解析用户信息失败:', parseError)
        }

        console.log('当前用户ID:', currentUserId)

        // 构建请求参数
        const params = {
            sortBy: sortBy.value
        }

        if (searchForm.value.title) params.title = searchForm.value.title
        if (searchForm.value.subtitle) params.subtitle = searchForm.value.subtitle
        if (searchForm.value.username) params.username = searchForm.value.username
        if (currentUserId) params.user_id = currentUserId

        console.log('请求参数:', params)

        // 调用搜索API
        const response = await request.get('/articles/search', { params })

        console.log('搜索响应:', response.data)

        // 确保results始终是数组
        if (response.data && response.data.code === 200) {
            results.value = Array.isArray(response.data.data) ? response.data.data : []
            totalResults.value = typeof response.data.total === 'number' ? response.data.total : 0

            console.log('搜索结果数量:', totalResults.value)

            if (totalResults.value === 0) {
                ElMessage.info('未找到匹配的结果')
            } else {
                ElMessage.success(`找到 ${totalResults.value} 条结果`)
            }
        } else {
            console.error('响应格式错误:', response.data)
            results.value = []
            totalResults.value = 0
            ElMessage.error(response.data?.message || '搜索失败')
        }
    } catch (error) {
        console.error('====== 搜索错误 ======')
        console.error('错误类型:', error.name)
        console.error('错误消息:', error.message)
        console.error('错误详情:', error.response?.data)
        console.error('错误堆栈:', error.stack)
        console.error('====== 错误结束 ======')

        results.value = []
        totalResults.value = 0
        ElMessage.error(error.response?.data?.message || '搜索失败，请稍后重试')
    } finally {
        isSearching.value = false
        console.log('====== 前端搜索结束 ======\n')
    }
}

// 重置表单
const resetForm = () => {
    searchForm.value = {
        title: '',
        subtitle: '',
        username: ''
    }
    results.value = []
    totalResults.value = 0
    hasSearched.value = false
    showHistory.value = true
    searchKeywords.value = ''
}

// 处理排序变化
const handleSortChange = () => {
    if (hasSearched.value) {
        handleSearch()
    }
}

// 搜索历史相关方法
const getSearchHistory = () => {
    try {
        const history = localStorage.getItem('searchHistory')
        if (history) {
            const parsedHistory = JSON.parse(history)
            return Array.isArray(parsedHistory) ? parsedHistory : []
        }
        return []
    } catch (error) {
        console.error('获取搜索历史失败:', error)
        return []
    }
}

const saveSearchHistory = (history) => {
    try {
        localStorage.setItem('searchHistory', JSON.stringify(history))
    } catch (error) {
        console.error('保存搜索历史失败:', error)
    }
}

const addToSearchHistory = (keyword) => {
    try {
        let history = getSearchHistory()
        history = history.filter(item => item !== keyword)
        history.unshift(keyword)
        if (history.length > 10) {
            history = history.slice(0, 10)
        }
        searchHistory.value = history
        saveSearchHistory(history)
    } catch (error) {
        console.error('添加搜索历史失败:', error)
    }
}

const removeHistoryItem = (index) => {
    try {
        let history = getSearchHistory()
        history.splice(index, 1)
        searchHistory.value = history
        saveSearchHistory(history)
    } catch (error) {
        console.error('删除搜索历史失败:', error)
    }
}

const clearHistory = () => {
    try {
        searchHistory.value = []
        localStorage.removeItem('searchHistory')
        ElMessage.success('搜索历史已清空')
    } catch (error) {
        console.error('清除搜索历史失败:', error)
    }
}

const handleHistoryClick = (keyword) => {
    searchForm.value.title = keyword
    handleSearch()
}

// 处理搜索建议点击
const handleSuggestionClick = (suggestion) => {
    searchForm.value.title = suggestion
    handleSearch()
}

// 初始化
onMounted(() => {
    try {
        searchHistory.value = getSearchHistory()

        // 从URL参数获取搜索关键词
        const keyword = route.query.keyword
        if (keyword) {
            searchForm.value.title = keyword
            handleSearch()
        }
    } catch (error) {
        console.error('初始化失败:', error)
    }
})
</script>

<style scoped>
.search-result-container {
    padding: 20px;
}

.search-filters {
    background-color: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

.result-count {
    font-size: 16px;
}

.highlight {
    color: #409eff;
    font-weight: bold;
    background-color: rgba(64, 158, 255, 0.1);
    padding: 2px 4px;
    border-radius: 2px;
}

.sort-options {
    display: flex;
    align-items: center;
    gap: 10px;
}

.result-scrollbar {
    height: 75vh;
    margin-bottom: 20px;
}

.result-list {
    padding-right: 8px;
}

.result-item {
    background-color: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.result-title h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: var(--text-primary);
}

.result-subtitle {
    margin-bottom: 12px;
    color: var(--text-secondary);
}

.result-meta {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: var(--text-tertiary);
}

.no-results {
    text-align: center;
    padding: 60px 0;
    color: var(--text-secondary);
}

.no-results .el-icon {
    font-size: 48px;
}

.search-history {
    margin-top: 30px;
    background-color: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.history-header h4 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
}

.history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.suggestions {
    margin-top: 16px;
}

.suggestions p {
    margin: 0 0 8px 0;
    font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .search-result-container {
        padding: 10px;
    }

    .search-form {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .sort-options {
        width: 100%;
    }

    .result-meta {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }
}
</style>