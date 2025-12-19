<template>
    <div class="write-container">
        <div class="write-header">
            <h2>编写文章</h2>
            <div class="write-actions">
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="publish">发布</el-button>
            </div>
        </div>
        <div class="write-content">
            <el-form ref="formRef" :model="form" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="form.title" placeholder="请输入文章标题" />
                </el-form-item>
                <el-form-item label="内容">
                    <el-input
                        v-model="form.content"
                        type="textarea"
                        :rows="15"
                        placeholder="请输入文章内容（支持Markdown格式）"
                    />
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)

// 表单数据
const form = reactive({
    title: '',
    content: ''
})

// 发布文章
const publish = () => {
    // 表单验证
    if (!form.title || !form.content) {
        ElMessage.error('请填写标题和内容')
        return
    }
    
    // 模拟发布成功
    ElMessage.success('文章发布成功')
    
    // 重置表单
    form.title = ''
    form.content = ''
    
    // 跳转到首页
    router.push('/')
}

// 取消编写
const cancel = () => {
    // 确认取消
    if (form.title || form.content) {
        if (confirm('确定要取消编写吗？未保存的内容将丢失')) {
            router.push('/')
        }
    } else {
        router.push('/')
    }
}
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