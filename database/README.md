# 数据库设计文档

## 1. 数据库概述

本数据库设计支持博客/文章系统的核心功能，包括用户管理、文章管理、评论管理和数据统计等。

## 2. 目录结构

```
database/
├── README.md         # 数据库设计文档
├── schema.sql        # 完整数据库架构和初始数据
├── users.sql         # 用户表
├── categories.sql    # 分类表
├── articles.sql      # 文章表
├── comments.sql      # 评论表
├── tags.sql          # 标签表
└── article_tags.sql  # 文章标签关联表
```

## 3. 表结构设计

### 3.1 用户表 (users)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| PASSWORD | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 邮箱 |
| avatar | VARCHAR(255) | DEFAULT '' | 头像URL |
| role | ENUM('admin', 'user') | DEFAULT 'user' | 用户角色 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.2 分类表 (categories)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分类ID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名称 |
| description | TEXT |  | 分类描述 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.3 文章表 (articles)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 文章ID |
| user_id | INT | NOT NULL, FOREIGN KEY(users.id) | 作者ID |
| category_id | INT | FOREIGN KEY(categories.id) | 分类ID |
| title | VARCHAR(200) | NOT NULL | 文章标题 |
| summary | TEXT | NOT NULL | 文章摘要 |
| content | LONGTEXT | NOT NULL | Markdown格式内容 |
| html_content | LONGTEXT | NOT NULL | 渲染后的HTML内容 |
| status | ENUM('draft', 'published') | DEFAULT 'draft' | 文章状态 |
| view_count | INT | DEFAULT 0 | 浏览次数 |
| like_count | INT | DEFAULT 0 | 点赞次数 |
| comment_count | INT | DEFAULT 0 | 评论次数 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.4 评论表 (comments)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 评论ID |
| article_id | INT | NOT NULL, FOREIGN KEY(articles.id) | 文章ID |
| user_id | INT | NOT NULL, FOREIGN KEY(users.id) | 评论者ID |
| parent_id | INT | FOREIGN KEY(comments.id) | 父评论ID（用于回复） |
| content | TEXT | NOT NULL | 评论内容 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.5 标签表 (tags)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 标签ID |
| name | VARCHAR(30) | UNIQUE, NOT NULL | 标签名称 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.6 文章标签关联表 (article_tags)

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 关联ID |
| article_id | INT | NOT NULL, FOREIGN KEY(articles.id) | 文章ID |
| tag_id | INT | NOT NULL, FOREIGN KEY(tags.id) | 标签ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 4. 使用方法

### 4.1 初始化数据库

使用 MySQL 客户端执行完整的数据库架构文件：

```bash
mysql -u root -p < schema.sql
```

或者分步执行：

```bash
mysql -u root -p
CREATE DATABASE lscvue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lscvue;
SOURCE users.sql;
SOURCE categories.sql;
SOURCE articles.sql;
SOURCE comments.sql;
SOURCE tags.sql;
SOURCE article_tags.sql;
```

### 4.2 初始数据

执行 `schema.sql` 后，系统会自动创建以下初始数据：

#### 管理员用户
- 用户名: admin
- 密码: admin123
- 邮箱: admin@example.com

#### 默认分类
- 技术
- 生活
- 读书

#### 默认标签
- vue
- python
- java
- mysql
- web开发
- 数据分析
- 机器学习

## 5. API 接口建议

### 5.1 用户相关接口
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/me` - 获取当前用户信息

### 5.2 文章相关接口
- `GET /api/articles` - 获取文章列表（支持草稿置顶）
- `GET /api/articles/search` - 搜索文章（支持按标题、摘要、作者搜索，支持多种排序方式）
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章（支持草稿和发布）
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 5.3 评论相关接口
- `GET /api/comments?article_id=:id` - 获取文章评论列表（支持分页）
- `POST /api/comments` - 添加文章评论或回复
- `PUT /api/comments/:id` - 编辑评论（仅作者可用）
- `DELETE /api/comments/:id` - 删除评论（仅作者可用）

### 5.4 分类和标签接口
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表

## 6. 数据库优化建议

1. **读写分离**：随着数据量增长，考虑实现读写分离
2. **缓存策略**：使用Redis等缓存技术缓存热门数据
3. **分表分库**：当单表数据量过大时，考虑按时间或ID进行分表
4. **定期备份**：制定合理的数据库备份策略
5. **索引优化**：定期优化慢查询，创建合适的索引

## 7. 安全性考虑

1. **密码加密**：使用bcrypt等安全算法加密存储密码
2. **SQL注入防护**：使用参数化查询或ORM框架防止SQL注入
3. **XSS防护**：对用户输入进行过滤和转义
4. **CSRF防护**：实现CSRF令牌机制
5. **权限控制**：严格控制用户权限
6. **数据验证**：对所有用户输入进行严格验证

## 8. 许可证

MIT License
