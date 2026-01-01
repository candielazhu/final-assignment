<template>
    <div class="user-management-container">
        <div class="user-management-header">
            <h2>用户管理</h2>
            <div class="header-actions">
                <el-button type="primary" @click="showCreateDialog" :icon="Plus">
                    添加用户
                </el-button>
                <div class="search-box">
                    <el-input v-model="searchQuery" placeholder="搜索用户名或邮箱" @input="handleSearch" clearable
                        style="width: 300px;">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                </div>
            </div>
        </div>

        <div class="user-management-content">
            <el-table :data="users" style="width: 100%" :default-sort="{ prop: 'created_at', order: 'descending' }"
                class="user-table">
                <el-table-column prop="id" label="ID" width="80" sortable />
                <el-table-column prop="username" label="用户名" width="150" sortable />
                <el-table-column prop="email" label="邮箱" width="200" sortable />
                <el-table-column prop="phone" label="手机号" width="150" sortable />
                <el-table-column prop="role" label="角色" width="100" sortable>
                    <template #default="scope">
                        <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'">
                            {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="注册时间" width="180" sortable>
                    <template #default="scope">
                        {{ formatDate(scope.row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="editUser(scope.row)">
                            编辑
                        </el-button>
                        <el-popconfirm title="确定要删除这个用户吗？" @confirm="deleteUser(scope.row.id)">
                            <template #reference>
                                <el-button size="small" type="danger" :disabled="scope.row.role === 'admin'">
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" :background="true" layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 编辑/创建用户对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :before-close="handleClose">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="editForm.phone" />
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="isCreateMode">
                    <el-input v-model="editForm.password" type="password" placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="editForm.role" placeholder="选择角色">
                        <el-option label="普通用户" value="user" />
                        <el-option label="管理员" value="admin" />
                    </el-select>
                </el-form-item>
                <el-form-item label="简介" prop="bio">
                    <el-input v-model="editForm.bio" type="textarea" :rows="3" placeholder="用户简介" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitUser">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from '../../axios/request'

// 数据定义
const users = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isCreateMode = ref(false)
const editFormRef = ref()
const editForm = ref({
  id: null,
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'user',
  bio: ''
})

// 表单验证规则
const editRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
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

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await axios.get('/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value
      }
    })
    users.value = response.data.data.users
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  }
}

// 搜索用户
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 分页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  fetchUsers()
}

// 当前页码变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchUsers()
}

// 显示创建用户对话框
const showCreateDialog = () => {
  isCreateMode.value = true
  dialogTitle.value = '创建用户'
  editForm.value = {
    id: null,
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    bio: ''
  }
  dialogVisible.value = true
}

// 编辑用户
const editUser = (user) => {
  isCreateMode.value = false
  dialogTitle.value = '编辑用户信息'
  editForm.value = { ...user }
  dialogVisible.value = true
}

// 创建用户
const createUser = async () => {
  try {
    await axios.post('/users', editForm.value)
    ElMessage.success('创建用户成功')
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error('创建用户失败')
    console.error('创建用户失败:', error)
  }
}

// 更新用户
const updateUser = async () => {
  try {
    await axios.put(`/users/${editForm.value.id}`, editForm.value)
    ElMessage.success('更新用户成功')
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error('更新用户失败')
    console.error('更新用户失败:', error)
  }
}

// 提交用户（创建或更新）
const submitUser = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isCreateMode.value) {
        await createUser()
      } else {
        await updateUser()
      }
    }
  })
}

// 删除用户
const deleteUser = async (userId) => {
  try {
    await axios.delete(`/users/${userId}`)
    ElMessage.success('删除用户成功')
    fetchUsers()
  } catch (error) {
    ElMessage.error('删除用户失败')
    console.error('删除用户失败:', error)
  }
}

// 关闭对话框
const handleClose = () => {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  dialogVisible.value = false
}

// 组件挂载时获取用户列表
onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.user-management-container {
    padding: var(--spacing-xl);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 80vh;
    transition: all var(--transition-normal);
}

.user-management-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
}

.user-management-header h2 {
    margin: 0;
    font-size: 24px;
    color: var(--text-primary);
    font-weight: 600;
}

.user-management-content {
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
    padding: var(--spacing-xl);
    transition: all var(--transition-normal);
}

.user-table {
    margin-bottom: var(--spacing-xl);
}

:deep(.el-table) {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    transition: all var(--transition-normal);
}

:deep(.el-table th) {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--border-color);
}

:deep(.el-table td) {
    border-color: var(--border-color);
    color: var(--text-primary);
}

:deep(.el-table tr:hover > td) {
    background-color: var(--bg-hover);
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-xl);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
    transition: all var(--transition-normal);
    border-radius: var(--border-radius-sm);
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-form-item__label) {
    color: var(--text-primary);
}

:deep(.el-dialog) {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
}

:deep(.el-dialog__header),
:deep(.el-dialog__body) {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
}

:deep(.el-dialog__footer) {
    background-color: var(--bg-tertiary);
    border-top: 1px solid var(--border-color);
}
</style>
