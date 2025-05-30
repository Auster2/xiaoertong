<template>
  <div class="upload-page">
    <h2>发布直播回放</h2>

    <!-- 视频上传 -->
    <div class="form-group">
      <label>视频文件</label>
      <div class="upload-container">
        <div class="upload-button" @click="triggerVideoUpload" :class="{ 'has-file': videoFile }">
          <span v-if="!videoFile" class="plus-icon">+</span>
          <div v-if="videoFile" class="file-info">
            <div class="file-icon">📹</div>
            <div class="file-name">{{ videoFile.name }}</div>
            <div class="file-size">{{ formatFileSize(videoFile.size) }}</div>
          </div>
          <input type="file" accept="video/*" @change="handleVideo" ref="videoInput" style="display: none;" />
        </div>
        <div v-if="videoFile" class="upload-tip">点击可重新上传</div>
      </div>
    </div>

    <!-- 封面上传 -->
    <div class="form-group">
      <label>封面图</label>
      <div class="upload-container">
        <div class="upload-button" @click="triggerCoverUpload" :class="{ 'has-cover': coverFile }">
          <span v-if="!coverFile" class="plus-icon">+</span>
          <div v-if="coverPreview" class="cover-preview-in-button">
            <img :src="coverPreview" alt="封面预览" />
          </div>
          <input type="file" accept="image/*" @change="handleCover" ref="coverInput" style="display: none;" />
        </div>
        <div v-if="coverFile" class="upload-tip">点击可重新上传</div>
      </div>
    </div>

    <!-- 资料文件上传 -->
    <div class="form-group">
      <label>资料文件（可多个）</label>
      <div class="upload-container">
        <div class="upload-button" @click="triggerFilesUpload">
          <span class="plus-icon">+</span>
          <input type="file" multiple @change="handleFiles" ref="filesInput" style="display: none;" />
        </div>
        <div class="upload-tip">支持多次上传，累计添加文件</div>
        
        <!-- 已上传文件列表 -->
        <div v-if="fileList.length > 0" class="file-list">
          <div v-for="(file, index) in fileList" :key="index" class="file-item">
            <div class="file-info">
              <span class="file-icon">📄</span>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <button @click="removeFile(index)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 讲解内容 -->
    <div class="form-group">
      <label>视频标题及简介</label>
      <textarea v-model="paragraphs" rows="8" placeholder="第一行为标题，剩下为简介"></textarea>
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

// 文件类型验证配置
const fileTypes = {
  video: {
    accept: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
    maxSize: 500 * 1024 * 1024 // 500MB
  },
  image: {
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  document: {
    accept: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
             'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
             'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationxml.presentation',
             'text/plain', 'text/csv'],
    maxSize: 50 * 1024 * 1024 // 50MB
  }
}

// 验证文件类型
const validateFile = (file, type) => {
  const config = fileTypes[type]
  
  if (!config.accept.includes(file.type)) {
    const acceptedTypes = config.accept.map(t => t.split('/')[1]).join(', ')
    alert(`文件类型不支持！请选择以下格式：${acceptedTypes}`)
    return false
  }
  
  if (file.size > config.maxSize) {
    alert(`文件大小超限！最大支持 ${formatFileSize(config.maxSize)}`)
    return false
  }
  
  return true
}

// 安全地处理文件名编码
const safeFileName = (fileName) => {
  try {
    // 尝试修复常见的编码问题
    if (fileName.includes('�') || /[\u00C0-\u00FF]/.test(fileName)) {
      // 如果包含乱码字符，尝试重新编码
      const bytes = new TextEncoder().encode(fileName)
      return new TextDecoder('utf-8').decode(bytes)
    }
    return fileName
  } catch (error) {
    console.warn('文件名编码处理失败:', error)
    // 如果处理失败，返回原文件名
    return fileName
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleVideo = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (validateFile(file, 'video')) {
    // 安全处理视频文件名
    const fileName = safeFileName(file.name)
    videoFile.value = new File([file], fileName, { type: file.type })
  }
  // 清空input，允许重复选择同一文件
  e.target.value = ''
}

const handleCover = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (validateFile(file, 'image')) {
    // 安全处理封面文件名
    const fileName = safeFileName(file.name)
    coverFile.value = new File([file], fileName, { type: file.type })
    const reader = new FileReader()
    reader.onload = (event) => {
      coverPreview.value = event.target.result
    }
    reader.readAsDataURL(coverFile.value)
  }
  // 清空input，允许重复选择同一文件
  e.target.value = ''
}

