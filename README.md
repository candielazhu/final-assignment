# 期末考核项目

## 项目介绍

这是一个基于Vue 3 + Vite的现代化博客系统，采用前后端分离架构，包含用户认证、文章管理、评论功能等核心模块。后端使用Node.js + Express + MySQL实现，已成功连接云数据库。

## 技术栈

### 前端

- **前端框架**：Vue 3.5.26 (Composition API)
- **构建工具**：Vite 5.4.10
- **路由管理**：Vue Router 4
- **UI组件库**：Element Plus 2.13.0
- **HTTP客户端**：Axios 1.13.2
- **图标库**：@element-plus/icons-vue 2.3.2
- **Markdown渲染**：marked ^17.0.1
- **样式**：CSS3 + CSS变量

### 后端

- **运行环境**：Node.js
- **Web框架**：Express
- **数据库**：MySQL 8.0（云数据库）
- **数据库驱动**：mysql2
- **环境配置**：dotenv
- **跨域支持**：cors
- **开发工具**：nodemon

## 主要功能

### 1. 用户认证

- ✅ 用户登录与注册
- ✅ 登录状态管理（localStorage + Cookie）
- ✅ 动态按钮切换（登录/退出登录）
- ✅ 样式隔离设计

### 2. 文章管理

- ✅ 文章列表展示（从云数据库获取）
- ✅ 文章详情查看（支持Markdown渲染）
- ✅ 文章发布功能（登录后可用）
- ✅ 文章编辑功能（仅作者可用）
- ✅ 文章删除功能（仅作者可用，带确认弹窗）
- ✅ 文章草稿功能（支持保存为草稿和发布）
- ✅ 文章状态管理（草稿/已发布）
- ✅ 文章锚点导航（支持#、##、###标题）
- ✅ 草稿置顶显示（在文章列表中）
- ✅ 草稿标签显示（在文章列表中）

### 3. 评论系统

- ✅ 独立的评论组件（Comment.vue）
- ✅ 支持评论发布与嵌套回复
- ✅ 评论编辑功能（仅作者可用）
- ✅ 评论删除功能（带Element Plus Popconfirm确认，仅作者可用）
- ✅ 评论计数与实时更新
- ✅ 登录状态控制
- ✅ 评论分页功能
- ✅ 评论内容字数限制（500字）
- ✅ 加载状态与错误提示
- ✅ 支持回复@用户名显示

### 4. 导航与路由

- ✅ 侧边栏导航菜单
- ✅ 路由重定向（404跳转至index）
- ✅ 登录状态路由控制
- ✅ 发布按钮权限控制

### 5. UI设计

- ✅ 现代化水滴形状设计
- ✅ 响应式布局设计
- ✅ 组件样式隔离
- ✅ 主题色与CSS变量
- ✅ 修复了"待设置"子菜单宽度问题
- ✅ 动态背景动画效果（渐变色彩流动）
- ✅ 网格背景布局

## 主要依赖

```bash
# 前端依赖
npm install vue@^3.5.26 vue-router@4 element-plus@^2.13.0 axios@^1.13.2 @element-plus/icons-vue@^2.3.2 marked@^17.0.1 --save

# 后端依赖
npm install express mysql2 cors dotenv nodemon --save
```

## 运行方式

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

### 2. 启动后端服务

```bash
cd server
npm run dev
# 后端服务器将运行在 http://localhost:3000
```

### 3. 启动前端开发服务器

```bash
# 在项目根目录执行
npm run dev
# 前端开发服务器将运行在 http://localhost:5173（或其他可用端口）
```

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产版本

```bash
npm run preview
```

## 项目结构

```
.
├── server/                  # 后端服务目录
│   ├── controllers/         # 控制器
│   │   ├── articles.js      # 文章控制器（增删改查）
│   │   ├── comments.js      # 评论控制器（增删改查）
│   │   ├── categories.js    # 分类控制器
│   │   └── users.js         # 用户控制器（登录注册）
│   ├── routes/              # 路由
│   │   ├── articles.js      # 文章路由（RESTful API）
│   │   ├── comments.js      # 评论路由（RESTful API）
│   │   ├── categories.js    # 分类路由
│   │   └── users.js         # 用户路由
│   ├── .env                 # 环境变量配置（已加入gitignore）
│   ├── db.js                # 数据库连接配置
│   ├── index.js             # 后端入口文件
│   └── package.json         # 后端依赖配置
├── src/                     # 前端源代码
│   ├── assets/              # 静态资源
│   │   └── vue.svg          # Vue标志
│   ├── axios/               # Axios配置
│   │   └── request.js       # 请求拦截与配置
│   ├── components/          # 组件
│   │   ├── bg/              # 背景相关组件
│   │   │   └── Background_animation.vue  # 背景动画组件
│   │   ├── Aside.vue        # 侧边栏导航
│   │   ├── Comment.vue      # 评论组件
│   │   ├── footer.vue       # 页脚组件
│   │   ├── Header.vue       # 顶部导航栏
│   │   ├── Index.vue        # 首页容器
│   │   ├── Login.vue        # 登录组件
│   │   ├── Main.vue         # 文章列表
│   │   ├── Register.vue     # 注册组件
│   │   ├── SearchResult.vue # 搜索结果组件
│   │   ├── Topic.vue        # 文章详情
│   │   └── Write.vue        # 文章编写
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   ├── router.js            # 路由配置
│   └── style.css            # 全局样式
├── database/                # 数据库设计
│   ├── schema.sql           # 完整数据库结构
│   ├── users.sql            # 用户表结构
│   ├── articles.sql         # 文章表结构
│   ├── comments.sql         # 评论表结构
│   ├── categories.sql       # 分类表结构
│   ├── tags.sql             # 标签表结构
│   └── article_tags.sql     # 文章标签关联表
├── .gitignore               # Git忽略配置
├── package.json             # 前端依赖配置
└── vite.config.js           # Vite配置
```

