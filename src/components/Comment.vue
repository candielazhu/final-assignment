<template>
    <div class="comment-container">
        <div class="comment-header">
            <h3>评论区</h3>
            <div class="comment-count">{{ comments.length }} 条评论</div>
        </div>
        
        <!-- 添加评论表单 -->
        <div class="comment-form" v-if="isLoggedIn">
            <el-form ref="commentFormRef" :model="commentForm" label-width="0">
                <el-form-item prop="content">
                    <el-input
                        v-model="commentForm.content"
                        type="textarea"
                        :rows="3"
                        placeholder="写下你的评论..."
                    />
                </el-form-item>
                <el-form-item>
                    <div class="form-actions">
                        <el-button type="primary" @click="submitComment">提交评论</el-button>
                        <el-button @click="resetForm">取消</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
        <div class="login-tip" v-else>
            <el-button type="primary" @click="toLogin">登录后可发表评论</el-button>
        </div>
        
        <!-- 评论列表 -->
        <div class="comment-list">
            <div 
                v-for="comment in comments" 
                :key="comment.id" 
                class="comment-item"
            >
                <div class="comment-header-info">
                    <el-avatar :icon="UserFilled" :size="36" />
                    <div class="comment-meta">
                        <div class="comment-author">{{ comment.username || '匿名用户' }}</div>
                        <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
                    </div>
                    <div class="comment-actions" v-if="isLoggedIn">
                        <el-button 
                            type="text" 
                            size="small" 
                            @click="replyComment(comment)"
                        >
                            回复
                        </el-button>
                        <el-popconfirm
                            v-if="comment.user_id === currentUserId"
                            title="确定要删除这条评论吗？"
                            @confirm="deleteComment(comment.id)"
                        >
                            <template #reference>
                                <el-button 
                                    type="text" 
                                    size="small"
                                    danger
                                >
                                    <el-icon><Delete /></el-icon>
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </div>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                
                <!-- 回复评论 -->
                <div class="comment-reply-form" v-if="replyingTo === comment.id">
                    <el-form ref="replyFormRef" :model="replyForm" label-width="0">
                        <el-form-item prop="content">
                            <el-input
                                v-model="replyForm.content"
                                type="textarea"
                                :rows="2"
                                placeholder="写下你的回复..."
                            />
                        </el-form-item>
                        <el-form-item>
                            <div class="form-actions">
                                <el-button type="primary" @click="submitReply(comment)">提交回复</el-button>
                                <el-button @click="cancelReply">取消</el-button>
                            </div>
                        </el-form-item>
                    </el-form>
                </div>
                
                <!-- 子评论 -->
                <div class="comment-children" v-if="comment.children && comment.children.length > 0">
                    <div 
                        v-for="child in comment.children" 
                        :key="child.id" 
                        class="comment-child"
                    >
                        <div class="comment-header-info">
                            <el-avatar :icon="UserFilled" :size="32" />
                            <div class="comment-meta">
                                <div class="comment-author">{{ child.username || '匿名用户' }}</div>
                                <div class="comment-time">{{ formatDate(child.created_at) }}</div>
                            </div>
                            <div class="comment-actions" v-if="isLoggedIn">
                                <el-button 
                                    type="text" 
                                    size="small" 
                                    @click="replyComment(child)"
                                >
                                    回复
                                </el-button>
                                <el-popconfirm
                                    v-if="child.user_id === currentUserId"
                                    title="确定要删除这条评论吗？"
                                    @confirm="deleteComment(child.id)"
                                >
                                    <template #reference>
                                        <el-button 
                                            type="text" 
                                            size="small"
                                            danger
                                        >
                                            <el-icon><Delete /></el-icon>
                                            删除
                                        </el-button>
                                    </template>
                                </el-popconfirm>
                            </div>
                        </div>
                        <div class="comment-content">
                            <span class="reply-to">@{{ comment.username }}</span> {{ child.content }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 空评论提示 -->
        <div class="empty-comments" v-if="comments.length === 0">
            <el-empty description="暂无评论，快来抢沙发吧！" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElPopconfirm } from 'element-plus'
import { UserFilled, Delete } from '@element-plus/icons-vue'

// Props
const props = defineProps({
    articleId: {
        type: Number,
        required: true
    }
})

// Emits
const emit = defineEmits(['update:commentCount'])

// Router
const router = useRouter()

// 登录状态
const isLoggedIn = ref(false)
const currentUserId = ref(null)

// 评论表单
const commentFormRef = ref(null)
const commentForm = ref({
    content: ''
})

// 回复表单
const replyFormRef = ref(null)
const replyForm = ref({
    content: ''
})
const replyingTo = ref(null)

// 评论列表
const comments = ref([])

