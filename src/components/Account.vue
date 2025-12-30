<template>
  <div class="account-container">
    <div class="account-header">
      <div class="user-profile">
        <el-avatar :size="100" :src="userInfo.avatar" />
        <div class="user-info">
          <h2>{{ userInfo.username }}</h2>
          <div style="display: flex;flex-direction: row;">
            <div style="min-width: 200px;">
              <p class="user-role">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
              <p class="join-date">加入时间：{{ formatDate(userInfo.createTime || '2023-01-01') }}</p>
            </div>
            <div style="min-width: 200px;">
              <p>邮箱：{{ userInfo.email || '未设置' }}</p>
              <p>手机号：{{ userInfo.phone || '未设置' }}</p>
            </div>
          </div>
          <p>简介：{{ userInfo.bio || '未设置' }}</p>
        </div>
      </div>
    </div>

    <div class="account-content">
      <el-tabs v-model="activeTab" class="account-tabs">
        <el-tab-pane label="个人信息" name="profile">
          <PersonalInfo v-model:user-info="userInfo" />
        </el-tab-pane>

        <el-tab-pane label="我的文章" name="articles">
          <MyArticles :user-id="userInfo.id" />
        </el-tab-pane>

        <el-tab-pane label="我的评论" name="comments">
          <MyComments :user-id="userInfo.id" />
        </el-tab-pane>

        <el-tab-pane label="账户设置" name="settings">
          <AccountSettings :user-id="userInfo.id" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import request from '../axios/request'
import MyArticles from './user/MyArticles.vue'
import PersonalInfo from './user/PersonalInfo.vue'
import MyComments from './user/MyComments.vue'
import AccountSettings from './user/AccountSettings.vue'

const router = useRouter()

// 激活的标签页
const activeTab = ref('profile')

// 用户信息
const userInfo = reactive({
  id: '',
  username: '',
  avatar: '',
  role: '',
  createTime: '',
  email: '',
  phone: '',
  bio: ''
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 获取当前用户信息
const fetchUserInfo = async () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const parsedUserInfo = JSON.parse(userInfoStr)
      Object.assign(userInfo, parsedUserInfo)
      
      // 调用API获取最新的用户信息，确保数据同步
      try {
        const response = await request({
          url: `/users/${userInfo.id}`,
          method: 'get'
        })
        
        if (response.data.code === 200 && response.data.data) {
          // 更新userInfo对象
          Object.assign(userInfo, response.data.data)
          // 更新localStorage，确保数据持久化
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
        }
      } catch (apiError) {
        console.error('从API获取最新用户信息失败:', apiError)
        // API调用失败时，继续使用localStorage中的数据
      }
    } else {
      ElMessage.error('未找到用户信息')
      router.push('/login')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
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

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.avatar-preview-wrapper {
  width: 150px;
  height: 150px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  margin-bottom: var(--spacing-sm);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all var(--transition-normal);
}

.avatar-preview:hover {
  transform: scale(1.02);
}

.avatar-placeholder {
  font-size: 64px;
  color: var(--text-muted);
}

.avatar-uploader {
  margin-bottom: var(--spacing-sm);
}

.upload-tips {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
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

.articles-table,
.comments-table {
  margin-bottom: var(--spacing-xl);
  height: 46vh;
  --el-table-tr-bg-color: var(--bg-primary);
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

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

:deep(.el-divider) {
  border-color: var(--border-color);
}
</style>