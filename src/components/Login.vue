<template>
    <div class="login-container">
        <div class="login-drop">
            <div class="login-content">
                <h2>登录</h2>
                <form @submit.prevent="handleLogin">
                    <div class="login-inputBox">
                        <input type="text" placeholder="用户名" v-model="loginForm.username"
                            :class="{ 'error': errors.username }" @keyup.enter="handleLogin" />
                        <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
                    </div>
                    <div class="login-inputBox">
                        <input type="password" placeholder="密码" v-model="loginForm.password"
                            :class="{ 'error': errors.password }" @keyup.enter="handleLogin" />
                        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
                    </div>
                    <div class="login-inputBox">
                        <input type="submit" value="登录" :disabled="loading" class="login-btn" />
                    </div>
                </form>
            </div>
            <a href="#" class="login-btns">忘记密码？</a>
            <router-link to="/register" class="login-btns login-signup">注册</router-link>
            <router-link to="/" class="login-btns login-back">返回首页</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../axios/request'

// 定义响应式数据
const loginForm = reactive({
    username: '',
    password: ''
})

const errors = reactive({})
const loading = ref(false)

// 获取路由实例
const router = useRouter()

// 表单验证
const validateForm = () => {
    let isValid = true
    const newErrors = {}

    // 用户名验证
    if (!loginForm.username) {
        newErrors.username = '用户名不能为空'
        isValid = false
    }

    // 密码验证
    if (!loginForm.password) {
        newErrors.password = '密码不能为空'
        isValid = false
    } else if (loginForm.password.length < 3) {
        newErrors.password = '密码长度不能少于3个字符'
        isValid = false
    }

    // 更新错误信息
    Object.assign(errors, newErrors)
    return isValid
}

// 登录处理函数
const handleLogin = async () => {
    // 表单验证
    if (!validateForm()) {
        return
    }

    loading.value = true

    try {
        // 调用后端登录API
        const response = await request({
            url: '/users/login',
            method: 'post',
            data: {
                username: loginForm.username,
                password: loginForm.password
            }
        })

        if (response.data.code === 200) {
            // 登录成功，设置登录状态
            localStorage.setItem('isLoggedIn', 'true')
            setCookie('isLoggedIn', 'true', 7)

            // 保存用户信息
            localStorage.setItem('userInfo', JSON.stringify(response.data.data))

            ElMessage.success('登录成功！')
            router.push('/') // 跳转到首页
        } else {
            ElMessage.error(response.data.message || '登录失败')
        }
    } catch (error) {
        console.error('登录错误:', error)

        if (error.response?.data?.code === 401) {
            ElMessage.error('用户名或密码错误')
        } else {
            ElMessage.error('登录失败，请稍后重试')
        }
    } finally {
        loading.value = false
    }
}

// Cookie操作函数
const setCookie = (name, value, days) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}
</script>

<style scoped>
/* 登录页面样式 - 带唯一前缀实现样式隔离 */
.login-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--bg-login);

    /* background: #FFF2DF; */
    /* #454545 */
}

/* 大水珠的外形 */
.login-container .login-drop {
    position: relative;
    width: 400px;
    height: 400px;
    box-shadow: inset 20px 20px 20px rgba(0, 0, 0, 0.05),
        25px 35px 20px rgba(0, 0, 0, 0.05), 25px 35px 30px rgba(0, 0, 0, 0.05),
        inset -20px -20px 25px rgba(255, 255, 255, 0.9);
    transition: 0.5s;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 52% 48% 33% 67% / 38% 45% 55% 62%;
}

/* 鼠标经过后变圆 */
.login-container .login-drop:hover {
    border-radius: 50%;
}

/* 大水珠中的反光  大  白圆点 */
.login-container .login-drop::before {
    content: '';
    position: absolute;
    top: 50px;
    left: 85px;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: #fff;
    opacity: 0.9;
}

/* 大水珠中的反光  小  白圆点 */
.login-container .login-drop::after {
    content: '';
    position: absolute;
    top: 90px;
    left: 110px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #fff;
    opacity: 0.9;
}

/* 三个盒子居中 */
.login-container .login-drop .login-content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    padding: 40px;
    gap: 15px;
    width: 100%;
}

/* 字体颜色大小 */
.login-container .login-drop .login-content h2 {
    position: relative;
    color: #333;
    font-size: 1.8em;
    margin-bottom: 20px;
}

