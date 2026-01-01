const { executeQuery } = require('../db');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 获取文章列表
async function getArticles(req, res) {
  try {
    // 调试日志
    console.log('req.query:', req.query);
    console.log('req.body:', req.body);

    // 获取当前用户ID（从前端传递或使用默认值）
    const currentUserId = parseInt((req.query && req.query.user_id) || (req.body && req.body.user_id) || 0);
    
    // 获取分页参数（如果没有提供则返回所有数据）
    const hasPagination = req.query.page && req.query.pageSize;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // 获取排序参数
    const sortBy = req.query.sort_by || 'created_at';
    const sortOrder = req.query.sort_order || 'desc';
    
    // 获取筛选参数
    const statusFilter = req.query.status;
    const searchQuery = req.query.search;

    // 获取是否仅返回当前用户文章的参数（用于Account.vue页面）
    const onlyCurrentUser = req.query.only_current_user === 'true';
    
    // 构建基础WHERE条件
    let whereConditions = [];
    
    // 检查是否为管理员页面请求
    const isAdminPage = req.query.is_admin === 'true';
    
    if (onlyCurrentUser) {
      // Account.vue页面：只返回当前用户的文章
      whereConditions.push(`a.user_id = ${currentUserId}`);
    } else if (!isAdminPage) {
      // Main.vue页面：只返回已发布的文章
      whereConditions.push(`a.status = 'published'`);
    }
    // 管理员页面：不添加状态限制，返回所有文章
    
    // 添加状态筛选（对所有页面有效）
    if (statusFilter && statusFilter !== 'all') {
      whereConditions.push(`a.status = '${statusFilter}'`);
    }
    
    // 添加搜索功能
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = `%${searchQuery}%`;
      whereConditions.push(`(a.title LIKE '${searchTerm}' OR a.summary LIKE '${searchTerm}' OR a.content LIKE '${searchTerm}')`);
    }
    
    // 构建完整的WHERE子句
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // 获取总记录数
    const countSql = `
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `;
    
    // 调试日志：查看完整的countSql
    console.log('完整的countSql:', countSql);
    
    const countResult = await executeQuery(countSql);
    const total = countResult[0].total;
    
    // 构建SQL查询，根据是否有分页参数决定是否添加LIMIT和OFFSET
    let sql = `
      SELECT 
        a.id, a.title, a.summary, a.category_id, a.user_id as author_id, 
        a.view_count as reading, a.comment_count, a.created_at, a.updated_at, a.status,
        c.name as category_name,
        u.username as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.${sortBy} ${sortOrder}
    `;
    
    // 如果有分页参数，添加LIMIT和OFFSET
    if (hasPagination) {
      sql += `
      LIMIT ${pageSize} OFFSET ${offset}
      `;
    }
    
    // 调试日志：查看完整的sql
    console.log('完整的sql:', sql);
    
    const articles = await executeQuery(sql);

    res.json({
      code: 200,
      message: '获取成功',
      data: articles,
      total: total
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取文章列表失败',
      error: error.message
    });
  }
}

// 获取文章详情
async function getArticleById(req, res) {
  try {
    const id = req.params.id;
    // 调试日志
    console.log('req.query:', req.query);
    console.log('req.body:', req.body);

    // 获取当前用户ID（从前端传递或使用默认值）
    const currentUserId = (req.query && req.query.user_id) || (req.body && req.body.user_id) || null;

    // 从数据库获取文章基本信息，过滤条件：
    // 1. 已发布的文章对所有用户可见
    // 2. 草稿文章仅对作者可见
    const sql = `
      SELECT 
        a.id, a.title, a.summary, a.category_id, a.user_id as author_id, 
        a.view_count as reading, a.comment_count, a.created_at, a.updated_at, a.status,
        c.name as category_name,
        u.username as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ? AND (a.status = 'published' OR (a.status = 'draft' AND a.user_id = ?))
    `;

    const articles = await executeQuery(sql, [id, currentUserId || 0]);

    if (articles.length === 0) {
      return res.status(404).json({ 
        code: 404, 
        message: '文章不存在' 
      });
    }

    const articleDetail = articles[0];
    
    // 增加浏览量
    await executeQuery('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [id]);
    // 更新返回结果中的浏览量
    articleDetail.reading += 1;

    // 读取对应id的markdown文件内容
    const mdFilePath = path.join(__dirname, '../../src/services/articles', `${id}.md`);
    let content = '';

    try {
      if (fs.existsSync(mdFilePath)) {
        content = fs.readFileSync(mdFilePath, 'utf8');
      } else {
        content = `# ${articleDetail.title}\n\n这是${articleDetail.title}的详细内容，支持 **Markdown** 格式。`;
      }
    } catch (fileError) {
      console.error('读取文章文件失败:', fileError);
      content = `# ${articleDetail.title}\n\n这是${articleDetail.title}的详细内容，支持 **Markdown** 格式。`;
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...articleDetail,
        content: content
      }
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取文章详情失败',
      error: error.message
    });
  }
}

