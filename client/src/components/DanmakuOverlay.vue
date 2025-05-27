<!-- DanmakuOverlay.vue -->
<template>
  <div class="danmaku-layer">
    <div
      v-for="danmaku in danmakuList"
      :key="danmaku.id"
      class="danmaku-item"
      :style="{
        top: danmaku.y + 'px',
        animationDuration: danmaku.duration + 's',
        color: danmaku.color
      }"
    >
      <span class="danmaku-user">[{{ danmaku.user }}]</span>
      {{ danmaku.text }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  danmakuList: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.danmaku-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  right: -100%;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: danmaku-move linear;
  animation-fill-mode: forwards;
  z-index: 100;
}

.danmaku-user {
  font-size: 12px;
  opacity: 0.8;
  margin-right: 4px;
}

@keyframes danmaku-move {
  from {
    right: -100%;
  }
  to {
    right: 100%;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .danmaku-item {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .danmaku-item {
    font-size: 12px;
  }
}
</style>