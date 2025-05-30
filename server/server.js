//server.js
const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const fs = require("fs");

const multer = require("multer")
const crypto = require("crypto")

const storage = multer.memoryStorage()
const upload = multer({ storage })

app.post('/api/upload', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'files' }, // 多个文件
]), (req, res) => {
  try {
    const videoId = crypto.randomBytes(4).toString('hex')
    const videoDir = path.join(__dirname, 'public', videoId)
    const fileDir = path.join(videoDir, 'files')

    // 创建目录
    fs.mkdirSync(fileDir, { recursive: true })

    // 保存视频
    if (req.files.video && req.files.video[0]) {
      fs.writeFileSync(path.join(videoDir, 'video.mp4'), req.files.video[0].buffer)
    }

    // 保存封面
    if (req.files.cover && req.files.cover[0]) {
      fs.writeFileSync(path.join(videoDir, 'cover.jpg'), req.files.cover[0].buffer)
    }

    // 保存资料文件
    if (req.files.files) {
      req.files.files.forEach(file => {
        fs.writeFileSync(path.join(fileDir, file.originalname), file.buffer)
      })
    }

    // 保存讲解文本
    const paragraphs = req.body.paragraphs || ''
    fs.writeFileSync(path.join(videoDir, 'paragraphs.txt'), paragraphs)

    res.json({ success: true, videoId })
  } catch (err) {
    console.error('上传失败:', err)
    res.status(500).json({ error: '上传失败' })
  }
})


app.get('/api/videos', (req, res) => {
  const publicDir = path.join(__dirname, 'public')

  fs.readdir(publicDir, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error("读取 public 目录失败:", err)
      return res.status(500).json({ error: "无法读取视频列表" })
    }

    const videos = entries
      .filter(entry => entry.isDirectory())
      .map(dir => {
        const videoId = dir.name
        const videoPath = path.join(publicDir, videoId)

        const paragraphPath = path.join(videoPath, 'paragraphs.txt')
        let title = videoId

        // 判断封面文件
        let coverFilename = null
        const jpgPath = path.join(videoPath, 'cover.jpg')
        const pngPath = path.join(videoPath, 'cover.png')
        if (fs.existsSync(jpgPath)) {
          coverFilename = 'cover.jpg'
        } else if (fs.existsSync(pngPath)) {
          coverFilename = 'cover.png'
        }

        try {
          const content = fs.readFileSync(paragraphPath, 'utf-8')
          const lines = content.split(/\r?\n/).filter(line => line.trim())
          if (lines.length > 0) {
            title = lines[0]
          }
        } catch (e) {
          console.warn(`无法读取 ${videoId}/paragraphs.txt，使用默认标题`)
        }

        return {
          id: videoId,
          title,
          thumbnail: coverFilename ? `/${videoId}/video/${coverFilename}` : '', // 若找不到封面就返回空字符串
        }
      })


    res.json(videos)
  })
})


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

const PORT = 1338;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});