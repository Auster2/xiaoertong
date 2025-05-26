<template>
  <router-view />
</template>

<script setup>
// 空
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .video {
    height: 40vh;
  }

  .side-panel {
    height: 60vh;
    width: 100%;
  }
}

</style>