// 检查登录状态
const checkLoginStatus = () => {
    const cookieLoggedIn = document.cookie.includes('isLoggedIn=true')
    const localStorageLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    isLoggedIn.value = cookieLoggedIn || localStorageLoggedIn
    
    // 模拟获取当前用户ID（实际项目中应从登录状态获取）
    currentUserId.value = isLoggedIn.value ? 1 : null
}

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// 提交评论
const submitComment = () => {
    if (!commentForm.value.content.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }
    
    // 模拟提交评论（实际项目中应调用API）
    const newComment = {
        id: Date.now(),
        article_id: props.articleId,
        user_id: currentUserId.value,
        username: '当前用户',
        content: commentForm.value.content.trim(),
        parent_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: []
    }
    
    comments.value.unshift(newComment)
    emit('update:commentCount', comments.value.length)
    ElMessage.success('评论成功')
    resetForm()
}

// 重置表单
const resetForm = () => {
    commentForm.value.content = ''
    commentFormRef.value?.resetFields()
}

// 回复评论
const replyComment = (comment) => {
    replyingTo.value = comment.id
    replyForm.value.content = ''
}

// 提交回复
const submitReply = (parentComment) => {
    if (!replyForm.value.content.trim()) {
        ElMessage.warning('请输入回复内容')
        return
    }
    
    // 模拟提交回复（实际项目中应调用API）
    const newReply = {
        id: Date.now(),
        article_id: props.articleId,
        user_id: currentUserId.value,
        username: '当前用户',
        content: replyForm.value.content.trim(),
        parent_id: parentComment.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
    
    // 添加回复到父评论
    if (!parentComment.children) {
        parentComment.children = []
    }
    parentComment.children.push(newReply)
    emit('update:commentCount', comments.value.length)
    ElMessage.success('回复成功')
    cancelReply()
}

// 取消回复
const cancelReply = () => {
    replyingTo.value = null
    replyForm.value.content = ''
    replyFormRef.value?.resetFields()
}

// 删除评论
const deleteComment = (commentId) => {
    // 模拟删除评论（实际项目中应调用API）
    comments.value = comments.value.filter(comment => {
        if (comment.id === commentId) {
            return false
        }
        // 删除子评论
        if (comment.children) {
            comment.children = comment.children.filter(child => child.id !== commentId)
        }
        return true
    })
    emit('update:commentCount', comments.value.length)
    ElMessage.success('删除成功')
}

// 跳转到登录页
const toLogin = () => {
    router.push('/login')
}

// 模拟获取评论数据
const fetchComments = () => {
    // 实际项目中应调用API获取评论列表
    comments.value = [
        {
            id: 1,
            article_id: props.articleId,
            user_id: 1,
            username: '用户1',
            content: '这篇文章写得很好，很有启发性！',
            parent_id: null,
            created_at: '2025-12-19T10:30:00Z',
            updated_at: '2025-12-19T10:30:00Z',
            children: [
                {
                    id: 2,
                    article_id: props.articleId,
                    user_id: 2,
                    username: '用户2',
                    content: '同意，我也有同样的感受！',
                    parent_id: 1,
                    created_at: '2025-12-19T11:00:00Z',
                    updated_at: '2025-12-19T11:00:00Z'
                }
            ]
        },
        {
            id: 3,
            article_id: props.articleId,
            user_id: 3,
            username: '用户3',
            content: '非常感谢分享，学到了很多！',
            parent_id: null,
            created_at: '2025-12-19T14:20:00Z',
            updated_at: '2025-12-19T14:20:00Z',
            children: []
        }
    ]
    emit('update:commentCount', comments.value.length)
}

// 初始化
onMounted(() => {
    checkLoginStatus()
    fetchComments()
})

// 监听路由变化，更新登录状态
watch(() => router.currentRoute.value.path, () => {
    checkLoginStatus()
})
</script>

<style scoped>
.comment-container {
    padding: 20px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 8px;
    margin-top: 20px;
    border: 1px solid var(--border-color);
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

.comment-count {
    color: var(--text-secondary);
    font-size: 14px;
}

.comment-form {
    background-color: var(--bg-tertiary);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.login-tip {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.comment-item {
    background-color: var(--bg-tertiary);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.comment-header-info {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
}

.comment-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.comment-author {
    font-weight: bold;
    color: var(--text-primary);
}

.comment-time {
    font-size: 12px;
    color: var(--text-secondary);
}

.comment-actions {
    display: flex;
    gap: 10px;
}

.comment-content {
    margin-bottom: 15px;
    line-height: 1.6;
    color: var(--text-primary);
}

.comment-reply-form {
    margin-top: 15px;
    padding: 15px;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    border-left: 3px solid var(--primary-color);
}

.comment-children {
    margin-top: 15px;
    margin-left: 46px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.comment-child {
    background-color: var(--bg-secondary);
    padding: 12px;
    border-radius: 8px;
    border-left: 3px solid var(--border-color);
}

.reply-to {
    color: var(--primary-color);
    font-weight: bold;
    margin-right: 8px;
}

.empty-comments {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
}
</style>