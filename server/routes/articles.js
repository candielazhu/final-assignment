const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articles');

// 获取文章列表
router.get('/articles', articleController.getArticles);

// 获取文章详情
router.get('/articles/:id', articleController.getArticleById);

// 创建文章
router.post('/articles', articleController.createArticle);

// 更新文章
router.put('/articles/:id', articleController.updateArticle);

// 删除文章
router.delete('/articles/:id', articleController.deleteArticle);

module.exports = router;