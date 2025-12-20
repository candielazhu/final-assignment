<template>
    <div class="header">
        <el-avatar :icon="UserFilled" />
        <el-input v-model="input" style="width: 480px" placeholder="搜索" />
        <div>
            <el-button type="primary" @click="logout" plain>退出登录</el-button>
            <el-switch v-model="value1" @change="handleThemeChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 主题切换开关状态
const value1 = ref(true)
const input = ref('')

// 主题切换函数
const toggleTheme = () => {
    const isDark = value1.value
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

// 监听主题开关变化
const handleThemeChange = () => {
    toggleTheme()
}

const logout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn')
    document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    ElMessage.success('已退出登录')
    router.push('/login')
}

// 初始化主题
onMounted(() => {
    // 从本地存储获取主题偏好，否则使用系统偏好
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme ? savedTheme === 'dark' : systemDark
    
    value1.value = isDark
    toggleTheme()
})
</script>

<style scoped>
.header {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
}
</style>