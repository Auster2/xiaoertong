import { createRouter, createWebHistory } from 'vue-router'
import ChatRoom from './views/ChatRoom.vue'

export const routes = [
  { path: '/', component: ChatRoom }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
