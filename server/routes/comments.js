const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');

// 获取评论列表
router.get('/', commentsController.getComments);

// 创建评论
router.post('/', commentsController.createComment);

// 更新评论
router.put('/:id', commentsController.updateComment);

// 删除评论
router.delete('/:id', commentsController.deleteComment);

module.exports = router;