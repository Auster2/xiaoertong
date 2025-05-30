<template>
  <div class="upload-page">
    <h2>发布直播回放</h2>

    <div class="form-group">
      <label>视频文件</label>
      <input type="file" accept="video/*" @change="handleVideo" />
    </div>

    <div class="form-group">
      <label>封面图</label>
      <input type="file" accept="image/*" @change="handleCover" />
    </div>

    <div class="form-group">
      <label>资料文件（可多个）</label>
      <input type="file" multiple @change="handleFiles" />
    </div>

    <div class="form-group">
      <label>讲解内容（每段一行）</label>
      <textarea v-model="paragraphs" rows="8" placeholder="请输入讲解内容..."></textarea>
    </div>

    <button @click="handleSubmit">发布</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const videoFile = ref(null)
const coverFile = ref(null)
const fileList = ref([])
const paragraphs = ref('')
const router = useRouter()

const handleVideo = (e) => {
  videoFile.value = e.target.files[0]
}

const handleCover = (e) => {
  coverFile.value = e.target.files[0]
}

const handleFiles = (e) => {
  fileList.value = Array.from(e.target.files)
}

const handleSubmit = async () => {
  if (!videoFile.value || !coverFile.value || !paragraphs.value.trim()) {
    alert('视频、封面和讲解内容不能为空')
    return
  }

  const formData = new FormData()
  formData.append('video', videoFile.value)
  formData.append('cover', coverFile.value)
  fileList.value.forEach(file => formData.append('files', file))
  formData.append('paragraphs', paragraphs.value)

  try {
    const res = await axios.post('/api/upload', formData)
    const videoId = res.data.videoId
    router.push(`/chat/${videoId}`)
  } catch (err) {
    console.error(err)
    alert('上传失败')
  }
}
</script>

<style scoped>
.upload-page {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: #1e1e1e;
  color: white;
  border-radius: 10px;
}
.form-group {
  margin-bottom: 20px;
}
input, textarea {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 5px;
  margin-top: 5px;
}
button {
  padding: 10px 20px;
  background: #00aaff;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
</style>
