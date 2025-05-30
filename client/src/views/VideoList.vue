<template>
  <div class="video-page">
    <div class="video-header">
      <h2 class="page-title">直播回放</h2>
      <div class="avatar-container">
        <img :src="avatarUrl" alt="User Avatar" class="user-avatar" />
      </div>
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
    <router-link to="/upload" class="upload-button-bottom">+</router-link>
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

const username = user; // 获取用户名
const avatarUrl = getAvatar(username); // 生成头像URL

</script>
<style scoped>
.video-page {
  background-color: #f4f4f4;
  min-height: 100vh;
  position: relative; /* 为绝对定位的按钮和头像提供定位上下文 */
}

.video-header {
  padding: 30px 0 20px;
  text-align: center;
  background-color: white;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative; /* 为头像提供定位上下文 */
}

.page-title {
  font-size: 24px;
  color: #18191c;
  font-weight: 600;
  margin: 0;
  padding: 0;
}

/* 头像样式 */
.avatar-container {
  position: absolute;
  top: 10px;
  right: 20px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 加号按钮样式（底部中间） */
.upload-button-bottom {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  background-color: #007bff;
  color: white;
  font-size: 32px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.upload-button-bottom:hover {
  background-color: #0056b3;
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
  overflow-y: auto; /* 添加滚动条 */
  max-height: 80vh; /* 设置最大高度，可根据需要调整 */
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
    width: 48%; /* 每个视频卡片占48%，一排可以放两个 */
    margin: 0 1% 15px; /* 每个视频卡片之间有1%的间距 */
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
    width: 48%; /* 保持一排两个的布局 */
    margin: 0 1% 15px; /* 间距保持一致 */
  }
}
</style>