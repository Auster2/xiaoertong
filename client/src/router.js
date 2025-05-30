import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './views/LoginPage.vue'
import ChatRoom from './views/ChatRoom.vue'
import VideoList from './views/VideoList.vue'
import UploadPage from './views/UploadPage.vue'

// 添加辅助函数：获取cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/upload', component: UploadPage },
  {
    path: '/videos',
    component: VideoList,
    beforeEnter: (to, from, next) => {
      if (getCookie('username')) {
        next()
      } else {
        next('/login')
      }
    }
  },
  {
    path: '/chat/:videoId',
    component: ChatRoom,
    props: true,
    beforeEnter: (to, from, next) => {
      if (getCookie('username')) {
        next()
      } else {
        next('/login')
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router