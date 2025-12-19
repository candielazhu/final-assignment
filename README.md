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

## 运行方式

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 项目结构
```
src/
├── assets/           # 静态资源
├── bak/              # 备份文件
├── components/       # 组件
│   ├── Aside.vue     # 侧边栏组件
│   ├── Footer.vue    # 底部组件
│   ├── Header.vue    # 头部组件
│   ├── Login.vue     # 登录组件
│   ├── Main.vue      # 主内容组件
│   ├── Topic.vue     # 主题组件
│   ├── index.vue     # 首页组件
│   └── register.vue  # 注册组件
├── App.vue           # 根组件
├── main.js           # 入口文件
├── router.js         # 路由配置
└── style.css         # 全局样式
```

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
