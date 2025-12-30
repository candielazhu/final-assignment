<template>
  <div class="comments-content">
    <el-table :data="userComments" style="width: 100%" class="comments-table">
      <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
      <el-table-column prop="article_title" label="所属文章" show-overflow-tooltip />
      <el-table-column prop="created_at" label="评论时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="viewArticle(row.article_id)">查看文章</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../../axios/request'

// 接收props
const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()

// 评论数据
const userComments = ref([])
const totalComments = ref(0)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 查看文章
const viewArticle = (articleId) => {
  router.push(`/topic/${articleId}`)
}

// 获取用户评论
const fetchUserComments = async () => {
  try {
    if (!props.userId) return

    const response = await request({
      url: '/comments/user',
      method: 'get',
      params: {
        user_id: props.userId
      }
    })

    if (response.data.code === 200) {
      userComments.value = response.data.data.list || []
      totalComments.value = response.data.data.total || 0
    } else {
      ElMessage.error('获取评论列表失败')
      userComments.value = []
      totalComments.value = 0
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    // 静默处理，不影响主功能
    userComments.value = []
    totalComments.value = 0
  }
}

// 监听userId变化，重新获取评论
watch(
  () => props.userId,
  (newUserId) => {
    if (newUserId) {
      fetchUserComments()
    }
  },
  { immediate: true }
)

// 组件挂载时获取评论
onMounted(() => {
  fetchUserComments()
})
</script>

<style scoped>

.comments-table {
  margin-bottom: var(--spacing-xl);
  height: 46vh;
  --el-table-tr-bg-color: var(--bg-primary);
}
</style>