// 创建文章
async function createArticle(req, res) {
  try {
    const { title, summary, content, category_id, status } = req.body;

    // 验证输入
    if (!title || !content || !summary) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        errors: {
          title: !title ? '标题不能为空' : undefined,
          summary: !summary ? '摘要不能为空' : undefined,
          content: !content ? '内容不能为空' : undefined
        }
      });
    }

    // 将Markdown转换为HTML
    const html_content = marked(content);

    // 使用前端传递的用户ID，如果没有则使用默认值1
    const user_id = req.body.user_id || 1;

    // 提供默认值以避免undefined错误
    const safeCategoryId = category_id || null;
    const safeStatus = status || 'draft';

    // 插入文章到数据库
    const sql = `
      INSERT INTO articles (title, summary, content, html_content, category_id, user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(sql, [title, summary, content, html_content, safeCategoryId, user_id, safeStatus]);

    // 获取插入的文章ID
    const articleId = result.insertId;

    // 可选：保存Markdown文件到服务器
    const articlesDir = path.join(__dirname, '../../src/services/articles');
    try {
      if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir, { recursive: true });
      }

      const mdFilePath = path.join(articlesDir, `${articleId}.md`);
      fs.writeFileSync(mdFilePath, content, 'utf8');
    } catch (fileError) {
      console.error('保存文章文件失败:', fileError);
    }

    res.json({
      code: 200,
      message: '文章保存成功',
      data: {
        id: articleId,
        title,
        summary,
        content,
        html_content,
        category_id,
        user_id,
        status
      }
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建文章失败',
      error: error.message
    });
  }
}

// 更新文章
async function updateArticle(req, res) {
  try {
    const id = req.params.id;
    const { title, summary, content, category_id, status } = req.body;

    // 验证输入
    if (!title || !content || !summary) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        errors: {
          title: !title ? '标题不能为空' : undefined,
          summary: !summary ? '摘要不能为空' : undefined,
          content: !content ? '内容不能为空' : undefined
        }
      });
    }

    // 将Markdown转换为HTML
    const html_content = marked(content);

    // 更新文章到数据库
    const sql = `
      UPDATE articles 
      SET title = ?, summary = ?, content = ?, html_content = ?, category_id = ?, status = ?
      WHERE id = ?
    `;

    const result = await executeQuery(sql, [title, summary, content, html_content, category_id, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }

    // 可选：更新对应的Markdown文件
    const articlesDir = path.join(__dirname, '../../src/services/articles');
    const mdFilePath = path.join(articlesDir, `${id}.md`);

    try {
      if (fs.existsSync(mdFilePath)) {
        fs.writeFileSync(mdFilePath, content, 'utf8');
      }
    } catch (fileError) {
      console.error('更新文章文件失败:', fileError);
    }

    res.json({
      code: 200,
      message: '文章更新成功'
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新文章失败',
      error: error.message
    });
  }
}

// 删除文章
async function deleteArticle(req, res) {
  try {
    const id = req.params.id;

    // 从数据库中删除文章
    const sql = `DELETE FROM articles WHERE id = ?`;

    const result = await executeQuery(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }

    // 可选：删除对应的Markdown文件
    const articlesDir = path.join(__dirname, '../../src/services/articles');
    const mdFilePath = path.join(articlesDir, `${id}.md`);

    try {
      if (fs.existsSync(mdFilePath)) {
        fs.unlinkSync(mdFilePath);
      }
    } catch (fileError) {
      console.error('删除文章文件失败:', fileError);
    }

    res.json({
      code: 200,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除文章失败',
      error: error.message
    });
  }
}

// 搜索文章
async function searchArticles(req, res) {
  try {
    console.log('====== 搜索请求开始 ======');
    console.log('请求参数 req.query:', JSON.stringify(req.query, null, 2));

    // 获取搜索参数
    const { title, subtitle, username, sortBy = 'relevance', user_id } = req.query;

    // 验证是否有搜索条件
    if (!title && !subtitle && !username) {
      console.log('没有提供任何搜索条件');
      return res.json({
        code: 200,
        message: '请提供至少一个搜索条件',
        data: [],
        total: 0
      });
    }

    const currentUserId = user_id || null;
    console.log('当前用户ID:', currentUserId);

    // 构建基础查询
    let sql = `
      SELECT 
        a.id, 
        a.title, 
        a.summary as subtitle, 
        a.user_id, 
        a.view_count as views, 
        a.like_count, 
        a.comment_count, 
        a.created_at as createdAt, 
        a.updated_at, 
        a.status,
        u.username
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE (a.status = 'published' OR (a.status = 'draft' AND a.user_id = ?))
    `;
    
    const params = [currentUserId || 0];
    const searchConditions = [];
    
    // 构建搜索条件
    if (title) {
      console.log('添加标题搜索条件:', title);
      searchConditions.push('(a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)');
      const titlePattern = `%${title}%`;
      params.push(titlePattern, titlePattern, titlePattern);
    }
    
    if (subtitle) {
      console.log('添加副标题搜索条件:', subtitle);
      searchConditions.push('(a.summary LIKE ?)');
      params.push(`%${subtitle}%`);
    }
    
    if (username) {
      console.log('添加用户名搜索条件:', username);
      searchConditions.push('(u.username LIKE ?)');
      params.push(`%${username}%`);
    }
    
    // 添加搜索条件到SQL
    if (searchConditions.length > 0) {
      sql += ' AND (' + searchConditions.join(' OR ') + ')';
    }
    
    // 添加排序
    switch (sortBy) {
      case 'createdAt':
        sql += ' ORDER BY a.created_at DESC';
        break;
      case 'views':
        sql += ' ORDER BY a.view_count DESC';
        break;
      case 'likes':
        sql += ' ORDER BY a.like_count DESC';
        break;
      case 'comments':
        sql += ' ORDER BY a.comment_count DESC';
        break;
      case 'relevance':
      default:
        // 相关度排序
        if (title) {
          sql += `
            ORDER BY 
              CASE 
                WHEN a.title LIKE ? THEN 1
                WHEN a.summary LIKE ? THEN 2
                WHEN a.content LIKE ? THEN 3
                ELSE 4
              END, 
              a.created_at DESC
          `;
          const titlePattern = `%${title}%`;
          params.push(titlePattern, titlePattern, titlePattern);
        } else {
          sql += ' ORDER BY a.created_at DESC';
        }
        break;
    }
    
    console.log('最终SQL:', sql);
    console.log('SQL参数:', params);
    
    // 执行查询
    const results = await executeQuery(sql, params);
    
    console.log('查询结果数量:', results.length);
    if (results.length > 0) {
      console.log('第一条结果示例:', JSON.stringify(results[0], null, 2));
    }
    
    console.log('====== 搜索请求结束 ======\n');
    
    res.json({
      code: 200,
      message: '搜索成功',
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('====== 搜索错误 ======');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('====== 错误结束 ======\n');
    
    res.status(500).json({
      code: 500,
      message: '搜索失败',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  searchArticles
};