const { executeQuery } = require('../db');

// 获取文章评论列表
async function getComments(req, res) {
  try {
    const articleId = req.query.article_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 验证文章ID
    if (!articleId || isNaN(articleId)) {
      return res.status(400).json({
        code: 400,
        message: '缺少文章ID或文章ID无效'
      });
    }
    
    // 查询主评论
    // 使用字符串插值代替参数绑定，避免类型转换问题
    const mainCommentsSql = `
      SELECT 
        c.id, c.content, c.user_id, c.parent_id, 
        c.created_at, c.updated_at,
        u.username, u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ${articleId} AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const mainComments = await executeQuery(mainCommentsSql);

    // 查询每个主评论的子评论
    for (const comment of mainComments) {
      // 使用字符串插值代替参数绑定
      const childrenSql = `
        SELECT 
          c.id, c.content, c.user_id, c.parent_id, 
          c.created_at, c.updated_at,
          u.username, u.avatar
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ${comment.id}
        ORDER BY c.created_at ASC
      `;
      const children = await executeQuery(childrenSql);
      comment.children = children;
    }

    // 获取总评论数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM comments 
      WHERE article_id = ${articleId}
    `;
    const countResult = await executeQuery(countSql);
    const total = countResult[0].total;

    res.json({
      code: 200,
      message: '获取评论列表成功',
      data: {
        comments: mainComments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取评论列表失败',
      error: error.message
    });
  }
}

// 创建评论
async function createComment(req, res) {
  try {
    const { article_id, content, parent_id } = req.body;
    // 使用前端传递的用户ID，如果没有则使用默认值1
    const user_id = req.body.user_id || 1;

    // 验证输入
    if (!article_id || !content.trim()) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        errors: {
          article_id: !article_id ? '文章ID不能为空' : undefined,
          content: !content.trim() ? '评论内容不能为空' : undefined
        }
      });
    }

    // 插入评论到数据库
    const sql = `
      INSERT INTO comments (article_id, user_id, content, parent_id)
      VALUES (?, ?, ?, ?)
    `;

    const result = await executeQuery(sql, [article_id, user_id, content.trim(), parent_id || null]);

    // 如果是回复评论，更新父评论的回复数
    if (parent_id) {
      // 这里可以根据实际需求更新文章的评论数
      // 例如：UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?
    }

    res.json({
      code: 200,
      message: '评论创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '创建评论失败',
      error: error.message
    });
  }
}

// 更新评论
async function updateComment(req, res) {
  try {
    const id = req.params.id;
    const { content } = req.body;
    const user_id = req.body.user_id || 1;

    // 验证输入
    if (!content.trim()) {
      return res.status(400).json({
        code: 400,
        message: '评论内容不能为空'
      });
    }

    // 检查评论是否存在并属于当前用户
    const checkSql = `
      SELECT id FROM comments 
      WHERE id = ? AND user_id = ?
    `;
    const checkResult = await executeQuery(checkSql, [id, user_id]);

    if (checkResult.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在或无权限修改'
      });
    }

    // 更新评论
    const updateSql = `
      UPDATE comments 
      SET content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    const result = await executeQuery(updateSql, [content.trim(), id, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '更新评论失败'
      });
    }

    res.json({
      code: 200,
      message: '评论更新成功'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '更新评论失败',
      error: error.message
    });
  }
}

// 删除评论
async function deleteComment(req, res) {
  try {
    const id = req.params.id;
    const user_id = req.body.user_id || 1;

    // 检查评论是否存在并属于当前用户
    const checkSql = `
      SELECT id FROM comments 
      WHERE id = ? AND user_id = ?
    `;
    const checkResult = await executeQuery(checkSql, [id, user_id]);

    if (checkResult.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在或无权限删除'
      });
    }

    // 删除评论（级联删除子评论）
    const deleteSql = `
      DELETE FROM comments 
      WHERE id = ? OR parent_id = ?
    `;

    const result = await executeQuery(deleteSql, [id, id]);

    res.json({
      code: 200,
      message: '评论删除成功',
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '删除评论失败',
      error: error.message
    });
  }
}

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment
};