<template>
    <div class="aside">
        <el-row class="tac">
            <el-col width="100%">
                <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
                    @select="handleSelect">
                    <el-menu-item index="2" :route="{ name: 'Main' }">
                        <el-icon>
                            <CoffeeCup />
                        </el-icon>
                        <span>话题</span>
                    </el-menu-item>
                    <el-menu-item index="4" :route="{ name: 'Write' }">
                        <el-icon>
                            <Edit />
                        </el-icon>
                        <span>发布</span>
                    </el-menu-item>
                    <el-sub-menu index="1">
                        <template #title>
                            <el-icon>
                                <Location />
                            </el-icon>
                            <span>待设置</span>
                        </template>
                        <el-menu-item-group title="Group One">
                            <el-menu-item index="1-1">item one</el-menu-item>
                            <el-menu-item index="1-2">item two</el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="Group Two">
                            <el-menu-item index="1-3">item three</el-menu-item>
                        </el-menu-item-group>
                        <el-sub-menu index="1-4">
                            <template #title>item four</template>
                            <el-menu-item index="1-4-1">item one</el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                </el-menu>
            </el-col>
        </el-row>
    </div>
</template>


<script setup>
import {
    Location,
    Setting,
    CoffeeCup,
    Edit
} from '@element-plus/icons-vue'

const handleOpen = (key, keyPath) => {
    console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
    console.log(key, keyPath)
}

const handleSelect = (key, keyPath) => {
    console.log('选中菜单:', key, keyPath)
}
</script>

<style scoped>
.aside {
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
}

:deep(.el-menu) {
    background-color: var(--bg-secondary);
    border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    color: var(--text-primary);
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
    background-color: var(--bg-tertiary);
}

:deep(.el-menu-item.is-active) {
    color: var(--primary-color);
    background-color: var(--bg-tertiary);
}
</style>