<template>
    <div class="article-management">
        <h2>文章管理</h2>
        
        <!-- 搜索和添加按钮区域 -->
        <div class="article-management-header">
            <el-input
                v-model="searchQuery"
                placeholder="搜索文章标题或作者"
                clearable
                @keyup.enter="fetchArticles"
                class="search-input"
            >
                <template #append>
                    <el-button type="primary" @click="fetchArticles">
                        <el-icon><Search /></el-icon>
                        搜索
                    </el-button>
                </template>
            </el-input>
            
            <el-button type="success" @click="openAddDialog">
                <el-icon><Plus /></el-icon>
                添加文章
            </el-button>
        </div>
        
        <!-- 文章列表表格 -->
        <el-table :data="articles" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="category_name" label="分类" width="120" />
            <el-table-column prop="author_name" label="作者" width="120" />
            <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
                        {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="reading" label="阅读量" width="100" />
            <el-table-column prop="comment_count" label="评论数" width="100" />
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="openEditDialog(scope.row)">
                        <el-icon><Edit /></el-icon>
                        编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="deleteArticle(scope.row.id)">
                        <el-icon><Delete /></el-icon>
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            />
        </div>
        
        <!-- 添加/编辑文章对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="60%"
        >
            <el-form
                ref="articleFormRef"
                :model="articleForm"
                :rules="articleFormRules"
                label-width="100px"
            >
                <el-form-item label="标题" prop="title">
                    <el-input
                        v-model="articleForm.title"
                        placeholder="请输入文章标题"
                        clearable
                    />
                </el-form-item>
                
                <el-form-item label="分类" prop="category_id">
                    <el-select
                        v-model="articleForm.category_id"
                        placeholder="请选择分类"
                        clearable
                    >
                        <el-option
                            v-for="category in categories"
                            :key="category.id"
                            :label="category.name"
                            :value="category.id"
                        />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="状态" prop="status">
                    <el-select
                        v-model="articleForm.status"
                        placeholder="请选择状态"
                    >
                        <el-option label="草稿" value="draft" />
                        <el-option label="已发布" value="published" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="摘要" prop="summary">
                    <el-input
                        v-model="articleForm.summary"
                        placeholder="请输入文章摘要"
                        type="textarea"
                        rows="3"
                    />
                </el-form-item>
                
                <el-form-item label="内容" prop="content">
                    <el-input
                        v-model="articleForm.content"
                        placeholder="请输入文章内容（支持Markdown）"
                        type="textarea"
                        rows="10"
                    />
                </el-form-item>
            </el-form>
            
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveArticle">保存</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import axios from 'axios'

// 文章列表数据
const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 分类列表数据
const categories = ref([])

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加文章')
const isEditMode = ref(false)
const articleFormRef = ref(null)

// 文章表单数据
const articleForm = ref({
    id: null,
    title: '',
    summary: '',
    content: '',
    category_id: null,
    status: 'draft',
    user_id: 1 // 默认用户ID
})

// 表单验证规则
const articleFormRules = ref({
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    summary: [
        { required: true, message: '请输入文章摘要', trigger: 'blur' },
        { min: 10, max: 200, message: '摘要长度在 10 到 200 个字符', trigger: 'blur' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
    ],
    status: [
        { required: true, message: '请选择文章状态', trigger: 'change' }
    ]
})

// 获取文章列表
const fetchArticles = async () => {
    try {
        const response = await axios.get('/api/articles', {
            params: {
                page: currentPage.value,
                pageSize: pageSize.value,
                search: searchQuery.value,
                is_admin: true // 管理员页面，返回所有文章
            }
        })
        articles.value = response.data.data
        total.value = response.data.total
    } catch (error) {
        ElMessage.error('获取文章列表失败')
        console.error('获取文章列表失败:', error)
    }
}

// 获取分类列表
const fetchCategories = async () => {
    try {
        const response = await axios.get('/api/categories')
        categories.value = response.data.data
    } catch (error) {
        ElMessage.error('获取分类列表失败')
        console.error('获取分类列表失败:', error)
    }
}

// 分页大小变化
const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1
    fetchArticles()
}

// 当前页码变化
const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
    fetchArticles()
}

// 打开添加对话框
const openAddDialog = () => {
    isEditMode.value = false
    dialogTitle.value = '添加文章'
    resetForm()
    dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
    isEditMode.value = true
    dialogTitle.value = '编辑文章'
    articleForm.value = { ...row }
    dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
    articleForm.value = {
        id: null,
        title: '',
        summary: '',
        content: '',
        category_id: null,
        status: 'draft',
        user_id: 1
    }
    if (articleFormRef.value) {
        articleFormRef.value.resetFields()
    }
}

// 保存文章
const saveArticle = async () => {
    if (!articleFormRef.value) return
    
    await articleFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value) {
                    // 更新文章
                    await axios.put(`/api/articles/${articleForm.value.id}`, articleForm.value)
                    ElMessage.success('文章更新成功')
                } else {
                    // 添加文章
                    await axios.post('/api/articles', articleForm.value)
                    ElMessage.success('文章添加成功')
                }
                dialogVisible.value = false
                fetchArticles()
            } catch (error) {
                ElMessage.error(isEditMode.value ? '文章更新失败' : '文章添加失败')
                console.error('保存文章失败:', error)
            }
        } else {
            console.log('表单验证失败')
            return false
        }
    })
}

// 删除文章
const deleteArticle = (id) => {
    ElMessageBox.confirm('确定要删除这篇文章吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            await axios.delete(`/api/articles/${id}`)
            ElMessage.success('文章删除成功')
            fetchArticles()
        } catch (error) {
            ElMessage.error('文章删除失败')
            console.error('删除文章失败:', error)
        }
    }).catch(() => {
        // 用户取消删除操作
    })
}

// 页面挂载时获取数据
onMounted(() => {
    fetchArticles()
    fetchCategories()
})
</script>

<style scoped>
.article-management {
    padding: 20px;
}

.article-management-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.search-input {
    width: 400px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>