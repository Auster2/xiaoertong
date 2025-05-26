import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './views/LoginPage.vue'
import ChatRoom from './views/ChatRoom.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/chat', component: ChatRoom }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
