const { executeQuery } = require('../db');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 获取文章列表
async function getArticles(req, res) {
  try {
    // 从数据库获取文章列表
    const sql = `
      SELECT 
        a.id, a.title, a.summary, a.category_id, a.user_id as author_id, 
        a.view_count as reading, a.comment_count, a.created_at, a.updated_at, a.status,
        c.name as category_name,
        u.username as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `;
    
    const articles = await executeQuery(sql);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: articles,
      total: articles.length
    });
  } catch (error) {
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
    
    // 从数据库获取文章基本信息
    const sql = `
      SELECT 
        a.id, a.title, a.summary, a.category_id, a.user_id as author_id, 
        a.view_count as reading, a.comment_count, a.created_at, a.updated_at, a.status,
        c.name as category_name,
        u.username as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `;
    
    const articles = await executeQuery(sql, [id]);
    
    if (articles.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }
    
    const articleDetail = articles[0];
    
    // 读取对应id的markdown文件内容
    const mdFilePath = path.join(__dirname, '../../src/services/articles', `${id}.md`);
    let content = '';
    
    if (fs.existsSync(mdFilePath)) {
      content = fs.readFileSync(mdFilePath, 'utf8');
    } else {
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
    
    // 插入文章到数据库
    const sql = `
      INSERT INTO articles (title, summary, content, html_content, category_id, user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(sql, [title, summary, content, html_content, category_id, user_id, status]);
    
    // 获取插入的文章ID
    const articleId = result.insertId;
    
    // 可选：保存Markdown文件到服务器
    const articlesDir = path.join(__dirname, '../../src/services/articles');
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }
    
    const mdFilePath = path.join(articlesDir, `${articleId}.md`);
    fs.writeFileSync(mdFilePath, content, 'utf8');
    
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
    
    if (fs.existsSync(mdFilePath)) {
      fs.writeFileSync(mdFilePath, content, 'utf8');
    }
    
    res.json({
      code: 200,
      message: '文章更新成功'
    });
  } catch (error) {
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
    
    if (fs.existsSync(mdFilePath)) {
      fs.unlinkSync(mdFilePath);
    }
    
    res.json({
      code: 200,
      message: '文章删除成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '删除文章失败',
      error: error.message
    });
  }
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};