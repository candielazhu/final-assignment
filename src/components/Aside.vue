<template>
    <div class="aside">
        <el-row class="tac">
            <el-col width="100%">
                <el-menu 
                    :default-active="menuActive" 
                    class="el-menu-vertical-demo" 
                    @open="handleOpen" 
                    @close="handleClose" 
                    @select="handleSelect" 
                    :unique-opened="true" 
                    style="width: 100%"
                >
                    <el-menu-item index="2" @click="navigateTo('Main')">
                        <el-icon>
                            <CoffeeCup />
                        </el-icon>
                        <template #title>话题</template>
                    </el-menu-item>
                    <el-menu-item index="4" @click="navigateTo('Write')" :disabled="!isLoggedIn">
                        <el-icon>
                            <Edit />
                        </el-icon>
                        <template #title>发布</template>
                    </el-menu-item>
                    <el-sub-menu index="1">
                        <template #title>
                            <el-icon>
                                <Location />
                            </el-icon>
                            <span>工具</span>
                        </template>
                        <el-menu-item-group title="Group One">
                            <el-menu-item index="1-1">item one</el-menu-item>
                            <el-menu-item index="1-2">item two</el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="Group Two">
                            <el-menu-item index="1-3">item three</el-menu-item>
                        </el-menu-item-group>
                        <el-sub-menu index="1-4">
                            <template #title>item four</template>
                            <el-menu-item index="1-4-1">item one</el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                </el-menu>
            </el-col>
        </el-row>
    </div>
</template>


<script setup>
import { 
    Location,
    Setting,
    CoffeeCup,
    Edit
} from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, inject, watch } from 'vue'

const router = useRouter()
const route = useRoute()

// 接收父组件传递的Props
const props = defineProps({
    menuActive: {
        type: String,
        default: '2'
    }
})

// 定义发送给父组件的事件
const emit = defineEmits(['menu-select'])

// 注入全局状态
const appState = inject('appState', null)

// 登录状态检查
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

// 导航到指定路由
const navigateTo = (routeName) => {
    router.push({ name: routeName })
}

// 菜单选择处理
const handleSelect = (key, keyPath) => {
    console.log('Aside 菜单选择:', key, keyPath)
    emit('menu-select', key)
}

const handleOpen = (key, keyPath) => {
    console.log('Aside 菜单展开:', key, keyPath)
}

const handleClose = (key, keyPath) => {
    console.log('Aside 菜单收起:', key, keyPath)
}

// 组件挂载时检查登录状态
onMounted(() => {
    checkLoginStatus()
    
    // 监听路由变化，更新激活状态
    router.afterEach(() => {
        checkLoginStatus()
    })
})
</script>

<style scoped>
.aside {
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
}

/* 菜单容器样式 */
:deep(.el-menu) {
    background-color: var(--bg-secondary);
    border-right: none;
    width: 100% !important;
    min-width: 200px;
    box-sizing: border-box;
}

:deep(.el-sub-menu),
:deep(.el-menu-item) {
    width: 100% !important;
    box-sizing: border-box;
}

:deep(.el-menu-vertical-demo) {
    border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    color: var(--text-primary);
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
    background-color: var(--bg-tertiary);
}

:deep(.el-menu-item.is-active) {
    color: var(--primary-color);
    background-color: var(--bg-tertiary);
}
</style>