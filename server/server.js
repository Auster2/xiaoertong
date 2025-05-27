//server.js
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

// 添加这个路由配置，处理所有其他请求
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
})

// WebSocket 弹幕
io.on('connection', (socket) => {
  const ip = socket.handshake.address
  console.log(`新连接来自 ${ip}`)
  io.emit('chatMessage', {
    user: "管理员",
    text: "系统提示：直播内容及互动评论须严格遵守直播规范，严禁传播违法违规、低俗血暴、吸烟酗酒、造谣诈骗等不良有害信息。如有违规，平台将进行封禁直至永久封停账号哦！注意理性打赏，未成年不提倡大额打赏。请勿轻信平台上各类广告信息，谨防上当受骗。"
  });
  socket.on('chatMessage', ({ user, text }) => {
    console.log(`[${ip}] ${user}: ${text}`)
    io.emit('chatMessage', { user, text })
  })
})

const PORT = 6772;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});