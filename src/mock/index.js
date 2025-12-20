import Mock from 'mockjs'

// 配置Mock延迟
Mock.setup({
  timeout: '300-600'
})

// 模拟用户登录
Mock.mock('/api/users/login', 'post', (req) => {
  const { username, password } = JSON.parse(req.body)
  if (username === 'admin' && password === '123456') {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-token-123456',
        userInfo: {
          id: 1,
          username: 'admin',
          avatar: '',
          role: 'admin'
        }
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }
})

// 模拟用户注册
Mock.mock('/api/users/register', 'post', (req) => {
  const { username, password } = JSON.parse(req.body)
  if (username && password) {
    return {
      code: 200,
      message: '注册成功',
      data: {
        id: Mock.Random.integer(1, 100),
        username: username
      }
    }
  } else {
    return {
      code: 400,
      message: '用户名和密码不能为空'
    }
  }
})

// 模拟获取文章列表
Mock.mock('/api/articles', 'get', () => {
  const articles = Mock.mock({
    'list|10-20': [{
      'id|+1': 1,
      'title': '@ctitle(10, 20)',
      'content': '@cparagraph(3, 8)',
      'user_id': 1,
      'username': '@cname',
      'created_at': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'updated_at': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'view_count': '@integer(0, 1000)',
      'like_count': '@integer(0, 100)',
      'comment_count': '@integer(0, 50)'
    }]
  })
  return {
    code: 200,
    message: '获取成功',
    data: articles.list,
    total: articles.list.length
  }
})

// 模拟获取文章详情
Mock.mock(/\/api\/articles\/\d+/, 'get', (req) => {
  const id = req.url.match(/\d+/)[0]
  return {
    code: 200,
    message: '获取成功',
    data: {
      id: parseInt(id),
      title: '@ctitle(10, 20)',
      content: '@cparagraph(5, 15)',
      html_content: '<h1>@ctitle(10, 20)</h1><p>@cparagraph(5, 15)</p>',
      user_id: 1,
      username: '@cname',
      created_at: '@datetime("yyyy-MM-dd HH:mm:ss")',
      updated_at: '@datetime("yyyy-MM-dd HH:mm:ss")',
      view_count: '@integer(0, 1000)',
      like_count: '@integer(0, 100)',
      comment_count: '@integer(0, 50)',
      tags: ['@ctitle(2, 5)', '@ctitle(2, 5)', '@ctitle(2, 5)']
    }
  }
})

// 模拟获取文章评论
Mock.mock(/\/api\/articles\/\d+\/comments/, 'get', (req) => {
  const comments = Mock.mock({
    'list|5-15': [{
      'id|+1': 1,
      'article_id': parseInt(req.url.match(/\d+/)[0]),
      'user_id': '@integer(1, 100)',
      'username': '@cname',
      'content': '@cparagraph(1, 3)',
      'parent_id': null,
      'created_at': '@datetime("yyyy-MM-dd HH:mm:ss")',
      'children|0-3': [{
        'id|+1': 100,
        'article_id': parseInt(req.url.match(/\d+/)[0]),
        'user_id': '@integer(1, 100)',
        'username': '@cname',
        'content': '@cparagraph(1, 2)',
        'parent_id|+1': 1,
        'created_at': '@datetime("yyyy-MM-dd HH:mm:ss")'
      }]
    }]
  })
  return {
    code: 200,
    message: '获取成功',
    data: comments.list,
    total: comments.list.length
  }
})

// 模拟添加评论
Mock.mock(/\/api\/articles\/\d+\/comments/, 'post', (req) => {
  const { content, parent_id } = JSON.parse(req.body)
  return {
    code: 200,
    message: '评论成功',
    data: {
      id: Mock.Random.integer(1000, 9999),
      article_id: parseInt(req.url.match(/\d+/)[0]),
      user_id: 1,
      username: '当前用户',
      content: content,
      parent_id: parent_id || null,
      created_at: new Date().toISOString(),
      children: []
    }
  }
})

// 模拟删除评论
Mock.mock(/\/api\/comments\/\d+/, 'delete', () => {
  return {
    code: 200,
    message: '删除成功'
  }
})

// 模拟获取分类列表
Mock.mock('/api/categories', 'get', () => {
  const categories = Mock.mock({
    'list|5-10': [{
      'id|+1': 1,
      'name': '@ctitle(2, 6)',
      'description': '@cparagraph(1, 2)',
      'created_at': '@datetime("yyyy-MM-dd HH:mm:ss")'
    }]
  })
  return {
    code: 200,
    message: '获取成功',
    data: categories.list
  }
})

// 模拟获取标签列表
Mock.mock('/api/tags', 'get', () => {
  const tags = Mock.mock({
    'list|10-20': [{
      'id|+1': 1,
      'name': '@ctitle(2, 5)',
      'created_at': '@datetime("yyyy-MM-dd HH:mm:ss")'
    }]
  })
  return {
    code: 200,
    message: '获取成功',
    data: tags.list
  }
})

console.log('Mock服务已启动')
