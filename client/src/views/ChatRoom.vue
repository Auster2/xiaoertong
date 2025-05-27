<template>
  <div class="container">
    <!-- 视频区域 -->
    <div class="video-container">
      <video class="video" controls autoplay :src="videoSrc"></video>

      <!-- 弹幕层 - 由DanmakuPanel控制 -->
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
import { ref, computed } from 'vue'
import DanmakuPanel from '../components/DanmakuPanel.vue'
import DanmakuOverlay from '../components/DanmakuOverlay.vue'
import FilePanel from '../components/FilePanel.vue'
import ExplainPanel from '../components/ExplainPanel.vue'

const tab = ref('danmaku')
const videoSrc = '/video/video.mp4'
const danmakuList = ref([])

const currentComponent = computed(() => {
  return {
    danmaku: DanmakuPanel,
    file: FilePanel,
    explain: ExplainPanel
  }[tab.value]
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
}

/* 视频区域 - 改进自适应缩放 */
.video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: auto;
  min-width: 0;
}

/* 视频区域 - 改进自适应缩放 */
.video {
  flex: 1;
  min-width: 0;
  width: auto;
  /* 允许视频区域缩小 */
  background: black;
  object-fit: contain;
  max-height: 100vh;
  /* 限制最大高度 */
}

/* 侧边面板 */
.side-panel {
  min-width: 300px;
  width: 300px;
  display: flex;
  flex-direction: column;
  background: #222;
  color: white;
  overflow: hidden;
  flex-shrink: 0;
}

/* 标签页样式 */
.tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
}

.tabs button {
  flex: 1;
  padding: 12px 10px;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tabs button.active {
  background: #00aaff;
  font-weight: bold;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #282828;
}

/* 小屏幕布局调整 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    height: auto;
    /* 允许容器高度根据内容调整 */
    min-height: 100vh;
    /* 保持最小高度为视口高度 */
  }

  .video {
    height: 50vh;
    /* 视频占据 50% 视口高度 */
    max-height: 50vh;
    width: 100%;
  }

  .side-panel {
    width: 100%;
    max-height: 50vh;
    flex-shrink: 0;
  }

  .tabs button {
    padding: 8px 10px;
  }

  .panel-content {
    padding: 10px;
  }
}
</style>