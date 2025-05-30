<!-- src/components/VideoCard.vue -->
<template>
  <div class="video-card" @click="goToVideo">
    <div class="image-container">
      <img :src="thumbnailUrl" alt="视频封面" />
    </div>
    <div class="title">{{ title }}</div>
    <div class="user-info">
      <img :src="avatarUrl" :alt="username" class="avatar" />
      <span class="username">{{ username }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const props = defineProps({
  videoId: String,
  title: String,
  thumbnailUrl: String
})

const router = useRouter()
const username = ref('用户')
const avatarUrl = ref('')

const getAvatar = (username) => {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E9']
  const colorIndex = username.charCodeAt(0) % colors.length
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex]}&color=fff&size=40&rounded=true`
}

const goToVideo = () => {
  router.push(`/chat/${props.videoId}`)
}

onMounted(async () => {
  try {
    const res = await axios.get(`/api/${props.videoId}/paragraphs`)
    const firstLine = res.data[0] || '未知用户'
    username.value = firstLine
    avatarUrl.value = getAvatar(firstLine)
  } catch (err) {
    console.error('获取段落失败:', err)
    // 设置默认头像
    avatarUrl.value = getAvatar(username.value)
  }
})
</script>

<style scoped>
.video-card {
  position: relative;
  width: 280px;
  margin: 0 10px 20px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 宽高比 */
  overflow: hidden;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title {
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 20px;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.username {
  font-size: 12px;
  color: white;
  white-space: nowrap;
}
</style>