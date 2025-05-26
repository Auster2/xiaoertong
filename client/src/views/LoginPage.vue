<template>
  <div class="login-page">
    <h1>进入聊天室</h1>
    <input v-model="username" placeholder="请输入用户名" @keyup.enter="login" />
    <button @click="login">进入</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const router = useRouter()

const login = () => {
  if (username.value.trim()) {
    localStorage.setItem('username', username.value.trim())
    router.push('/chat')
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
