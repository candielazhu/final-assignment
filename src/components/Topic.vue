<template>
    <div class="topic-container">
        <div class="header">
            <h2>文章详情</h2>
            <el-button type="primary" @click="goBack">返回</el-button>
        </div>
        <div class="markdown-content" ref="markdownRef" v-html="htmlContent"></div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const markdownRef = ref(null)

// 示例 Markdown 内容
const sampleMarkdown = `# 文章标题

这是一篇示例文章，用于展示 Markdown 格式的内容。

## 第一部分

### 1.1 小节标题
这是第一部分的第一个小节内容。  
这是第一部分的第一个小节内容。  
这是第一部分的第一个小节内容。  
这是第一部分的第一个小节内容。  
这是第一部分的第一个小节内容。  

### 1.2 另一小节
这是第一部分的第二个小节内容，包含一些重要信息。  
这是第一部分的第二个小节内容，包含一些重要信息。  
这是第一部分的第二个小节内容，包含一些重要信息。  
这是第一部分的第二个小节内容，包含一些重要信息。  
这是第一部分的第二个小节内容，包含一些重要信息。  

## 第二部分

### 2.1 新的小节
这是第二部分的内容，展示了不同级别的标题。  
这是第二部分的内容，展示了不同级别的标题。  
这是第二部分的内容，展示了不同级别的标题。  
这是第二部分的内容，展示了不同级别的标题。  
这是第二部分的内容，展示了不同级别的标题。  

### 2.2 更多内容
这里可以添加更多的文章内容，包括各种 Markdown 语法。  
这里可以添加更多的文章内容，包括各种 Markdown 语法。  
这里可以添加更多的文章内容，包括各种 Markdown 语法。  
这里可以添加更多的文章内容，包括各种 Markdown 语法。  
这里可以添加更多的文章内容，包括各种 Markdown 语法。  

#### 2.2.1 子小节
这是一个四级标题的子小节。

## 第三部分

这是文章的最后一部分，总结了主要内容。  
这是文章的最后一部分，总结了主要内容。  
这是文章的最后一部分，总结了主要内容。  
这是文章的最后一部分，总结了主要内容。  
这是文章的最后一部分，总结了主要内容。  
`

// 将 Markdown 转换为 HTML
const htmlContent = computed(() => {
    return marked(sampleMarkdown)
})

const goBack = () => {
    router.go(-1) // 返回上一页
}
</script>

<style scoped>
.topic-container {
    padding: 20px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 80vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
}

.markdown-content {
    padding: 20px;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    line-height: 1.8;
    overflow-y: auto;
    max-height: 70vh;
    border: 1px solid var(--border-color);
}

/* Markdown 内容样式 */
.markdown-content h1 {
    font-size: 2em;
    margin-bottom: 0.83em;
    color: var(--text-primary);
    padding-bottom: 0.3em;
    border-bottom: 2px solid var(--border-color);
}

.markdown-content h2 {
    font-size: 1.5em;
    margin: 1em 0 0.83em 0;
    color: var(--text-primary);
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--border-color);
}

.markdown-content h3 {
    font-size: 1.25em;
    margin: 1em 0 0.83em 0;
    color: var(--text-primary);
}

.markdown-content h4 {
    font-size: 1.1em;
    margin: 1em 0 0.83em 0;
    color: var(--text-primary);
}

.markdown-content p {
    margin: 0.83em 0;
    color: var(--text-primary);
}
</style>