import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'

// 开发环境下引入mock服务
if (import.meta.env.DEV) {
  try {
    import('./mock/index.js')
  } catch (error) {
    console.error('Mock服务加载失败:', error)
  }
}

const app = createApp(App);

// 配置axios实例
const axiosInstance = axios.create({
  baseURL: '/api', // API基础路径
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 从localStorage获取token（如果有）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 将axios挂载到Vue实例
app.config.globalProperties.$axios = axiosInstance;

app.use(router);
app.use(elementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app');