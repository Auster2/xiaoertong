<template>
  <div class="container">
    <video class="video" controls autoplay :src="videoSrc"></video>

    <div class="side-panel">
      <div class="tabs">
        <button @click="tab = 'danmaku'" :class="{ active: tab === 'danmaku' }">弹幕</button>
        <button @click="tab = 'file'" :class="{ active: tab === 'file' }">文件</button>
        <button @click="tab = 'explain'" :class="{ active: tab === 'explain' }">讲解</button>
      </div>

      <keep-alive>
        <component :is="currentComponent" class="panel-content" />
      </keep-alive>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DanmakuPanel from '../components/DanmakuPanel.vue'
import FilePanel from '../components/FilePanel.vue'
import ExplainPanel from '../components/ExplainPanel.vue'

const tab = ref('danmaku')
const videoSrc = '/video/video.mp4'

const currentComponent = computed(() => {
  return {
    danmaku: DanmakuPanel,
    file: FilePanel,
    explain: ExplainPanel
  }[tab.value]
})
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.video {
  flex: 2;
  width: 100%;
  background: black;
  object-fit: contain;
}

.side-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #222;
  color: white;
  overflow: hidden;
}

.tabs {
  display: flex;
  justify-content: space-around;
  background: #333;
}

.tabs button {
  flex: 1;
  padding: 10px;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
}

.tabs button.active {
  background: #00aaff;
  font-weight: bold;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
</style>
