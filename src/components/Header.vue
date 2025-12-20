<template>
    <div class="header">
        <div>
            <el-switch v-model="value1" @change="handleThemeChange" />
        </div>
        <div>
            <el-input v-model="input" style="width: 480px" placeholder="搜索" @keyup.enter="handleSearch" />
            <el-button @click="handleSearch" style="margin-left: 10px;">
                <el-icon>
                    <Search />
                </el-icon>
            </el-button>
        </div>
        <div class="user">
            <el-popover placement="bottom" trigger="hover" width="120">
                <template #reference>
                    <el-avatar :icon="UserFilled" :src="userInfo.avatar" style="cursor: pointer;" />
                </template>
                <div style="text-align: center; padding: 10px 0;">
                    <el-menu class="el-menu-vertical-demo" @select="handleSelect">
                        <el-menu-item-group>
                            <el-menu-item index="1" @click="handleAuthButtonClick">
                                {{ isLoggedIn ? '退出登录' : '登录' }}
                            </el-menu-item>
                            <el-menu-item index="2" v-if="isLoggedIn">
                                个人中心
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-menu>
                </div>
            </el-popover>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Search } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 接收父组件传递的Props
const props = defineProps({
    userInfo: {
        type: Object,
        default: () => ({
            username: '',
            avatar: '',
            role: ''
        })
    }
})

// 定义发送给父组件的事件
const emit = defineEmits(['search', 'theme-change'])

// 注入全局状态
const appState = inject('appState', null)

// 主题切换开关状态
const value1 = ref(true)
const input = ref('')
// 登录状态
const isLoggedIn = ref(false)

// 检查登录状态
const checkLoginStatus = () => {
    const cookieLoggedIn = document.cookie.includes('isLoggedIn=true')
    const localStorageLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    isLoggedIn.value = cookieLoggedIn || localStorageLoggedIn
    
    // 更新全局状态
    if (appState) {
        appState.isLoggedIn.value = isLoggedIn.value
    }
}

// 主题切换函数
const toggleTheme = () => {
    const isDark = value1.value
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    
    // 通知父组件主题变化
    emit('theme-change', isDark)
}

// 监听主题开关变化
const handleThemeChange = () => {
    toggleTheme()
}

// 搜索事件处理
const handleSearch = () => {
    if (input.value.trim()) {
        // 发送搜索事件给父组件
        emit('search', input.value.trim())
    }
}

// 登录/退出按钮点击事件
const handleAuthButtonClick = () => {
    if (isLoggedIn.value) {
        // 执行退出登录逻辑
        logout()
    } else {
        // 跳转到登录页面
        router.push('/login')
    }
}

const logout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn')
    document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    ElMessage.success('已退出登录')
    
    // 更新登录状态
    checkLoginStatus()
    
    // 使用window.location.href跳转到首页并刷新
    window.location.href = '/'
}

// 系统主题变化监听器
let themeMediaQuery = null
let themeChangeListener = null

// 初始化主题和登录状态
onMounted(() => {
    // 从本地存储获取主题偏好，否则使用系统偏好
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme ? savedTheme === 'dark' : systemDark

    value1.value = isDark
    toggleTheme()

    // 检查登录状态
    checkLoginStatus()

    // 监听系统主题变化
    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    themeChangeListener = (e) => {
        if (!localStorage.getItem('theme')) { // 只有在用户未设置主题时才响应系统变化
            value1.value = e.matches
            toggleTheme()
        }
    }
    themeMediaQuery.addEventListener('change', themeChangeListener)
})

// 组件卸载前清理资源
onUnmounted(() => {
    // 移除系统主题变化监听器
    if (themeMediaQuery && themeChangeListener) {
        themeMediaQuery.removeEventListener('change', themeChangeListener)
    }
})

// 监听路由变化，更新登录状态
watch(() => route.path, () => {
    checkLoginStatus()
})

// 监听用户信息变化
watch(() => props.userInfo, (newInfo) => {
    console.log('Header 收到用户信息更新:', newInfo)
}, { deep: true })
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