require('dotenv').config();
const express = require('express');
const cors = require('cors');
const articlesRouter = require('./routes/articles');
const usersRouter = require('./routes/users'); // 导入用户路由
const categoriesRouter = require('./routes/categories'); // 导入分类路由
const commentsRouter = require('./routes/comments'); // 导入评论路由
const { testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', articlesRouter); // 文章相关路由
app.use('/api/users', usersRouter); // 用户相关路由，使用完整前缀
app.use('/api', categoriesRouter); // 分类相关路由
app.use('/api/comments', commentsRouter); // 评论相关路由

// 测试路由
app.get('/', (req, res) => {
  res.send('后端服务器运行正常');
});

// 测试数据库连接
async function startServer() {
  await testConnection();
  
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

startServer();