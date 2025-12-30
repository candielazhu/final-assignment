<template>
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
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../axios/request'

// 接收props
const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()

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
const settingsFormRef = ref(null)

// 验证确认密码
function validateConfirmPassword(rule, value, callback) {
  if (value !== settingsForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
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
      url: `/users/${props.userId}/password`,
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
      url: `/users/${props.userId}`,
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
</script>

<style scoped>
.settings-content {
  padding: var(--spacing-xl);
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
</style>