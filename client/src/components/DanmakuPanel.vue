<template>
  <div class="danmaku-panel">
    <div class="messages" ref="msgBox">
      <div v-for="(msg, i) in messages" :key="i" class="message">{{ msg }}</div>
    </div>
    <div class="input-area">
      <input v-model="input" @keyup.enter="sendMessage" placeholder="发送弹幕..." />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { io } from 'socket.io-client'

const socket = io()
const input = ref('')
const messages = ref([])
const msgBox = ref(null)

const sendMessage = () => {
  const user = localStorage.getItem('username') || '匿名'
  if (input.value.trim()) {
    socket.emit('chatMessage', {
      user,
      text: input.value.trim()
    })
    input.value = ''
  }
}

socket.on('chatMessage', (msg) => {
  messages.value.push(`${msg.user}: ${msg.text}`)
})


onMounted(() => {
  socket.on('chatMessage', (msg) => {
    messages.value.push(msg)
    nextTick(() => {
      msgBox.value.scrollTop = msgBox.value.scrollHeight
    })
  })
})
</script>

<style scoped>
.messages {
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  background: #444;
  padding: 6px;
  border-radius: 4px;
  margin-bottom: 6px;
}

.input-area {
  display: flex;
  gap: 6px;
}

input {
  flex: 1;
  padding: 6px;
}

button {
  padding: 6px 12px;
  background: #00aaff;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
