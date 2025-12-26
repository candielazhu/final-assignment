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
                        :maxlength="500"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item>
                    <div class="form-actions">
                        <el-button type="primary" @click="submitComment" :loading="submitting">提交评论</el-button>
                        <el-button @click="resetForm">取消</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
        <div class="login-tip" v-else>
            <el-button type="primary" @click="toLogin">登录后可发表评论</el-button>
        </div>
        
        <!-- 评论列表 -->
        <div class="comment-list" v-loading="loading">
            <div 
                v-for="comment in comments" 
                :key="comment.id" 
                class="comment-item"
            >
                <div class="comment-header-info">
                    <el-avatar :src="comment.avatar" :size="36">
                        <UserFilled v-if="!comment.avatar" />
                    </el-avatar>
                    <div class="comment-meta">
                        <div class="comment-author">{{ comment.username || '匿名用户' }}</div>
                        <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
                    </div>
                    <div class="comment-actions" v-if="isLoggedIn">
                        <el-button 
                            link 
                            size="small" 
                            @click="replyComment(comment)"
                        >
                            回复
                        </el-button>
                        <el-button 
                            link 
                            size="small" 
                            @click="editComment(comment)"
                            v-if="comment.user_id === currentUserId"
                        >
                            编辑
                        </el-button>
                        <el-popconfirm
                            v-if="comment.user_id === currentUserId"
                            title="确定要删除这条评论吗？"
                            @confirm="deleteComment(comment.id)"
                        >
                            <template #reference>
                                <el-button 
                                link 
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
                <!-- 评论内容或编辑表单 -->
                <div class="comment-content" v-if="!comment.isEditing">
                    {{ comment.content }}
                </div>
                <div class="comment-edit-form" v-else>
                    <el-form ref="editFormRef" :model="editForm" label-width="0">
                        <el-form-item prop="content">
                            <el-input
                                v-model="editForm.content"
                                type="textarea"
                                :rows="2"
                                :maxlength="500"
                                show-word-limit
                            />
                        </el-form-item>
                        <div class="form-actions">
                            <el-button type="primary" @click="saveEdit(comment)" size="small">保存</el-button>
                            <el-button @click="cancelEdit(comment)" size="small">取消</el-button>
                        </div>
                    </el-form>
                </div>
                
                <!-- 回复评论 -->
                <div class="comment-reply-form" v-if="replyingTo === comment.id">
                    <el-form ref="replyFormRef" :model="replyForm" label-width="0">
                        <el-form-item prop="content">
                            <el-input
                                v-model="replyForm.content"
                                type="textarea"
                                :rows="2"
                                placeholder="写下你的回复..."
                                :maxlength="500"
                                show-word-limit
                            />
                        </el-form-item>
                        <el-form-item>
                            <div class="form-actions">
                                <el-button type="primary" @click="submitReply(comment)" size="small" :loading="submittingReply">提交回复</el-button>
                                <el-button @click="cancelReply" size="small">取消</el-button>
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
                            <el-avatar :src="child.avatar" :size="32">
                                <UserFilled v-if="!child.avatar" />
                            </el-avatar>
                            <div class="comment-meta">
                                <div class="comment-author">{{ child.username || '匿名用户' }}</div>
                                <div class="comment-time">{{ formatDate(child.created_at) }}</div>
                            </div>
                            <div class="comment-actions" v-if="isLoggedIn">
                                <el-button 
                                    link 
                                    size="small" 
                                    @click="replyComment(child)"
                                >
                                    回复
                                </el-button>
                                <el-button 
                                    link 
                                    size="small" 
                                    @click="editComment(child)"
                                    v-if="child.user_id === currentUserId"
                                >
                                    编辑
                                </el-button>
                                <el-popconfirm
                                    v-if="child.user_id === currentUserId"
                                    title="确定要删除这条评论吗？"
                                    @confirm="deleteComment(child.id)"
                                >
                                    <template #reference>
                                        <el-button 
                                        link 
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
                        <!-- 子评论内容或编辑表单 -->
                        <div class="comment-content" v-if="!child.isEditing">
                            <span class="reply-to">@{{ comment.username }}</span> {{ child.content }}
                        </div>
                        <div class="comment-edit-form" v-else>
                            <el-form ref="childEditFormRef" :model="childEditForm" label-width="0">
                                <el-input
                                    v-model="childEditForm.content"
                                    type="textarea"
                                    :rows="2"
                                    :maxlength="500"
                                    show-word-limit
                                />
                            </el-form>
                            <div class="form-actions">
                                <el-button type="primary" @click="saveChildEdit(child, comment)" size="small">保存</el-button>
                                <el-button @click="cancelChildEdit(child)" size="small">取消</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 空评论提示 -->
        <div class="empty-comments" v-if="comments.length === 0 && !loading">
            <el-empty description="暂无评论，快来抢沙发吧！" />
        </div>
        
        <!-- 分页 -->
        <div class="comment-pagination" v-if="total > limit">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="limit"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElPopconfirm } from 'element-plus'
import { UserFilled, Delete } from '@element-plus/icons-vue'
import request from '../axios/request' // 导入axios请求实例

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

// 加载状态
const loading = ref(false)
const submitting = ref(false)
const submittingReply = ref(false)

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

