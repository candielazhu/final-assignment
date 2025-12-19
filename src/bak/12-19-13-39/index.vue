<template>
    <div class="index-container">
        <Header />
        <div class="content">
            <Aside />
            <router-view />
        </div>
    </div>
</template>


<script setup>
import Aside from './Aside.vue'
import Header from './Header.vue'

</script>

<style>
.index-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.content {
    display: flex;
    flex-direction: row;
    height: calc(100vh - 60px);
    background-color: var(--bg-primary);
}
</style>