/* 用display隔开账号\密码\登录 */
.login-container .login-drop .login-content form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
    align-items: center;
    width: 100%;
}

/* 让账号\密码\登录拥有一个椭圆形外形 */
.login-container .login-drop .login-content form .login-inputBox {
    position: relative;
    width: 220px;
    box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.1),
        inset -2px -5px 10px rgba(255, 255, 255, 1),
        15px 15px 10px rgba(0, 0, 0, 0.05), 15px 10px 15px rgba(0, 0, 0, 0.025);
    border-radius: 25px;
    padding: 5px 0;
    margin-bottom: 10px;
}

/* 让账号\密码\登录按钮拥有反光效果 */
.login-container .login-drop .login-content form .login-inputBox::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 65%;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 5px;
}

/* 除掉原本的框架 */
.login-container .login-drop .login-content form .login-inputBox input {
    color: #666;
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 1em;
    padding: 8px 15px;
    transition: all 0.3s ease;
}

/* 错误状态样式 */
.login-container .login-drop .login-content form .login-inputBox input.error {
    color: #ff0f5b;
    background: rgba(255, 15, 91, 0.05);
}

/* 错误信息样式 */
.error-message {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75em;
    color: #ff0f5b;
    white-space: nowrap;
    background: rgba(255, 15, 91, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 修改登录按钮的字体 */
.login-container .login-drop .login-content form .login-inputBox input[type='submit'] {
    color: #fff;
    text-transform: uppercase;
    font-size: 1em;
    cursor: pointer;
    letter-spacing: 0.1em;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 10px 15px;
}

/* 禁用状态 */
.login-container .login-drop .login-content form .login-inputBox input[type='submit']:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: scale(0.95);
}

/* 最后一个box的形状和颜色 */
.login-container .login-drop .login-content form .login-inputBox:nth-last-child(1) {
    width: 150px;
    background: #ff0f5b;
    box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.1),
        15px 15px 10px rgba(0, 0, 0, 0.05), 15px 10px 15px rgba(0, 0, 0, 0.025);
    transition: 0.5s;
}

/* 倒数第一个box的鼠标经过 */
.login-container .login-drop .login-content form .login-inputBox:nth-last-child(1):hover {
    width: 180px;
}

.login-btns {
    position: absolute;
    right: -120px;
    bottom: 0;
    width: 120px;
    height: 120px;
    background: #c61dff;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
    color: #fff;
    line-height: 1.2em;
    letter-spacing: 0.1em;
    font-size: 0.8em;
    transition: 0.25s;
    text-align: center;
    box-shadow: inset 10px 10px 10px rgba(190, 1, 254, 0.05),
        15px 25px 10px rgba(190, 1, 254, 0.1), 15px 20px 20px rgba(190, 1, 254, 0.1),
        inset -10px -10px 15px rgba(255, 255, 255, 0.5);
    border-radius: 44% 56% 65% 35% / 57% 58% 42% 43%;
}

.login-btns::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 30px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    opacity: 0.45;
}

.login-btns.login-back {
    bottom: -100px;
    right: 30px;
    width: 80px;
    height: 80px;
    border-radius: 49% 51% 52% 48% / 63% 59% 41% 37%;
    background: #4bd36d;
    box-shadow: inset 10px 10px 10px rgba(1, 180, 255, 0.05),
        15px 25px 10px rgba(1, 180, 255, 0.1), 15px 20px 20px rgba(1, 180, 255, 0.1),
        inset -10px -10px 15px rgba(255, 255, 255, 0.5);
}

.login-btns.login-back::before {
    left: 20px;
    width: 15px;
    height: 15px;
}

.login-btns.login-signup {
    bottom: 150px;
    right: -140px;
    width: 80px;
    height: 80px;
    border-radius: 49% 51% 52% 48% / 63% 59% 41% 37%;
    background: #01b4ff;
    box-shadow: inset 10px 10px 10px rgba(1, 180, 255, 0.05),
        15px 25px 10px rgba(1, 180, 255, 0.1), 15px 20px 20px rgba(1, 180, 255, 0.1),
        inset -10px -10px 15px rgba(255, 255, 255, 0.5);
}

.login-btns.login-signup::before {
    left: 20px;
    width: 15px;
    height: 15px;
}

.login-btns:hover {
    border-radius: 50%;
}
</style>