// 编辑表单
const editFormRef = ref(null)
const editForm = ref({
    content: ''
})

const childEditFormRef = ref(null)
const childEditForm = ref({
    content: ''
})

// 评论列表
const comments = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)

// 检查登录状态
const checkLoginStatus = () => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo)
            isLoggedIn.value = true
            currentUserId.value = user.id
        } catch (error) {
            isLoggedIn.value = false
            currentUserId.value = null
        }
    } else {
        isLoggedIn.value = false
        currentUserId.value = null
    }
}

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

// 提交评论
const submitComment = async () => {
    if (!commentForm.value.content.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }
    
    submitting.value = true
    try {
        const response = await request.post('/comments', {
            article_id: props.articleId,
            content: commentForm.value.content.trim(),
            parent_id: null,
            user_id: currentUserId.value
        })
        
        // 重新获取评论列表
        await fetchComments()
        ElMessage.success('评论成功')
        resetForm()
    } catch (error) {
        console.error('提交评论失败:', error)
        ElMessage.error(error.response?.data?.message || '评论失败，请稍后重试')
    } finally {
        submitting.value = false
    }
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
const submitReply = async (parentComment) => {
    if (!replyForm.value.content.trim()) {
        ElMessage.warning('请输入回复内容')
        return
    }
    
    submittingReply.value = true
    try {
        const response = await request.post('/comments', {
            article_id: props.articleId,
            content: replyForm.value.content.trim(),
            parent_id: parentComment.id,
            user_id: currentUserId.value
        })
        
        // 重新获取评论列表
        await fetchComments()
        ElMessage.success('回复成功')
        cancelReply()
    } catch (error) {
        console.error('提交回复失败:', error)
        ElMessage.error(error.response?.data?.message || '回复失败，请稍后重试')
    } finally {
        submittingReply.value = false
    }
}

// 取消回复
const cancelReply = () => {
    replyingTo.value = null
    replyForm.value.content = ''
    // 安全检查，确保resetFields函数存在
    if (replyFormRef.value && typeof replyFormRef.value.resetFields === 'function') {
        replyFormRef.value.resetFields()
    }
}

// 编辑评论
const editComment = (comment) => {
    comment.isEditing = true
    if (comment.parent_id) {
        childEditForm.value.content = comment.content
    } else {
        editForm.value.content = comment.content
    }
}

// 保存编辑
const saveEdit = async (comment) => {
    if (!editForm.value.content.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }
    
    try {
        const response = await request.put(`/comments/${comment.id}`, {
            content: editForm.value.content.trim(),
            user_id: currentUserId.value
        })
        
        // 更新本地评论内容
        comment.content = editForm.value.content.trim()
        comment.isEditing = false
        ElMessage.success('编辑成功')
    } catch (error) {
        console.error('编辑评论失败:', error)
        ElMessage.error(error.response?.data?.message || '编辑失败，请稍后重试')
    }
}

// 取消编辑
const cancelEdit = (comment) => {
    comment.isEditing = false
    editForm.value.content = ''
}

// 保存子评论编辑
const saveChildEdit = async (comment, parentComment) => {
    if (!childEditForm.value.content.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }
    
    try {
        const response = await request.put(`/comments/${comment.id}`, {
            content: childEditForm.value.content.trim(),
            user_id: currentUserId.value
        })
        
        // 更新本地评论内容
        comment.content = childEditForm.value.content.trim()
        comment.isEditing = false
        ElMessage.success('编辑成功')
    } catch (error) {
        console.error('编辑评论失败:', error)
        ElMessage.error(error.response?.data?.message || '编辑失败，请稍后重试')
    }
}

// 取消子评论编辑
const cancelChildEdit = (comment) => {
    comment.isEditing = false
    childEditForm.value.content = ''
}

// 删除评论
const deleteComment = async (commentId) => {
    try {
        const response = await request.delete(`/comments/${commentId}`, {
            data: {
                user_id: currentUserId.value
            }
        })
        
        // 重新获取评论列表
        await fetchComments()
        ElMessage.success('删除成功')
    } catch (error) {
        console.error('删除评论失败:', error)
        ElMessage.error(error.response?.data?.message || '删除失败，请稍后重试')
    }
}

// 跳转到登录页
const toLogin = () => {
    router.push('/login')
}

// 获取评论数据
const fetchComments = async () => {
    loading.value = true
    try {
        const response = await request.get(`/comments?article_id=${props.articleId}&page=${page.value}&limit=${limit.value}`)
        comments.value = response.data.data.comments
        total.value = response.data.data.total
        page.value = response.data.data.page
        limit.value = response.data.data.limit
        emit('update:commentCount', total.value)
    } catch (error) {
        console.error('获取评论失败:', error)
        ElMessage.error(error.response?.data?.message || '获取评论失败，请稍后重试')
    } finally {
        loading.value = false
    }
}

// 分页处理
const handleSizeChange = (newSize) => {
    limit.value = newSize
    page.value = 1
    fetchComments()
}

const handleCurrentChange = (newPage) => {
    page.value = newPage
    fetchComments()
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

.comment-edit-form {
    margin-top: 10px;
    margin-bottom: 15px;
    padding: 10px;
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

.comment-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
</style>