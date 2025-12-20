<template>
    <div class="index-container">
        <Header 
            :user-info="userInfo"
            @search="handleSearch"
            @theme-change="handleThemeChange"
        />
        <div class="content">
            <Aside 
                :menu-active="currentMenuActive"
                @menu-select="handleMenuSelect"
            />
            <router-view style="width: 60%;"/>
        </div>
    </div>
</template>

<script setup>
import { ref, provide, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Aside from './Aside.vue'
import Header from './Header.vue'

const router = useRouter()

// 全局状态
const isLoggedIn = ref(false)
const userInfo = reactive({
    username: '',
    avatar: '',
    role: ''
})

// 菜单状态
const currentMenuActive = ref('2')

// 检查登录状态
const checkLoginStatus = () => {
    const cookieLoggedIn = document.cookie.includes('isLoggedIn=true')
    const localStorageLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    isLoggedIn.value = cookieLoggedIn || localStorageLoggedIn
    
    // 模拟用户信息
    if (isLoggedIn.value) {
        userInfo.username = '当前用户'
        userInfo.avatar = ''
        userInfo.role = 'user'
    } else {
        userInfo.username = ''
        userInfo.avatar = ''
        userInfo.role = ''
    }
}

// 搜索事件处理
const handleSearch = (keyword) => {
    console.log('Index 收到搜索请求:', keyword)
    // 这里可以实现全局搜索逻辑
    router.push({ path: '/search', query: { keyword } })
}

// 主题变化处理
const handleThemeChange = (isDark) => {
    console.log('Index 收到主题变化:', isDark)
}

// 菜单选择处理
const handleMenuSelect = (key) => {
    console.log('Index 收到菜单选择:', key)
    currentMenuActive.value = key
}

// 提供全局状态
provide('appState', {
    isLoggedIn,
    userInfo,
    currentMenuActive
})

// 初始化
onMounted(() => {
    checkLoginStatus()
})
</script>

<style>
.index-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: calc(100vh - 60px);
    background-color: var(--bg-primary);
}
</style>