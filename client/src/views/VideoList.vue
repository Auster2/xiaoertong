<!-- src/views/VideoList.vue -->
<template>
  <div class="video-page">
    <div class="video-header">
      <h2 class="page-title">直播回放</h2>
      <!-- 这里可以添加其他标题内容或按钮 -->
    </div>
    
    <div class="video-list-container">
      <div class="video-list-side"></div>
      <div class="video-list">
        <VideoCard
          v-for="video in videos"
          :key="video.id"
          :video-id="video.id"
          :title="video.title"
          :thumbnail-url="video.thumbnail"
        />
      </div>
      <div class="video-list-side"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import VideoCard from '../components/VideoCard.vue'

const videos = ref([])

onMounted(async () => {
  const res = await axios.get('/api/videos')
  videos.value = res.data
})
</script>

<style scoped>
.video-page {
  background-color: #f4f4f4;
  min-height: 100vh;
}

.video-header {
  padding: 30px 0 20px;
  text-align: center;
  background-color: white;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 24px;
  color: #18191c;
  font-weight: 600;
  margin: 0;
  padding: 0;
}

.video-list-container {
  display: flex;
  justify-content: center;
  padding-bottom: 40px;
}

.video-list-side {
  flex: 1;
  min-width: 120px;
  max-width: 240px;
}

.video-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-width: 1200px;
  margin: 0 20px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .video-list-side {
    min-width: 60px;
  }
}

@media (max-width: 1200px) {
  .video-list {
    justify-content: space-around;
  }
  
  .video-list-side {
    display: none;
  }
}

@media (max-width: 768px) {
  .video-header {
    padding: 20px 0 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .video-list {
    margin: 0 10px;
  }
  
  .video-card {
    width: 48%;
    margin: 0 1% 15px;
  }
}

@media (max-width: 480px) {
  .video-header {
    padding: 15px 0 10px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .video-card {
    width: 100%;
    margin: 0 0 15px;
  }
}
</style>