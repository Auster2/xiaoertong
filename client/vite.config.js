import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/socket.io': 'http://localhost:6772',
      '/video': 'http://localhost:6772'
    }
  }
})
