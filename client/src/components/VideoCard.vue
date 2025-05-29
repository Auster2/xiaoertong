<!-- src/components/VideoCard.vue -->
<template>
  <div class="video-card" @click="goToVideo">
    <img :src="thumbnailUrl" alt="视频封面" />
    <div class="title">{{ title }}</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  videoId: String,
  title: String,
  thumbnailUrl: String
})

const router = useRouter()

const goToVideo = () => {
  router.push(`/chat/${props.videoId}`)
}
</script>

<style scoped>
.video-card {
  width: 280px;
  margin: 0 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.video-card img {
  width: 100%;
  height: 160px;
  border-radius: 4px;
  object-fit: cover;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.video-card:hover img {
  border-radius: 6px;
}

.title {
  font-size: 14px;
  line-height: 1.5;
  color: #18191c;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 42px;
}

.video-card:hover .title {
  color: #00aeec;
}
</style>