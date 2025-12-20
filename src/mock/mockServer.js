import Mock from 'mockjs'
import article from '../services/article.json'

Mock.mock('/mock/getarticles', 'get', {
    code: 200,             // 状态码
    message: '获取成功',    // 状态描述
    data: article,         // 文章列表数据
    total: article.length  // 文章总数
})