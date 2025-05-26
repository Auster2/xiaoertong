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
io.on("connection", (socket) => {
  console.log("用户已连接");

  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg); // 广播弹幕
  });

  socket.on("disconnect", () => {
    console.log("用户断开");
  });
});

const PORT = 6772;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});
