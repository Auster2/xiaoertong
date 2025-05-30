# xiaoertong

如果部署不超过，可以删掉 package-lock.json, node_modules等，再继续尝试

## 端口

改端口

./server/server.js
```js
const PORT = 1338;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
```

把这里设置为你改的端口

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