//server.js
const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const fs = require("fs");

// 读取某个视频目录下的文件列表
app.get("/api/:videoId/files", (req, res) => {
  const videoId = req.params.videoId;
  const filesDir = path.join(__dirname, "public", videoId, "files");

  fs.readdir(filesDir, (err, files) => {
    if (err) {
      console.error("读取文件失败:", err);
      return res.status(500).json({ error: "读取文件失败" });
    }

    const result = files.map(filename => ({
      name: filename,
      url: `/video/${videoId}/files/${filename}`
    }));
    res.json(result);
  });
});

// 读取某个视频目录下的段落文件
app.get("/api/:videoId/paragraphs", (req, res) => {
  const videoId = req.params.videoId;
  const filePath = path.join(__dirname, "public", videoId, "paragraphs.txt");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("读取段落文件失败:", err);
      return res.status(500).json({ error: "读取段落失败" });
    }

    const paragraphs = data.split(/\r?\n/).filter(line => line.trim() !== "");
    res.json(paragraphs);
  });
});

// 视频资源
app.use('/:videoId/video/:filename', (req, res) => {
  const { videoId, filename } = req.params
  const filePath = path.join(__dirname, 'public', videoId, filename)
  res.sendFile(filePath)
})

// 静态资源（用于前端构建后的页面）
app.use(express.static(path.join(__dirname, "../client/dist")));


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