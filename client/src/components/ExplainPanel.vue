<template>
  <div class="text-panel">
    <div class="paragraphs">
      <div v-for="(para, i) in textList" :key="i" class="paragraph">
        {{ para }}
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

const textList = ref([])

onMounted(async () => {
  try {
    const res = await axios.get(`/api/${videoId}/paragraphs`) // 从服务端获取段落
    textList.value = res.data
  } catch (err) {
    console.error('获取段落失败:', err)
  }
})
</script>

<style scoped>
.text-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #111;
  color: #fff;
  padding: 12px;
  overflow-y: auto;
}

.paragraph {
  margin-bottom: 16px;
  padding: 10px;
  background: #222;
  border-left: 4px solid #00aaff;
  border-radius: 4px;
  line-height: 1.6;
}
</style>
