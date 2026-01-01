const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

// 用户注册
router.post('/register', userController.registerUser);

// 用户登录
router.post('/login', userController.loginUser);

// 获取用户列表
router.get('/', userController.getUsers);

// 创建用户
router.post('/', userController.createUser);

// 获取用户信息
router.get('/:id', userController.getUserInfo);

// 更新用户信息
router.put('/:id', userController.updateUser);

// 更新用户密码
router.put('/:id/password', userController.updatePassword);

// 删除用户
router.delete('/:id', userController.deleteUser);

module.exports = router;