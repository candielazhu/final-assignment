<template>
    <div class="write-container">
        <div class="write-header">
            <h2>编写文章</h2>
            <div class="write-actions">
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="saveAsDraft">保存草稿</el-button>
                <el-button type="success" @click="publish">发布</el-button>
            </div>
        </div>
        <div class="write-content">
            <el-form ref="formRef" :model="form" label-width="80px" :rules="rules">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
                </el-form-item>
                <el-form-item label="分类" prop="category_id">
                    <el-select v-model="form.category_id" placeholder="请选择文章分类">
                        <el-option
                            v-for="category in categories"
                            :key="category.id"
                            :label="category.name"
                            :value="category.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="摘要" prop="summary">
                    <el-input
                        v-model="form.summary"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入文章摘要"
                        maxlength="200"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <el-input
                        v-model="form.content"
                        type="textarea"
                        :rows="20"
                        placeholder="请输入文章内容（支持Markdown格式）"
                        spellcheck="false"
                    />
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../axios/request'

const router = useRouter()
const formRef = ref(null)

// 表单数据
const form = reactive({
    title: '',
    summary: '',
    content: '',
    category_id: '',
    status: 'draft'
})

// 表单验证规则
const rules = {
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
    ],
    summary: [
        { required: true, message: '请输入文章摘要', trigger: 'blur' },
        { min: 10, max: 200, message: '摘要长度在 10 到 200 个字符', trigger: 'blur' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' },
        { min: 20, message: '内容长度不能少于 20 个字符', trigger: 'blur' }
    ],
    category_id: [
        { required: true, message: '请选择文章分类', trigger: 'change' }
    ]
}

// 分类列表
const categories = ref([])

// 获取分类列表
const fetchCategories = async () => {
    try {
        const response = await request({
            url: '/categories',
            method: 'get'
        })
        
        if (response.data.code === 200) {
            categories.value = response.data.data
        } else {
            ElMessage.error('获取分类列表失败')
        }
    } catch (error) {
        console.error('获取分类列表错误:', error)
        ElMessage.error('获取分类列表失败，请稍后重试')
    }
}

// 保存文章
const saveArticle = async (status) => {
    // 表单验证
    if (!formRef.value) return
    
    try {
        await formRef.value.validate()
        
        // 获取当前登录用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        
        // 准备提交数据
        const articleData = {
            ...form,
            status: status,
            user_id: userInfo.id || 1, // 使用当前用户ID，如果没有则使用默认值1
            // html_content 会在后端生成
            html_content: ''
        }
        
        // 调用后端API
        const response = await request({
            url: '/articles',
            method: 'post',
            data: articleData
        })
        
        if (response.data.code === 200) {
            ElMessage.success(status === 'published' ? '文章发布成功' : '草稿保存成功')
            
            // 重置表单
            resetForm()
            
            // 跳转到首页
            router.push('/')
        } else {
            ElMessage.error(response.data.message || '保存失败')
        }
    } catch (error) {
        console.error('保存文章错误:', error)
        
        if (error.name === 'Error') {
            // 表单验证失败，不显示错误信息
            return
        }
        
        ElMessage.error('保存失败，请稍后重试')
    }
}

// 发布文章
const publish = () => {
    saveArticle('published')
}

// 保存草稿
const saveAsDraft = () => {
    saveArticle('draft')
}

// 重置表单
const resetForm = () => {
    form.title = ''
    form.summary = ''
    form.content = ''
    form.category_id = ''
    form.status = 'draft'
    if (formRef.value) {
        formRef.value.clearValidate()
    }
}

// 取消编写
const cancel = () => {
    // 确认取消
    if (form.title || form.summary || form.content) {
        if (confirm('确定要取消编写吗？未保存的内容将丢失')) {
            router.push('/')
        }
    } else {
        router.push('/')
    }
}

// 组件挂载时获取分类列表
onMounted(() => {
    fetchCategories()
})
</script>

<style scoped>
.write-container {
    padding: 20px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 80vh;
}

.write-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

.write-actions {
    display: flex;
    gap: 10px;
}

.write-content {
    background-color: var(--bg-tertiary);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-form-item__label) {
    color: var(--text-primary);
}
</style>