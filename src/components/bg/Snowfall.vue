<template>
    <canvas ref="snowCanvas" class="snowfall-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const snowCanvas = ref(null)
let animationFrameId = null

onMounted(() => {
    const canvas = snowCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // 设置canvas尺寸
    const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 雪花类
    class Snowflake {
        constructor() {
            this.reset()
        }

        reset() {
            this.x = Math.random() * canvas.width
            this.y = Math.random() * -canvas.height
            this.radius = Math.random() * 3 + 1 // 1-4px
            this.speed = Math.random() * 1 + 0.5 // 0.5-1.5
            this.wind = Math.random() * 0.5 - 0.25 // -0.25 to 0.25
            this.opacity = Math.random() * 0.6 + 0.4 // 0.4-1
        }

        update() {
            this.y += this.speed
            this.x += this.wind
            
            // 重置雪花位置
            if (this.y > canvas.height) {
                this.reset()
                this.y = -10
            }
            
            if (this.x > canvas.width + 10) {
                this.x = -10
            } else if (this.x < -10) {
                this.x = canvas.width + 10
            }
        }

        draw() {
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
            ctx.fill()
            ctx.closePath()
        }
    }

    // 创建雪花数组
    const snowflakes = []
    const snowflakeCount = 150 // 雪花数量，可以调整

    for (let i = 0; i < snowflakeCount; i++) {
        snowflakes.push(new Snowflake())
    }

    // 动画循环
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        snowflakes.forEach(snowflake => {
            snowflake.update()
            snowflake.draw()
        })
        
        animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // 清理函数
    onUnmounted(() => {
        window.removeEventListener('resize', resizeCanvas)
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
        }
    })
})
</script>

<style scoped>
.snowfall-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}
</style>