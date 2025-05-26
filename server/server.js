const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 静态资源（用于前端构建后的页面）
app.use(express.static(path.join(__dirname, "../client/dist")));

// 视频资源
app.use("/video", express.static(path.join(__dirname, "public")));

// WebSocket 弹幕
io.on('connection', (socket) => {
  const ip = socket.handshake.address
  console.log(`新连接来自 ${ip}`)

  socket.on('chatMessage', ({ user, text }) => {
    console.log(`[${ip}] ${user}: ${text}`)
    io.emit('chatMessage', { user, text })
  })
})


const PORT = 6772;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
