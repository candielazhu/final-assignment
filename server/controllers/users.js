const { executeQuery } = require('../db');

// 注册新用户
async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    
    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        errors: {
          username: !username ? '用户名不能为空' : undefined,
          email: !email ? '邮箱不能为空' : undefined,
          password: !password ? '密码不能为空' : undefined
        }
      });
    }
    
    // 检查用户名是否已存在
    const checkUsernameSql = 'SELECT id FROM users WHERE username = ?';
    const usernameResult = await executeQuery(checkUsernameSql, [username]);
    
    if (usernameResult.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
        errors: {
          username: '用户名已被使用'
        }
      });
    }
    
    // 检查邮箱是否已存在
    const checkEmailSql = 'SELECT id FROM users WHERE email = ?';
    const emailResult = await executeQuery(checkEmailSql, [email]);
    
    if (emailResult.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '邮箱已存在',
        errors: {
          email: '邮箱已被使用'
        }
      });
    }
    
    // 直接存储明文密码（不加密）
    const insertSql = `
      INSERT INTO users (username, PASSWORD, email) 
      VALUES (?, ?, ?)
    `;
    
    await executeQuery(insertSql, [username, password, email]);
    
    res.status(201).json({
      code: 200,
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败，请稍后重试',
      error: error.message
    });
  }
}

// 用户登录
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少用户名或密码'
      });
    }
    
    // 查找用户
    const sql = 'SELECT id, username, PASSWORD, email, avatar, role FROM users WHERE username = ?';
    const users = await executeQuery(sql, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    
    const user = users[0];
    
    // 直接比较明文密码（不加密）
    if (password !== user.PASSWORD) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }
    
    // 移除密码，返回用户信息
    const { PASSWORD, ...userInfo } = user;
    
    res.json({
      code: 200,
      message: '登录成功',
      data: userInfo
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败，请稍后重试',
      error: error.message
    });
  }
}

// 获取用户信息
async function getUserInfo(req, res) {
  try {
    const { id } = req.params;
    
    const sql = 'SELECT id, username, email, phone, avatar, bio, role, created_at FROM users WHERE id = ?';
    const users = await executeQuery(sql, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败，请稍后重试',
      error: error.message
    });
  }
}

// 更新用户信息
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, email, phone, avatar, bio } = req.body;
    
    // 验证输入
    if (!username) {
      return res.status(400).json({
        code: 400,
        message: '用户名不能为空'
      });
    }
    
    // 检查用户名是否已被其他用户使用
    const checkUsernameSql = 'SELECT id FROM users WHERE username = ? AND id != ?';
    const usernameResult = await executeQuery(checkUsernameSql, [username, id]);
    
    if (usernameResult.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名已被使用'
      });
    }
    
    // 检查邮箱是否已被其他用户使用
    if (email) {
      const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND id != ?';
      const emailResult = await executeQuery(checkEmailSql, [email, id]);
      
      if (emailResult.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '邮箱已被使用'
        });
      }
    }
    
    // 更新用户信息
    const updateSql = `
      UPDATE users 
      SET username = ?, email = ?, phone = ?, avatar = ?, bio = ? 
      WHERE id = ?
    `;
    
    await executeQuery(updateSql, [username, email, phone, avatar, bio, id]);
    
    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户信息失败，请稍后重试',
      error: error.message
    });
  }
}

// 更新用户密码
async function updatePassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // 验证输入
    if (!newPassword) {
      return res.status(400).json({
        code: 400,
        message: '新密码不能为空'
      });
    }
    
    // 验证密码长度
    if (newPassword.length < 6 || newPassword.length > 20) {
      return res.status(400).json({
        code: 400,
        message: '密码长度在 6 到 20 个字符'
      });
    }
    
    // 更新密码
    const updateSql = `
      UPDATE users 
      SET PASSWORD = ? 
      WHERE id = ?
    `;
    
    await executeQuery(updateSql, [newPassword, id]);
    
    res.json({
      code: 200,
      message: '密码更新成功'
    });
  } catch (error) {
    console.error('更新密码失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新密码失败，请稍后重试',
      error: error.message
    });
  }
}

// 获取用户列表
async function getUsers(req, res) {
  try {
    const { page = 1, pageSize = 10, search = '' } = req.query;
    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    const offset = (pageNum - 1) * size;
    
    // 使用不同的SQL语句构建方式，避免参数问题
    let usersSql = 'SELECT id, username, email, phone, avatar, bio, role, created_at FROM users';
    let countSql = 'SELECT COUNT(*) as count FROM users';
    let usersParams = [];
    let countParams = [];
    
    if (search) {
      const searchTerm = `%${search}%`;
      usersSql += ' WHERE username LIKE ? OR email LIKE ?';
      countSql += ' WHERE username LIKE ? OR email LIKE ?';
      usersParams = [searchTerm, searchTerm];
      countParams = [searchTerm, searchTerm];
    }
    
    // 直接拼接数值，避免参数问题
    usersSql += ` ORDER BY created_at DESC LIMIT ${size} OFFSET ${offset}`;
    
    const users = await executeQuery(usersSql, usersParams);
    const [countResult] = await executeQuery(countSql, countParams);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        users,
        total: countResult.count
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败，请稍后重试',
      error: error.message
    });
  }
}

// 创建用户
async function createUser(req, res) {
  try {
    const { username, email, password, phone, role = 'user', bio = '' } = req.body;
    
    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段',
        errors: {
          username: !username ? '用户名不能为空' : undefined,
          email: !email ? '邮箱不能为空' : undefined,
          password: !password ? '密码不能为空' : undefined
        }
      });
    }
    
    // 检查用户名是否已存在
    const checkUsernameSql = 'SELECT id FROM users WHERE username = ?';
    const usernameResult = await executeQuery(checkUsernameSql, [username]);
    
    if (usernameResult.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
        errors: {
          username: '用户名已被使用'
        }
      });
    }
    
    // 检查邮箱是否已存在
    const checkEmailSql = 'SELECT id FROM users WHERE email = ?';
    const emailResult = await executeQuery(checkEmailSql, [email]);
    
    if (emailResult.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '邮箱已存在',
        errors: {
          email: '邮箱已被使用'
        }
      });
    }
    
    // 插入新用户
    const insertSql = `
      INSERT INTO users (username, PASSWORD, email, phone, role, bio) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(insertSql, [username, password, email, phone, role, bio]);
    
    res.status(201).json({
      code: 200,
      message: '创建成功'
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建用户失败，请稍后重试',
      error: error.message
    });
  }
}

// 删除用户
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // 检查用户是否存在
    const checkSql = 'SELECT id FROM users WHERE id = ?';
    const checkResult = await executeQuery(checkSql, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    // 删除用户
    const deleteSql = 'DELETE FROM users WHERE id = ?';
    await executeQuery(deleteSql, [id]);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除用户失败，请稍后重试',
      error: error.message
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  updateUser,
  updatePassword,
  getUsers,
  createUser,
  deleteUser
};