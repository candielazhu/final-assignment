<template>

        <div class="container">
            <div class="drop">
                <div class="content">
                    <h2>注册</h2>
                    <form>
                        <div class="inputBox">
                            <input type="text" placeholder="用户名" />
                        </div>
                        <div class="inputBox">
                            <input type="password" placeholder="密码" />
                        </div>
                        <div class="inputBox">
                            <input type="password" placeholder="确认密码" />
                        </div>
                        <div class="inputBox">
                            <input type="button" value="注册" onclick="window.open('zhuce.html');">
                        </div>
                    </form>
                </div>
            </div>
            <a href="#" class="btns">忘记密码？</a>
            <router-link to="/login" class="btns signup">返回登录</router-link>
        </div>
</template>

<script setup>
</script>

<style>
@import '../Login.css';
</style>