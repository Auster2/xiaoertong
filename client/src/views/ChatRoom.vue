<!-- ChatRoom.vue -->
<template>
  <div class="container">
    <!-- 用户信息框 -->
    <div class="user-info">
      <span class="username">{{ username }}</span>
      <img :src="avatarUrl" class="avatar" alt="头像" />
    </div>

    <!-- 视频区域 -->
    <div class="video-container">
      <video class="video" controls autoplay :src="videoSrc"></video>
      <DanmakuOverlay :danmaku-list="danmakuList" />
    </div>

    <!-- 侧边面板 -->
    <div class="side-panel">
      <div class="tabs">
        <button @click="tab = 'danmaku'" :class="{ active: tab === 'danmaku' }">弹幕</button>
        <button @click="tab = 'file'" :class="{ active: tab === 'file' }">文件</button>
        <button @click="tab = 'explain'" :class="{ active: tab === 'explain' }">讲解</button>
      </div>

      <keep-alive>
        <component :is="currentComponent" class="panel-content" @danmaku-created="handleDanmakuCreated" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

import DanmakuPanel from '../components/DanmakuPanel.vue'
import DanmakuOverlay from '../components/DanmakuOverlay.vue'
import FilePanel from '../components/FilePanel.vue'
import ExplainPanel from '../components/ExplainPanel.vue'

const route = useRoute()
const videoId = route.params.videoId

const tab = ref('danmaku')
const videoSrc = `/${videoId}/video/video.mp4`
const danmakuList = ref([])

const currentComponent = computed(() => {
  return {
    danmaku: DanmakuPanel,
    file: FilePanel,
    explain: ExplainPanel
  }[tab.value]
})

// 用户名与头像
const username = ref('用户')
const avatarUrl = ref('')

const getAvatar = (username) => {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E9']
  const colorIndex = username.charCodeAt(0) % colors.length
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex]}&color=fff&size=40&rounded=true`
}

onMounted(async () => {
  try {
    const res = await axios.get(`/api/${videoId}/paragraphs`)
    const firstLine = res.data[0] || '未知用户'
    username.value = firstLine
    avatarUrl.value = getAvatar(firstLine)
  } catch (err) {
    console.error('获取段落失败:', err)
  }
})

// 处理弹幕创建事件
const handleDanmakuCreated = (danmakuData) => {
  danmakuList.value = danmakuData
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100%;
  position: relative;
}

/* 用户信息框样式 */
.user-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.username {
  margin-right: 8px;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

/* 视频区域 */
.video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: auto;
  min-width: 0;
}

.video {
  flex: 1;
  min-width: 0;
  width: auto;
  background: black;
  object-fit: contain;
  max-height: 100vh;
}

/* 侧边面板 */
.side-panel {
  min-width: 20vw;
  width: 20vw;
  display: flex;
  flex-direction: column;
  background: #222;
  color: white;
  overflow: hidden;
  flex-shrink: 0;
  font-size: 1.2vw;
}

.tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
  font-size: 1.2vw;
}

.tabs button {
  flex: 1;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1.2vw;
}

.tabs button.active {
  background: #00aaff;
  font-weight: bold;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  background-color: #282828;
}

/* 小屏幕样式 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .video {
    height: 50vh;
    max-height: 50vh;
    width: 100%;
  }

  .side-panel {
    width: 100%;
    max-height: 50vh;
    font-size: large;
  }

  .tabs button {
    font-size: large;
  }

  .panel-content {
    font-size: large;
  }
}
</style>
