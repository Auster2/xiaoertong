<template>
  <div class="container">
    <video controls autoplay :src="videoSrc"></video>
    <div class="chat">
      <div class="messages" ref="msgBox">
        <div v-for="(msg, i) in messages" :key="i" class="message">{{ msg }}</div>
      </div>
      <div class="input-area">
        <input v-model="input" @keyup.enter="sendMessage" placeholder="输入弹幕..." />
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

const input = ref('')
const messages = ref([])
const msgBox = ref(null)
const socket = io() // 自动连接本机服务
const videoSrc = '/video/video.mp4'

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
.container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

video {
  flex: 2;
  width: 100%;
  height: auto;
  max-height: 100vh;
  background: black;
}

.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  color: #fff;
  padding: 8px;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  background: #333;
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 6px;
  word-wrap: break-word;
  font-size: 14px;
}

.input-area {
  display: flex;
  padding: 8px 0;
  gap: 6px;
}

input {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #00aaff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  video {
    width: 100%;
    height: auto;
  }

  .chat {
    height: 40vh;
  }

  .input-area input {
    font-size: 12px;
  }

  .input-area button {
    font-size: 12px;
    padding: 6px 12px;
  }
}

</style>
