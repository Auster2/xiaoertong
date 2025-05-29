<template>
  <div class="login-page">
    <h1>进入聊天室</h1>
    <input v-model="username" placeholder="请输入用户名" @keyup.enter="login" />
    <button @click="login">进入</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const router = useRouter()

// 获取cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

// 设置cookie
const setCookie = (name, value, days) => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = `; expires=${date.toUTCString()}`
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`
}

onMounted(() => {
  const savedUsername = getCookie('username')
  if (savedUsername) {
    username.value = savedUsername
    router.push('/videos')
  }
})

const login = () => {
  if (username.value.trim()) {
    setCookie('username', username.value.trim(), 7) // 保存7天
    router.push('/videos')
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #1e1e1e;
  color: white;
}

input {
  padding: 10px;
  font-size: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  border: none;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background: #00aaff;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>