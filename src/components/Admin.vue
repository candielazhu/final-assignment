<template>
    <div class="admin-container">
        <h1>管理员中心</h1>
        
        <!-- 管理员功能导航 -->
        <div class="admin-nav">
            <el-menu
                :default-active="activeMenu"
                class="admin-menu"
                mode="horizontal"
                @select="handleMenuSelect"
            >
                <el-menu-item index="users">用户管理</el-menu-item>
                <el-menu-item index="articles">文章管理</el-menu-item>
                <el-menu-item index="comments">评论管理</el-menu-item>
            </el-menu>
        </div>

        <!-- 内容区域 -->
        <div class="admin-content">
            <UserManagement v-if="activeMenu === 'users'" />
            <div v-else-if="activeMenu === 'articles'" class="management-section">
                <!-- <h3>文章管理</h3> -->
                <ArticleManagement />
            </div>
            <div v-else-if="activeMenu === 'comments'" class="management-section">
                <!-- <h3>评论管理</h3> -->
                <CommentManagement />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import UserManagement from './admin/UserManagement.vue'
import ArticleManagement from './admin/ArticleManagement.vue'
import CommentManagement from './admin/CommentManagement.vue'

// 当前激活的菜单项
const activeMenu = ref('users')

// 处理菜单选择
const handleMenuSelect = (index) => {
    activeMenu.value = index
}
</script>

<style scoped>
.admin-container {
    padding: var(--spacing-xl);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 80vh;
    transition: all var(--transition-normal);
}

.admin-nav {
    margin: var(--spacing-lg) 0;
}

.admin-menu {
    border-bottom: none;
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-md);
    padding: 0 var(--spacing-md);
}

.management-section {
    padding: var(--spacing-xl);
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
}

.admin-content {
    margin-top: var(--spacing-lg);
}
</style>