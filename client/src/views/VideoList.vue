<!-- src/views/VideoList.vue -->
<template>
  <div class="video-list">
    <VideoCard
      v-for="video in videos"
      :key="video.id"
      :video-id="video.id"
      :title="video.title"
      :thumbnail-url="video.thumbnail"
    />
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
.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: #111;
  min-height: 100vh;
}
</style>
