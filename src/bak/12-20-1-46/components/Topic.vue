<template>
    <div class="topic-container">
        <div class="header">
            <h2>文章详情</h2>
            <el-button type="primary" @click="goBack">返回</el-button>
        </div>
        <div class="content-wrapper">
            <div class="markdown-content" ref="markdownRef" v-html="htmlContent">
            </div>
            <!-- 锚点容器 -->
            <div class="anchor-container" v-if="anchors.length > 0">
                <div class="anchor-title">文章目录</div>
                <div class="anchor-list">
                    <div v-for="anchor in anchors" :key="anchor.id"
                        :class="['anchor-item', { 'active': activeAnchor === anchor.id }]"
                        :style="{ paddingLeft: `${(anchor.level - 1) * 15}px` }" @click="scrollToAnchor(anchor.id)">
                        {{ anchor.text }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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

# 期末考核项目

## 项目介绍
这是一个基于Vue 3 + Vite的期末考核项目，包含登录和注册功能，采用了现代化的样式设计和组件化开发方式。

## 技术栈
- Vue 3
- Vite
- Vue Router 4
- Element Plus
- CSS3

## 主要功能
1. **用户登录**：支持用户名密码登录
2. **用户注册**：支持新用户注册
3. **样式隔离**：登录和注册组件采用了scoped样式和唯一前缀，确保样式不相互影响
4. **响应式设计**：适配不同屏幕尺寸
5. **现代化UI**：采用了水滴形状的设计风格

## 主要依赖

## 运行方式

### 安装依赖

### 启动开发服务器
### 构建生产版本

### 预览生产版本

## 项目结构

## 样式设计
- 采用了水滴形状的现代化设计
- 实现了组件间的样式隔离
- 使用了CSS3的阴影、过渡和变换效果
- 响应式布局设计

## 开发说明
- 组件采用了Vue 3的Composition API
- 使用了Element Plus的消息提示组件
- 采用了Vue Router进行路由管理
- 实现了基本的表单验证
- 使用localStorage和Cookie存储用户信息

## 版权说明
本项目仅用于期末考核，请勿用于商业用途。

`

// 锚点相关数据
const anchors = ref([])
const activeAnchor = ref('')

// 生成唯一ID
const generateId = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// 将 Markdown 转换为 HTML，并添加ID
const htmlContent = computed(() => {
    const html = marked(sampleMarkdown)
    // 在返回HTML前，我们会在DOM更新后提取标题并生成锚点
    return html
})

// 提取标题并生成锚点
const extractAnchors = () => {
    if (!markdownRef.value) return

    const headings = markdownRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const newAnchors = []

    headings.forEach(heading => {
        const level = parseInt(heading.tagName[1])
        const text = heading.textContent.trim()
        const id = generateId(text)

        // 给标题添加ID
        heading.id = id

        newAnchors.push({
            id,
            text,
            level
        })
    })

    anchors.value = newAnchors
}

// 滚动到指定锚点
const scrollToAnchor = (id) => {
    const element = document.getElementById(id)
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
        activeAnchor.value = id
    }
}

// 监听滚动，高亮当前锚点
const handleScroll = () => {
    if (!markdownRef.value) return

    const scrollPosition = window.scrollY + 100
    let currentActive = ''

    // 从后往前检查，找到第一个可见的标题
    for (let i = anchors.value.length - 1; i >= 0; i--) {
        const anchor = anchors.value[i]
        const element = document.getElementById(anchor.id)
        if (element && element.offsetTop <= scrollPosition) {
            currentActive = anchor.id
            break
        }
    }

    activeAnchor.value = currentActive
}

const goBack = () => {
    router.go(-1) // 返回上一页
}

// 监听htmlContent变化，重新提取锚点
watch(htmlContent, () => {
    nextTick(() => {
        extractAnchors()
    })
})

// 组件挂载后提取锚点并添加滚动监听
onMounted(() => {
    nextTick(() => {
        extractAnchors()
    })
    window.addEventListener('scroll', handleScroll)
})
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

/* 内容和锚点的布局 */
.content-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.markdown-content {
    flex: 1;
    padding: 20px;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    line-height: 1.8;
    overflow-y: auto;
    max-height: 70vh;
    border: 1px solid var(--border-color);
}

/* 锚点容器样式 */
.anchor-container {
    position: sticky;
    top: 20px;
    width: 250px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    max-height: 60vh;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.anchor-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: var(--text-primary);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
}

.anchor-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.anchor-item {
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
}

.anchor-item:hover {
    color: var(--primary-color);
    background-color: var(--bg-secondary);
}

.anchor-item.active {
    color: var(--primary-color);
    font-weight: bold;
    background-color: var(--bg-secondary);
    border-left: 3px solid var(--primary-color);
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

/* 响应式设计 */
@media (max-width: 1024px) {
    .content-wrapper {
        flex-direction: column;
    }

    .anchor-container {
        width: 100%;
        position: static;
        max-height: none;
    }
}
</style>