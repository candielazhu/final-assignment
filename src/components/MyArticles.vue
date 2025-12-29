<template>
  <div class="articles-content">
    <div class="articles-actions">
      <el-button type="primary" @click="navigateToWrite" style="margin-bottom: var(--spacing-md);">写文章</el-button>
      <div class="articles-filters" style="margin-left: auto; display: flex; gap: var(--spacing-sm);">
        <el-select v-model="articleStatusFilter" placeholder="筛选状态" size="small" @change="handleFilterChange">
          <el-option label="全部" value="all" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
        <el-select v-model="articleSortBy" placeholder="排序字段" size="small" @change="handleSortChange">
          <el-option label="创建时间" value="created_at" />
          <el-option label="浏览量" value="reading" />
          <el-option label="评论数" value="comment_count" />
        </el-select>
        <el-select v-model="articleSortOrder" placeholder="排序方向" size="small" @change="handleSortChange">
          <el-option label="升序" value="asc" />
          <el-option label="降序" value="desc" />
        </el-select>
      </div>
    </div>

    <!-- 文章统计 -->
    <div class="articles-stats" style="margin-bottom: var(--spacing-xl); display: flex; gap: var(--spacing-xl);">
      <el-statistic title="已发布文章" :value="articleStats.published" :precision="0">
        <template #suffix>
          <el-tag type="success" size="small">篇</el-tag>
        </template>
      </el-statistic>
      <el-statistic title="草稿文章" :value="articleStats.draft" :precision="0">
        <template #suffix>
          <el-tag type="info" size="small">篇</el-tag>
        </template>
      </el-statistic>
    </div>

    <!-- 加载状态 -->
    <el-skeleton :rows="5" animated v-if="isLoadingArticles" style="margin: var(--spacing-lg) 0;" />

    <!-- 非加载状态 -->
    <template v-else>
      <!-- 文章列表 -->
      <el-table v-if="totalArticles > 0" :data="userArticles" style="width: 100%" class="articles-table"
        v-loading="isLoadingArticles">
        <el-table-column prop="title" label="标题" width="200" show-overflow-tooltip />
        <el-table-column prop="summary" label="摘要" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }" style="background-color: black;">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="110">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="reading" label="浏览" width="60" />
        <el-table-column prop="comment_count" label="评论" width="60" />
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button size="small" @click="viewArticle(row.id)">查看</el-button>
            <el-button size="small" type="primary" @click="editArticle(row.id)">编辑</el-button>
            <el-popconfirm title="确定要删除这篇文章吗？" confirm-button-text="确定" cancel-button-text="取消"
              @confirm="deleteArticle(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty description="暂无文章" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../axios/request'

const router = useRouter()

// 接收用户ID作为props，可选
const props = defineProps({
  userId: {
    type: String,
    required: false
  }
})

// 获取当前用户ID的方法
const getCurrentUserId = () => {
  // 如果外部提供了userId，则使用外部提供的
  if (props.userId) {
    return props.userId
  }

  // 否则从localStorage中获取当前用户ID
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.id || ''
    }
  } catch (error) {
    console.error('获取当前用户ID失败:', error)
  }
  return ''
}

// 文章数据
const userArticles = ref([])
const totalArticles = ref(0)
const articleStatusFilter = ref('all') // 筛选状态：all, published, draft
const articleSortBy = ref('created_at') // 排序字段：created_at, reading, comment_count
const articleSortOrder = ref('desc') // 排序方向：asc, desc
const isLoadingArticles = ref(false) // 加载状态
const articleStats = reactive({ // 文章统计
  published: 0,
  draft: 0
})

// 获取用户文章
const fetchUserArticles = async () => {
  try {
    isLoadingArticles.value = true

    // 使用现有的搜索API端点来获取用户文章
    const params = {
      user_id: getCurrentUserId(),
      only_current_user: true,
      sort_by: articleSortBy.value,
      sort_order: articleSortOrder.value
    }

    // 添加状态筛选
    if (articleStatusFilter.value !== 'all') {
      params.status = articleStatusFilter.value
    }

    const response = await request({
      url: '/articles',
      method: 'get',
      params: params
    })

    if (response.data.code === 200) {
      // API返回的数据结构是response.data.data和response.data.total
      userArticles.value = response.data.data || []
      totalArticles.value = response.data.total || 0

      // 前端计算统计信息
      articleStats.published = userArticles.value.filter(article => article.status === 'published').length
      articleStats.draft = userArticles.value.filter(article => article.status === 'draft').length
    } else {
      ElMessage.error('获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    isLoadingArticles.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 跳转到写文章页面
const navigateToWrite = () => {
  router.push('/write')
}

// 查看文章详情
const viewArticle = (id) => {
  router.push(`/topic/${id}`)
}

// 编辑文章
const editArticle = (id) => {
  router.push(`/write?id=${id}`)
}

// 删除文章
const deleteArticle = async (id) => {
  try {
    const response = await request({
      url: `/articles/${id}`,
      method: 'delete'
    })

    if (response.data.code === 200) {
      ElMessage.success('文章删除成功')
      fetchUserArticles() // 重新获取文章列表
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除文章失败:', error)
    ElMessage.error('删除失败，请稍后重试')
  }
}

// 处理文章筛选变化
const handleFilterChange = () => {
  fetchUserArticles()
}

// 处理文章排序变化
const handleSortChange = () => {
  fetchUserArticles()
}

// 组件挂载时获取文章数据
onMounted(() => {
  fetchUserArticles()
})
</script>

<style scoped>
.articles-actions {
  margin-bottom: var(--spacing-xl);
  text-align: left;
}

.articles-table {
  margin-bottom: var(--spacing-xl);
  height: 46vh;
  --el-table-tr-bg-color: var(--bg-primary);
}
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
</style>