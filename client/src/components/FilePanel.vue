<template>
  <div class="courseware-panel">
    <div class="files" ref="fileBox">
      <div v-for="(file, i) in fileList" :key="i" class="file">
        <a :href="file.url" target="_blank" download>{{ file.name }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const videoId = route.params.videoId

const fileList = ref([])
const fileBox = ref(null)

onMounted(async () => {
  try {
    const res = await axios.get(`/api/${videoId}/files`) // 从后端获取文件列表
    fileList.value = res.data
  } catch (err) {
    console.error('获取文件失败:', err)
  }
})
</script>

<style scoped>
.courseware-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.files {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #111;
}

.file {
  padding: 10px;
  background: #1e1e1e;
  color: #fff;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.file a {
  color: #00aaff;
  text-decoration: none;
  font-weight: bold;
}
</style>
