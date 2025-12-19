<template>
    <div class="container">
        <div class="drop">
            <div class="content">
                <h2>登录</h2>
                <form>
                    <div class="inputBox">
                        <input type="text" placeholder="用户名" />
                    </div>
                    <div class="inputBox">
                        <input type="password" placeholder="密码" />
                    </div>
                    <div class="inputBox">
                        <input type="submit" value="登录" />
                    </div>
                </form>
            </div>
        </div>
        <a href="#" class="btns">忘记密码？</a>
        <router-link to="/register" class="btns signup">注册</router-link>
    </div>
</template>

<script setup>
</script>

<style>
@import '../Login.css';
</style>