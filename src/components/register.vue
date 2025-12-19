<template>
    <div class="register-container">
        <div class="register-drop">
            <div class="register-content">
                <h2>注册</h2>
                <form>
                    <div class="register-inputBox">
                        <input type="text" placeholder="用户名" v-model="username" />
                    </div>
                    <div class="register-inputBox">
                        <input type="password" placeholder="密码" v-model="password" />
                    </div>
                    <div class="register-inputBox">
                        <input type="password" placeholder="确认密码" v-model="confirmPassword" />
                    </div>
                    <div class="register-inputBox">
                        <input type="button" value="注册" @click="handleRegister" />
                    </div>
                </form>
            </div>
            <a href="#" class="register-btns">忘记密码？</a>
            <router-link to="/login" class="register-btns register-signup">返回登录</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 定义响应式数据
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

// 获取路由实例
const router = useRouter()

// 注册处理函数
const handleRegister = () => {
    // 表单验证
    if (!username.value || !password.value || !confirmPassword.value) {
        ElMessage.error('请填写所有必填字段！')
        return
    }

    if (password.value !== confirmPassword.value) {
        ElMessage.error('两次输入的密码不一致！')
        return
    }

    // 检查用户名是否已存在
    const registeredUsers = JSON.parse(getCookie('registeredUsers') || '[]')
    const existingUser = registeredUsers.find(u => u.username === username.value)

    if (existingUser) {
        ElMessage.error('用户名已存在！')
        return
    }

    // 创建新用户
    const newUser = {
        username: username.value,
        password: password.value
    }

    // 添加到用户列表
    registeredUsers.push(newUser)

    // 保存到Cookie
    setCookie('registeredUsers', JSON.stringify(registeredUsers), 7)

    ElMessage.success('注册成功！')
    router.push('/login') // 跳转到登录页面
}

// Cookie操作函数
const setCookie = (name, value, days) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return ''
}


</script>

<style scoped>
/* 注册页面样式 - 带唯一前缀实现样式隔离 */
.register-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f0feff;
}

/* 大水珠的外形 */
.register-container .register-drop {
    position: relative;
    width: 350px;
    height: 350px;
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
.register-container .register-drop:hover {
    border-radius: 50%;
}

/* 大水珠中的反光  大  白圆点 */
.register-container .register-drop::before {
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
.register-container .register-drop::after {
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
.register-container .register-drop .register-content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    padding: 40px;
    gap: 15px;
}

/* 字体颜色大小 */
.register-container .register-drop .register-content h2 {
    position: relative;
    color: #333;
    font-size: 1.5em;
}

/* 用display隔开账号\密码\注册 */
.register-container .register-drop .register-content form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    align-items: center;
}

/* 让账号\密码\注册拥有一个椭圆形外形 */
.register-container .register-drop .register-content form .register-inputBox {
    position: relative;
    width: 170px;
    box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.1),
        inset -2px -5px 10px rgba(255, 255, 255, 1),
        15px 15px 10px rgba(0, 0, 0, 0.05), 15px 10px 15px rgba(0, 0, 0, 0.025);
    border-radius: 25px;
}

/* 让账号\密码\注册按钮拥有反光效果 */
.register-container .register-drop .register-content form .register-inputBox::before {
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
.register-container .register-drop .register-content form .register-inputBox input {
    color: #666;
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 1em;
    padding: 8px 15px;
}

/* 修改注册按钮的字体 */
.register-container .register-drop .register-content form .register-inputBox input[type='button'] {
    color: #fff;
    text-transform: uppercase;
    font-size: 1em;
    cursor: pointer;
    letter-spacing: 0.1em;
    font-weight: 500;
}

/* 最后一个box的形状和颜色 */
.register-container .register-drop .register-content form .register-inputBox:nth-last-child(1) {
    width: 120px;
    background: #ff0f5b;
    box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.1),
        15px 15px 10px rgba(0, 0, 0, 0.05), 15px 10px 15px rgba(0, 0, 0, 0.025);
    transition: 0.5s;
}

/* 倒数第一个box的鼠标经过 */
.register-container .register-drop .register-content form .register-inputBox:nth-last-child(1):hover {
    width: 150px;
}

.register-btns {
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

.register-btns::before {
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

.register-btns.register-signup {
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

.register-btns.register-signup::before {
    left: 20px;
    width: 15px;
    height: 15px;
}

.register-btns:hover {
    border-radius: 50%;
}
</style>