const handleFiles = (e) => {
  const files = Array.from(e.target.files)
  const validFiles = []
  
  files.forEach(file => {
    if (validateFile(file, 'document')) {
      // 安全处理资料文件名
      const fileName = safeFileName(file.name)
      // 创建新的File对象，确保名称正确
      const correctedFile = new File([file], fileName, { type: file.type })
      
      // 检查是否已存在同名文件
      const existingIndex = fileList.value.findIndex(f => f.name === fileName)
      if (existingIndex !== -1) {
        // 替换同名文件
        fileList.value[existingIndex] = correctedFile
        alert(`已替换同名文件：${fileName}`)
      } else {
        validFiles.push(correctedFile)
      }
    }
  })
  
  // 添加新文件到列表
  fileList.value.push(...validFiles)
  
  // 清空input，允许重复选择
  e.target.value = ''
}

// 移除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1)
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
* {
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.upload-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: white;
  overflow-y: auto;
  padding: 20px;
}

.upload-page::-webkit-scrollbar {
  width: 8px;
}

.upload-page::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 4px;
}

.upload-page::-webkit-scrollbar-thumb {
  background: #00aaff;
  border-radius: 4px;
}

.upload-page::-webkit-scrollbar-thumb:hover {
  background: #0077cc;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  margin-top: 0;
}

.form-group {
  width: 100%;
  max-width: 800px;
  margin: 0 auto 30px auto;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 16px;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-button {
  display: inline-block;
  width: 150px;
  height: 150px;
  background: #2d2d2d;
  border: 2px dashed #00aaff;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.upload-button:hover {
  border-color: #0077cc;
  background: #333;
}

.upload-button.has-file {
  border-style: solid;
  border-color: #00ff88;
}

.upload-button.has-cover {
  border-style: solid;
  border-color: #00ff88;
  padding: 0;
}

.plus-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: #00aaff;
}

.file-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
  padding: 15px;
}

.file-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  margin-bottom: 8px;
  word-break: break-all;
  line-height: 1.3;
  max-height: 40px;
  overflow: hidden;
}

.file-size {
  font-size: 12px;
  color: #aaa;
}

.cover-preview-in-button {
  width: 100%;
  height: 100%;
  position: relative;
}

.cover-preview-in-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.upload-tip {
  margin-top: 10px;
  font-size: 14px;
  color: #aaa;
}

.file-list {
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #444;
  border-radius: 8px;
  background: #2a2a2a;
}

.file-list::-webkit-scrollbar {
  width: 6px;
}

.file-list::-webkit-scrollbar-track {
  background: #333;
}

.file-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
  transition: background 0.2s;
}

.file-item:hover {
  background: #353535;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item .file-info {
  position: static;
  transform: none;
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  text-align: left;
  padding: 0;
}

.file-item .file-icon {
  font-size: 20px;
  margin-bottom: 0;
}

.file-item .file-name {
  font-size: 14px;
  margin-bottom: 0;
  flex: 1;
  max-height: none;
  overflow: visible;
}

.file-item .file-size {
  font-size: 12px;
  color: #aaa;
  min-width: 60px;
}

.remove-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #cc0000;
}

textarea {
  width: 100%;
  max-width: 800px;
  padding: 15px;
  border: 2px solid #444;
  border-radius: 8px;
  margin-top: 10px;
  background: #2d2d2d;
  color: white;
  resize: vertical;
  min-height: 150px;
  font-size: 14px;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: #00aaff;
}

button {
  width: 100%;
  max-width: 400px;
  padding: 15px 0;
  background: #00aaff;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  margin: 30px auto 20px auto;
  font-size: 16px;
  transition: background 0.2s;
}

button:hover {
  background: #0077cc;
}

button:active {
  background: #005599;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-page {
    padding: 15px;
  }
  
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .upload-button {
    width: 120px;
    height: 120px;
  }
  
  .plus-icon {
    font-size: 28px;
  }
  
  .file-info {
    padding: 10px;
  }
  
  .file-icon {
    font-size: 28px;
  }
  
  .file-name {
    font-size: 12px;
  }
  
  textarea {
    min-height: 120px;
  }
}
</style>