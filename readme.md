# xiaoertong

如果部署不超过，可以删掉 package-lock.json, node_modules等，再继续尝试

目前已实现的功能：
- 视频播放、发送弹幕、文件下载、显示讲解
- 视频列表
- 上传视频(上传的资料可能乱码，还未解决)


## 端口

改端口

./server/server.js
```js
const PORT = 1338;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
```

把这里设置为你改的端口, localhost不用改

./client/vite.config.js
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/socket.io': 'http://localhost:1338',
      '/video': 'http://localhost:1338'
    }
  }
})

```

## client

```sh
# 到client目录
cd ./client

rm package-lock.json

# 下载
npm install

# 生成静态页面
npm run build
```

## server

```sh
cd ../serevr

npm install 

node server.js
```