## 数据库设计

### 云数据库配置

- **数据库类型**：MySQL 8.0
- **数据库地址**：
- **数据库名称**：lscvue
- **端口**：3306
- **用户名**：root

### 核心表结构

- **users**：用户信息表
- **articles**：文章表
- **comments**：评论表
- **categories**：分类表
- **tags**：标签表
- **article_tags**：文章标签关联表

### 详细设计

查看完整的数据库设计文档：[database-design.md](database-design.md)

## API接口设计

### 已实现的API接口

#### 文章相关接口

- `GET /api/articles` - 获取文章列表（支持草稿置顶）
- `GET /api/articles/:id` - 获取文章详情（支持Markdown渲染）
- `POST /api/articles` - 创建文章（支持草稿和发布）
- `PUT /api/articles/:id` - 更新文章（仅作者可用）
- `DELETE /api/articles/:id` - 删除文章（仅作者可用）

#### 分类相关接口

- `GET /api/categories` - 获取分类列表

#### 评论相关接口

- `GET /api/comments?article_id=:id` - 获取文章评论列表（支持分页）
- `POST /api/comments` - 添加文章评论或回复
- `PUT /api/comments/:id` - 编辑评论（仅作者可用）
- `DELETE /api/comments/:id` - 删除评论（仅作者可用）

#### 用户相关接口

- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `POST /api/users/logout` - 用户退出登录

### 详细接口设计

查看完整的API接口设计：[database-design.md](database-design.md)（第6节）

## 云数据库连接说明

### 配置文件

- 云数据库连接信息存储在 `server/.env` 文件中
- 该文件已加入 `.gitignore`，防止敏感信息泄露
- 支持不同环境的配置切换

### 连接池配置

- 使用mysql2连接池管理数据库连接
- 连接池大小：10
- 自动重连机制
- 超时处理

## 开发说明

### 1. 前后端分离开发

- 前端和后端可以独立开发
- 后端开发时可使用API测试工具（如Postman）

### 2. 环境变量

- 前端：通过 `.env` 文件配置（如API地址）
- 后端：通过 `server/.env` 文件配置（如数据库连接信息）

### 3. 代码规范

- 前端：使用Vue 3 Composition API
- 后端：使用Express + RESTful API设计
- 统一的代码风格

## 构建与部署

### 构建命令

```bash
# 构建前端
npm run build

# 构建后端（无需额外构建，直接运行）
cd server
npm start
```

### 部署说明

1. **前端部署**
   - 构建完成后，将 `dist` 目录上传至服务器
   - 配置Nginx或其他Web服务器
   - 配置API代理，将API请求转发至后端服务

2. **后端部署**
   - 将 `server` 目录上传至服务器
   - 安装依赖：`npm install --production`
   - 配置环境变量文件 `.env`
   - 使用PM2或其他进程管理工具启动服务：`pm2 start index.js`

3. **数据库配置**
   - 确保云数据库已正确配置
   - 确保数据库用户具有适当的权限
   - 导入数据库结构：`mysql -u root -p lscvue < database/schema.sql`

## 项目亮点

1. **前后端分离架构**：清晰的分层设计，便于维护和扩展
2. **现代化技术栈**：采用Vue 3 + Vite + Element Plus构建
3. **云数据库支持**：已成功连接真实的云数据库
4. **组件化设计**：高度组件化，代码结构清晰
5. **用户体验优化**：流畅的动画效果，友好的交互反馈
6. **响应式设计**：适配各种设备尺寸
7. **RESTful API设计**：规范的接口设计，便于后端对接
8. **安全性考虑**：登录状态管理，权限控制，敏感信息保护
9. **文章草稿功能**：支持保存为草稿和发布，草稿自动置顶显示
10. **作者权限控制**：只有文章作者才能编辑和删除文章/评论
11. **优雅的确认机制**：使用Element Plus Popconfirm组件进行删除确认
12. **锚点导航功能**：支持Markdown标题的自动锚点生成
13. **文章内容左对齐**：优化阅读体验，符合用户阅读习惯
14. **完整的评论系统**：支持评论发布、嵌套回复、编辑、删除、分页等功能
15. **实时评论更新**：评论发布后自动刷新，无需手动刷新页面
16. **评论@功能**：回复时自动显示@用户名，提升交互体验
17. **评论字数限制**：合理的字数限制，保证评论质量
18. **数据库索引优化**：提高查询性能
19. **环境变量管理**：敏感信息保护，支持不同环境配置
20. **代码规范**：统一的代码风格，便于团队协作
21. **完善的错误处理**：友好的错误提示，便于调试和维护

## 版权说明

本项目仅用于期末考核，请勿用于商业用途。
