<template>
    <div class="upload-page">
        <h2>发布直播回放</h2>

        <!-- 视频上传按钮 -->
        <div class="form-group">
            <label>视频文件</label>
            <div class="upload-button" @click="triggerVideoUpload">
                <span class="upload-text">{{ videoUploaded ? '视频已上传' : '+' }}</span>
                <input type="file" accept="video/*" @change="handleVideo" ref="videoInput" style="display: none;" />
            </div>
        </div>

        <!-- 封面上传按钮 -->
        <div class="form-group">
            <label>封面图</label>
            <div class="upload-button" @click="triggerCoverUpload">
                <span class="upload-text">{{ coverUploaded ? '封面已上传' : '+' }}</span>
                <input type="file" accept="image/*" @change="handleCover" ref="coverInput" style="display: none;" />
            </div>
            <div v-if="coverPreview" class="cover-preview">
                <img :src="coverPreview" alt="封面预览" />
            </div>
        </div>

        <!-- 资料文件上传按钮 -->
        <div class="form-group">
            <label>资料文件（可多个）</label>
            <div class="upload-button" @click="triggerFilesUpload">
                <span class="upload-text">{{ filesUploaded ? '已添加资料' : '+' }}</span>
                <input type="file" multiple @change="handleFiles" ref="filesInput" style="display: none;" />
            </div>
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
const coverPreview = ref(null)
const videoInput = ref(null)
const coverInput = ref(null)
const filesInput = ref(null)
const router = useRouter()

const videoUploaded = ref(false)
const coverUploaded = ref(false)
const filesUploaded = ref(false)

const handleVideo = (e) => {
  videoFile.value = e.target.files[0]
  if (videoFile.value) videoUploaded.value = true
}

const handleCover = (e) => {
  coverFile.value = e.target.files[0]
  if (coverFile.value) {
    const reader = new FileReader()
    reader.onload = (event) => {
      coverPreview.value = event.target.result
      coverUploaded.value = true
    }
    reader.readAsDataURL(coverFile.value)
  }
}

const handleFiles = (e) => {
  fileList.value = Array.from(e.target.files)
  if (fileList.value.length > 0) filesUploaded.value = true
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

const triggerVideoUpload = () => {
    videoInput.value.click()
}

const triggerCoverUpload = () => {
    coverInput.value.click()
}

const triggerFilesUpload = () => {
    filesInput.value.click()
}
</script>

<style scoped>
h2 {
    font-size: 26px;
    margin-bottom: 30px;
}

.form-group {
    width: 100%;
    max-width: 600px;
    margin-bottom: 25px;
    text-align: center;
}

label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 16px;
}

.upload-page {
  height: 100vh;
  overflow-y: auto; /* 加滚动条 */
  margin-top: 40px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom right, #121212, #1e1e1e);
  color: white;
  box-sizing: border-box;
}

.upload-button {
  display: inline-block;
  width: 120px;
  height: 120px;
  background: #2c2c2c;
  border: 2px dashed #00bfff;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.3s ease;
}
.upload-button:hover {
  border-color: #00ffff;
}
.upload-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  color: #00bfff;
  text-align: center;
}


.plus-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    color: #00bfff;
}

.cover-preview {
    margin-top: 15px;
}

.cover-preview img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0, 191, 255, 0.5);
}

textarea {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 2px solid #333;
    background: #2d2d2d;
    color: white;
    resize: none;
    transition: border-color 0.3s ease;
}

textarea:focus {
    outline: none;
    border-color: #00bfff;
}

button {
    width: 100%;
    max-width: 600px;
    padding: 14px 0;
    background: #00bfff;
    border: none;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
}

button:hover {
    background: #0099cc;
}
</style>
