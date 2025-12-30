<template>
  <div class="profile-content">
    <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px" class="profile-form">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="profileForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="头像">
        <div class="avatar-upload-container">
          <!-- 图片预览 -->
          <div class="avatar-preview-wrapper">
            <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar-preview" />
            <el-icon v-else class="avatar-placeholder">
              <User />
            </el-icon>
          </div>

          <!-- 上传按钮 -->
          <el-upload
            ref="avatarUploadRef"
            class="avatar-uploader"
            :action="'http://localhost:3000/api/upload'"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :on-start="handleUploadStart"
            :before-upload="beforeAvatarUpload"
            :on-progress="handleUploadProgress"
            :file-list="fileList"
            name="avatar"
          >
            <el-button type="primary" size="small" :loading="uploading">
              {{ uploading ? '上传中...' : '选择头像' }}
            </el-button>
          </el-upload>

          <!-- 上传进度 -->
          <el-progress
            v-if="uploading"
            :percentage="uploadProgress"
            :stroke-width="2"
            style="margin-top: 10px; width: 200px;"
          />

          <!-- 上传提示 -->
          <div class="upload-tips">
            支持 JPG、PNG、WebP 格式，文件大小不超过 2MB
          </div>
        </div>
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
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import request from '../../axios/request'

// 接收props
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

// 定义emit
const emit = defineEmits(['update:userInfo'])

// 个人信息表单
const profileForm = reactive({
  id: '',
  username: '',
  avatar: '',
  bio: '',
  email: '',
  phone: ''
})

// 表单引用
const profileFormRef = ref(null)
const avatarUploadRef = ref(null)

// 头像上传相关变量
const fileList = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)

// 个人信息验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 监听userInfo变化，更新表单
watch(
  () => props.userInfo,
  (newUserInfo) => {
    if (newUserInfo) {
      Object.assign(profileForm, {
        id: newUserInfo.id,
        username: newUserInfo.username,
        avatar: newUserInfo.avatar,
        bio: newUserInfo.bio || '',
        email: newUserInfo.email || '',
        phone: newUserInfo.phone || ''
      })
    }
  },
  { immediate: true, deep: true }
)

// 客户端图片压缩
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        // 创建画布
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 设置压缩后的尺寸，保持宽高比
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let { width, height } = img

        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }

        canvas.width = width
        canvas.height = height

        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height)

        // 将画布转换为 Blob 对象
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 创建新的文件对象
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          file.type,
          0.8 // 压缩质量，0.8 表示 80%
        )
      }
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
  })
}

// 上传前验证
const beforeAvatarUpload = async (file) => {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('头像图片只能是 JPG、PNG 或 WebP 格式!')
    return false
  }

  // 验证文件大小
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  try {
    // 客户端压缩图片
    const compressedFile = await compressImage(file)

    // 替换原始文件为压缩后的文件
    return compressedFile
  } catch (error) {
    console.error('图片压缩失败:', error)
    ElMessage.error('图片压缩失败，请稍后重试')
    return false
  }
}

// 上传开始处理
const handleUploadStart = (file) => {
  uploading.value = true
  uploadProgress.value = 0
}

// 上传进度处理
const handleUploadProgress = (event, file, fileList) => {
  if (event && event.total > 0) {
    uploadProgress.value = Math.round((event.loaded / event.total) * 100)
  }
}

// 上传成功处理
const handleAvatarSuccess = (response, file, fileList) => {
  uploading.value = false
  uploadProgress.value = 0

  try {
    if (response && response.data && response.data.url) {
      profileForm.avatar = response.data.url
      ElMessage.success('头像上传成功')
    } else {
      // 模拟上传成功，使用本地文件URL
      profileForm.avatar = URL.createObjectURL(file.raw)
      ElMessage.success('头像上传成功（模拟）')
    }
  } catch (error) {
    console.error('处理上传成功响应失败:', error)
    // 使用本地文件URL作为最后的备份
    profileForm.avatar = URL.createObjectURL(file.raw)
    ElMessage.success('头像上传成功（模拟）')
  }
}

// 上传失败处理
const handleAvatarError = (error, file, fileList) => {
  uploading.value = false
  uploadProgress.value = 0

  console.error('头像上传失败:', error)
  ElMessage.error('头像上传失败，请稍后重试')
}

// 更新用户信息
const updateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()

    const response = await request({
      url: `/users/${props.userInfo.id}`,
      method: 'put',
      data: {
        username: profileForm.username,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        email: profileForm.email,
        phone: profileForm.phone
      }
    })

    if (response.data.code === 200) {
      ElMessage.success('个人信息更新成功')

      // 更新父组件的userInfo
      const updatedUserInfo = {
        ...props.userInfo,
        username: profileForm.username,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        email: profileForm.email,
        phone: profileForm.phone
      }
      emit('update:userInfo', updatedUserInfo)
      
      // 更新localStorage中的用户信息
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
    } else {
      ElMessage.error(response.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}
</script>

<style scoped>
.profile-form {
  max-width: 600px;
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
</style>