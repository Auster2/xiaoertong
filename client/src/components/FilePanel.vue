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
  if (input.value.trim()) {
    socket.emit('chatMessage', input.value)
    input.value = ''
  }
}

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
.danmaku-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.input-area {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-top: 1px solid #444;
  background: #222;
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