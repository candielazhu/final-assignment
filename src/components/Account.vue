<template>
  <div class="account-container">
    <div class="account-header">
      <div class="user-profile">
        <el-avatar :size="100" :src="userInfo.avatar" />
        <div class="user-info">
          <h2>{{ userInfo.username }}</h2>
          <p class="user-role">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
          <p class="join-date">加入时间：{{ formatDate(userInfo.createTime || '2023-01-01') }}</p>
        </div>
      </div>
    </div>

    <div class="account-content">
      <el-tabs v-model="activeTab" class="account-tabs">
        <el-tab-pane label="个人信息" name="profile">
          <div class="profile-content">
            <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px" class="profile-form">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                >
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="简介">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下自己吧"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateProfile">更新信息</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的文章" name="articles">
          <div class="articles-content">
            <div class="articles-actions">
              <el-button type="primary" @click="navigateToWrite">写文章</el-button>
            </div>
            <el-table :data="userArticles" style="width: 100%" class="articles-table">
              <el-table-column prop="title" label="标题" width="300" show-overflow-tooltip />
              <el-table-column prop="summary" label="摘要" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'published' ? 'success' : 'info'">
                    {{ row.status === 'published' ? '已发布' : '草稿' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column prop="reading" label="浏览" width="80" />
              <el-table-column prop="comment_count" label="评论" width="80" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button size="small" @click="viewArticle(row.id)">查看</el-button>
                  <el-button size="small" type="primary" @click="editArticle(row.id)">编辑</el-button>
                  <el-popconfirm
                    title="确定要删除这篇文章吗？"
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    @confirm="deleteArticle(row.id)"
                  >
                    <template #reference>
                      <el-button size="small" type="danger">删除</el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container" v-if="totalArticles > 0">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalArticles"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的评论" name="comments">
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
            <div class="pagination-container" v-if="totalComments > 0">
              <el-pagination
                v-model:current-page="commentCurrentPage"
                v-model:page-size="commentPageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalComments"
                @size-change="handleCommentSizeChange"
                @current-change="handleCommentCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="账户设置" name="settings">
          <div class="settings-content">
            <el-form ref="settingsFormRef" :model="settingsForm" :rules="settingsRules" label-width="120px" class="settings-form">
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="settingsForm.newPassword" type="password" placeholder="留空则不修改密码" />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="settingsForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePassword">更新密码</el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
            <div class="danger-zone">
              <h3>危险操作</h3>
              <el-button type="danger" @click="handleAccountDeletion">删除账户</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../axios/request'

const router = useRouter()

// 激活的标签页
const activeTab = ref('profile')

// 用户信息
const userInfo = reactive({
  username: '',
  avatar: '',
  role: '',
  createTime: ''
})

// 个人信息表单
const profileForm = reactive({
  username: '',
  avatar: '',
  bio: ''
})

// 个人信息验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 设置表单
const settingsForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 设置验证规则
const settingsRules = {
  newPassword: [
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 表单引用
const profileFormRef = ref(null)
const settingsFormRef = ref(null)

// 文章数据
const userArticles = ref([])
const totalArticles = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 评论数据
const userComments = ref([])
const totalComments = ref(0)
const commentCurrentPage = ref(1)
const commentPageSize = ref(10)

// 获取当前用户信息
const fetchUserInfo = async () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const parsedUserInfo = JSON.parse(userInfoStr)
      Object.assign(userInfo, parsedUserInfo)
      Object.assign(profileForm, {
        username: parsedUserInfo.username,
        avatar: parsedUserInfo.avatar,
        bio: parsedUserInfo.bio || ''
      })
    } else {
      ElMessage.error('未找到用户信息')
      router.push('/login')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取用户文章
const fetchUserArticles = async () => {
  try {
    const response = await request({
      url: '/articles/user',
      method: 'get',
      params: {
        user_id: userInfo.id,
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    
    if (response.data.code === 200) {
      userArticles.value = response.data.data.list || []
      totalArticles.value = response.data.data.total || 0
    } else {
      ElMessage.error('获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  }
}

// 获取用户评论
const fetchUserComments = async () => {
  try {
    const response = await request({
      url: '/comments/user',
      method: 'get',
      params: {
        user_id: userInfo.id,
        page: commentCurrentPage.value,
        pageSize: commentPageSize.value
      }
    })
    
    if (response.data.code === 200) {
      userComments.value = response.data.data.list || []
      totalComments.value = response.data.data.total || 0
    } else {
      ElMessage.error('获取评论列表失败')
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  }
}

// 更新用户信息
const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    
    const response = await request({
      url: `/users/${userInfo.id}`,
      method: 'put',
      data: {
        username: profileForm.username,
        avatar: profileForm.avatar,
        bio: profileForm.bio
      }
    })
    
    if (response.data.code === 200) {
      ElMessage.success('个人信息更新成功')
      
      // 更新本地存储
      const updatedUserInfo = {
        ...userInfo,
        username: profileForm.username,
        avatar: profileForm.avatar,
        bio: profileForm.bio
      }
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
      
      // 更新全局状态
      Object.assign(userInfo, updatedUserInfo)
    } else {
      ElMessage.error(response.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 更新密码
const updatePassword = async () => {
  if (!settingsFormRef.value) return
  
  try {
    await settingsFormRef.value.validate()
    
    if (!settingsForm.newPassword) {
      ElMessage.warning('请输入新密码')
      return
    }
    
    const response = await request({
      url: `/users/${userInfo.id}/password`,
      method: 'put',
      data: {
        oldPassword: '', // 实际应用中需要用户提供旧密码
        newPassword: settingsForm.newPassword
      }
    })
    
    if (response.data.code === 200) {
      ElMessage.success('密码更新成功')
      resetPasswordForm()
    } else {
      ElMessage.error(response.data.message || '更新密码失败')
    }
  } catch (error) {
    console.error('更新密码失败:', error)
    ElMessage.error('更新密码失败，请稍后重试')
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  settingsForm.newPassword = ''
  settingsForm.confirmPassword = ''
  if (settingsFormRef.value) {
    settingsFormRef.value.clearValidate()
  }
}

// 验证确认密码
function validateConfirmPassword(rule, value, callback) {
  if (value !== settingsForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 头像上传成功
const handleAvatarSuccess = (response, file, fileList) => {
  profileForm.avatar = URL.createObjectURL(file.raw)
}

// 上传头像前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG/GIF 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
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

// 处理文章分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchUserArticles()
}

// 处理文章当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserArticles()
}

// 处理评论分页大小变化
const handleCommentSizeChange = (val) => {
  commentPageSize.value = val
  commentCurrentPage.value = 1
  fetchUserComments()
}

// 处理评论当前页变化
const handleCommentCurrentChange = (val) => {
  commentCurrentPage.value = val
  fetchUserComments()
}

// 处理账户删除
const handleAccountDeletion = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除您的账户吗？此操作不可撤销，所有数据将被永久删除。',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await request({
      url: `/users/${userInfo.id}`,
      method: 'delete'
    })
    
    if (response.data.code === 200) {
      ElMessage.success('账户已删除')
      
      // 清除本地存储
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userInfo')
      document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除账户失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 组件挂载时获取用户信息和数据
onMounted(() => {
  fetchUserInfo()
  fetchUserArticles()
  fetchUserComments()
})
</script>

<style scoped>
.account-container {
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 80vh;
  transition: all var(--transition-normal);
}

.account-header {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--border-color);
  text-align: left;
  transition: all var(--transition-normal);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 24px;
  color: var(--text-primary);
  font-weight: 600;
}

.user-role {
  font-size: 16px;
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0;
}

.join-date {
  font-size: 14px;
  color: var(--text-muted);
  margin: var(--spacing-xs) 0;
}

.account-content {
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.account-tabs {
  background-color: var(--bg-tertiary);
}

:deep(.el-tabs__item) {
  color: var(--text-primary);
  transition: all var(--transition-normal);
  margin-left: var(--spacing-xl);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

:deep(.el-tab-pane) {
  padding: var(--spacing-xl);
}

.profile-form {
  max-width: 600px;
}

.avatar-uploader {
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
  width: 100px;
  height: 100px;
}

.avatar-uploader:hover {
  border-color: var(--primary-color);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: var(--text-muted);
  width: 100px;
  height: 100px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-normal);
}

.articles-actions {
  margin-bottom: var(--spacing-xl);
  text-align: left;
}

.articles-table, .comments-table {
  margin-bottom: var(--spacing-xl);
}

.pagination-container {
  text-align: center;
  margin-top: var(--spacing-xl);
}

.settings-form {
  max-width: 500px;
  margin-bottom: var(--spacing-xl);
}

.danger-zone {
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.danger-zone h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.el-table) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  transition: all var(--transition-normal);
}

:deep(.el-table th) {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

:deep(.el-table td) {
  border-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-table tr:hover > td) {
  background-color: var(--bg-hover);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-sm);
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
}

:deep(.el-upload-dragger) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-md);
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
}

:deep(.el-pagination button) {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

:deep(.el-pagination button:hover) {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-pagination .el-pager li) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

:deep(.el-pagination .el-pager li:hover) {
  color: var(--primary-color);
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: var(--primary-color);
  color: white;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

:deep(.el-divider) {
  border-color: var(--border-color);
}
</style>