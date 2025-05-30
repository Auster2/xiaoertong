<!-- DanmakuPanel.vue -->
<template>
  <div class="danmaku-panel">
    <!-- 聊天消息区域 -->
    <div class="messages" ref="msgBox">
      <div v-for="(msg, i) in messages" :key="i" class="message-container">
        <div class="avatar">
          <img :src="getAvatar(msg.user)" :alt="msg.user" />
        </div>
        <div class="message-content">
          <div class="username">{{ msg.user }}</div>
          <div class="message-bubble">
            {{ msg.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <input 
        v-model="input" 
        @keyup.enter="sendMessage" 
        placeholder="发送弹幕..." 
        maxlength="100"
      />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { io } from 'socket.io-client'

const emit = defineEmits(['danmaku-created'])

const socket = io()
const input = ref('')
const messages = ref([])
const msgBox = ref(null)
const danmakuList = ref([])
let danmakuId = 0

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const user = getCookie('username') || '匿名'

// 生成头像URL
const getAvatar = (username) => {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E9']
  const colorIndex = username.charCodeAt(0) % colors.length
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex]}&color=fff&size=40&rounded=true`
}

// 生成随机颜色
const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 创建弹幕
const createDanmaku = (user, text) => {
  // 根据屏幕尺寸调整弹幕区域
  const isMobile = window.innerWidth <= 768
  const maxHeight = isMobile ? 200 : 400
  
  const danmaku = {
    id: danmakuId++,
    user,
    text,
    y: Math.random() * maxHeight + 20,
    duration: Math.random() * 3 + 8,
    color: getRandomColor()
  }
  
  danmakuList.value.push(danmaku)
  
  // 向父组件发送弹幕数据
  emit('danmaku-created', danmakuList.value)
  
  // 弹幕结束后移除
  setTimeout(() => {
    const index = danmakuList.value.findIndex(d => d.id === danmaku.id)
    if (index > -1) {
      danmakuList.value.splice(index, 1)
      emit('danmaku-created', danmakuList.value)
    }
  }, danmaku.duration * 1000)
}

// 发送消息
const sendMessage = () => {
  if (input.value.trim()) {
    socket.emit('chatMessage', {
      user,
      text: input.value.trim()
    })
    input.value = ''
  }
}

// Socket事件监听
socket.on('chatMessage', (msg) => {
  // 添加到聊天记录
  messages.value.push(msg)
  
  // 创建弹幕
  createDanmaku(msg.user, msg.text)
  
  // 滚动到底部
  nextTick(() => {
    if (msgBox.value) {
      msgBox.value.scrollTop = msgBox.value.scrollHeight
    }
  })
})

onMounted(() => {
  // 限制消息数量，避免内存泄漏
  setInterval(() => {
    if (messages.value.length > 100) {
      messages.value.splice(0, 20)
    }
  }, 30000)
})
</script>

<style scoped>
.danmaku-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  min-width: 300px;
  position: relative;
  box-sizing: border-box;
  background: #000;
  overflow: hidden;
}

/* 聊天消息区域 */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  /* border-radius: 20px 20px 0 0;
  margin-top: 100px; */
}

.message-container {
  display: flex;
  align-items: flex-start;
  /* margin-bottom: 16px; */
  animation: messageSlideIn 0.3s ease-out;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 60px);
}

.username {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
  font-weight: 500;
}

.message-bubble {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 12px 16px;
  border-radius: 18px 18px 18px 4px;
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  position: relative;
  line-height: 1.4;
}

.message-bubble::before {
  content: '';
  position: absolute;
  left: -6px;
  bottom: 8px;
  width: 0;
  height: 0;
  border-right: 6px solid rgba(255, 255, 255, 0.9);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.input-area {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-top: 1px solid #444;
  background: #222;
  width: 20vw;
}

input {
  flex: 1;
  padding: 6px;
  font-size: 0.7vw;
}

button {
  padding: 6px 12px;
  background: #00aaff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.7vw;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

/* 滚动条美化 */
.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .messages {
    padding: 16px;
    padding-bottom: 120px;
    /* margin-top: 80px; */
  }
  
  /* .message-container {
    margin-bottom: 12px;
  } */
  
  .avatar {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
  
  .message-bubble {
    padding: 10px 14px;
    border-radius: 16px 16px 16px 4px;
    font-size: 14px;
  }
  
  .username {
    font-size: 11px;
  }
  
  .input-area {
    width: 97vw;
    font-size: large;
  }

  input {
    font-size: large;
  }
  
  button {
    font-size: large; 
  }
  
  .danmaku-item {
    font-size: 14px;
  }
  
  .danmaku-user {
    font-size: 12px;
  }
}

/* 小屏幕设备 */
@media (max-width: 480px) {
  .messages {
    padding: 12px;
    padding-bottom: 130px;
    margin-top: 60px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
  
  .message-bubble {
    padding: 8px 12px;
    border-radius: 14px 14px 14px 4px;
    font-size: 13px;
  }
  
  /* .input-area {
    padding: 10px 12px;
    gap: 8px;
  }
  
  input {
    padding: 10px 14px;
  }
  
  button {
    padding: 10px 16px;
    font-size: 13px;
  }
  */
  .danmaku-item {
    font-size: 13px;
  } 
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .message-bubble {
    background: rgba(50, 50, 50, 0.9);
    color: #fff;
  }
  
  .message-bubble::before {
    border-right-color: rgba(50, 50, 50, 0.9);
  }
  
  .username {
    color: rgba(255, 255, 255, 0.8);
  }
  
  /* input {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  input::placeholder {
    color: rgba(0, 0, 0, 0.6);
  } */
}
</style>