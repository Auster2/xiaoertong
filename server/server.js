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
const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB 限制
    files: 50 // 最多50个文件
  }
})

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

    // 获取表单数据
    const username = req.body.username || '匿名'
    const title = req.body.title || '未命名视频'
    const description = req.body.description || ''

    // 验证必需字段
    if (!req.files.video || !req.files.video[0]) {
      return res.status(400).json({ error: '视频文件是必需的' })
    }

    if (!req.files.cover || !req.files.cover[0]) {
      return res.status(400).json({ error: '封面图是必需的' })
    }

    if (!title.trim()) {
      return res.status(400).json({ error: '标题是必需的' })
    }

    // 保存视频文件
    const videoFile = req.files.video[0]
    const videoExtension = getFileExtension(videoFile.originalname) || 'mp4'
    const videoFileName = `video.${videoExtension}`
    fs.writeFileSync(path.join(videoDir, videoFileName), videoFile.buffer)

    // 保存封面文件
    const coverFile = req.files.cover[0]
    const coverExtension = getFileExtension(coverFile.originalname) || 'jpg'
    const coverFileName = `cover.${coverExtension}`
    fs.writeFileSync(path.join(videoDir, coverFileName), coverFile.buffer)

    // 保存资料文件
    const uploadedFiles = []
    if (req.files.files && req.files.files.length > 0) {
      req.files.files.forEach(file => {
        // 使用安全的文件名
        const safeFileName = sanitizeFileName(file.originalname)
        const filePath = path.join(fileDir, safeFileName)
        fs.writeFileSync(filePath, file.buffer)
        uploadedFiles.push({
          originalName: file.originalname,
          savedName: safeFileName,
          size: file.size,
          mimetype: file.mimetype
        })
      })
    }

    // 创建元数据对象
    const metadata = {
      videoId,
      username: username.trim(),
      title: title.trim(),
      description: description.trim(),
      videoFile: {
        name: videoFileName,
        originalName: videoFile.originalname,
        size: videoFile.size,
        mimetype: videoFile.mimetype
      },
      coverFile: {
        name: coverFileName,
        originalName: coverFile.originalname,
        size: coverFile.size,
        mimetype: coverFile.mimetype
      },
      files: uploadedFiles,
      uploadTime: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    // 保存元数据到JSON文件
    fs.writeFileSync(
      path.join(videoDir, 'metadata.json'), 
      JSON.stringify(metadata, null, 2),
      'utf-8'
    )

    // 为了向后兼容，也保存旧格式的paragraphs.txt
    const paragraphsContent = [username, title, description].join('\n')
    fs.writeFileSync(path.join(videoDir, 'paragraphs.txt'), paragraphsContent, 'utf-8')

    console.log(`视频上传成功: ${videoId}, 标题: ${title}, 用户: ${username}`)

    res.json({ 
      success: true, 
      videoId,
      message: '上传成功',
      metadata: {
        title,
        username,
        uploadTime: metadata.uploadTime
      }
    })
  } catch (err) {
    console.error('上传失败:', err)
    
    // 根据错误类型返回不同的错误信息
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '文件大小超出限制' })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ error: '文件数量超出限制' })
    }
    if (err.code === 'ENOSPC') {
      return res.status(507).json({ error: '服务器存储空间不足' })
    }
    
    res.status(500).json({ error: '上传失败: ' + err.message })
  }
})

// 获取文件扩展名
function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return null
  const lastDot = filename.lastIndexOf('.')
  return lastDot !== -1 ? filename.slice(lastDot + 1).toLowerCase() : null
}

// 清理文件名，移除危险字符
function sanitizeFileName(filename) {
  if (!filename || typeof filename !== 'string') return 'unnamed_file'
  
  // 移除路径分隔符和其他危险字符
  let safe = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
  
  // 限制长度
  if (safe.length > 255) {
    const ext = getFileExtension(safe)
    const nameWithoutExt = safe.slice(0, safe.lastIndexOf('.'))
    safe = nameWithoutExt.slice(0, 250 - (ext ? ext.length + 1 : 0)) + (ext ? '.' + ext : '')
  }
  
  // 确保不是空字符串
  return safe.trim() || 'unnamed_file'
}

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

        // 优先读取metadata.json
        const metadataPath = path.join(videoPath, 'metadata.json')
        const paragraphPath = path.join(videoPath, 'paragraphs.txt')
        
        let title = videoId
        let username = '匿名'
        let description = ''
        let uploadTime = null
        let coverFilename = null

        // 尝试读取metadata.json
        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
          const metadata = JSON.parse(metadataContent)
          title = metadata.title || videoId
          username = metadata.username || '匿名'
          description = metadata.description || ''
          uploadTime = metadata.uploadTime
          coverFilename = metadata.coverFile?.name
        } catch (e) {
          // 如果metadata.json不存在，尝试读取paragraphs.txt（向后兼容）
          try {
            const content = fs.readFileSync(paragraphPath, 'utf-8')
            const lines = content.split(/\r?\n/).filter(line => line.trim())
            if (lines.length >= 2) {
              username = lines[0]
              title = lines[1]
              description = lines[2] || ''
            } else if (lines.length >= 1) {
              title = lines[0]
            }
          } catch (e2) {
            console.warn(`无法读取 ${videoId} 的元数据，使用默认值`)
          }
        }

        // 如果从metadata中没有获取到封面文件名，则尝试查找
        if (!coverFilename) {
          const possibleExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
          for (const ext of possibleExtensions) {
            const coverPath = path.join(videoPath, `cover.${ext}`)
            if (fs.existsSync(coverPath)) {
              coverFilename = `cover.${ext}`
              break
            }
          }
        }

        return {
          id: videoId,
          title,
          username,
          description,
          uploadTime,
          thumbnail: coverFilename ? `/${videoId}/video/${coverFilename}` : '',
        }
      })
      .sort((a, b) => {
        // 按上传时间倒序排列，最新的在前面
        if (a.uploadTime && b.uploadTime) {
          return new Date(b.uploadTime) - new Date(a.uploadTime)
        }
        if (a.uploadTime) return -1
        if (b.uploadTime) return 1
        return b.id.localeCompare(a.id) // 如果没有时间戳，按ID倒序
      })

    res.json(videos)
  })
})

// 获取视频详细信息
app.get('/api/:videoId/info', (req, res) => {
  const videoId = req.params.videoId
  const videoPath = path.join(__dirname, 'public', videoId)
  const metadataPath = path.join(videoPath, 'metadata.json')

  try {
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)
    res.json(metadata)
  } catch (err) {
    // 如果metadata.json不存在，尝试从paragraphs.txt构建基本信息
    const paragraphPath = path.join(videoPath, 'paragraphs.txt')
    try {
      const content = fs.readFileSync(paragraphPath, 'utf-8')
      const lines = content.split(/\r?\n/).filter(line => line.trim())
      
      const basicInfo = {
        videoId,
        username: lines[0] || '匿名',
        title: lines[1] || videoId,
        description: lines[2] || '',
        uploadTime: null,
        lastModified: null
      }
      
      res.json(basicInfo)
    } catch (err2) {
      console.error(`无法读取视频 ${videoId} 的信息:`, err2)
      res.status(404).json({ error: '视频信息不存在' })
    }
  }
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

// 视频资源路由 - 支持更多文件类型
app.use('/:videoId/video/:filename', (req, res) => {
  const { videoId, filename } = req.params
  const filePath = path.join(__dirname, 'public', videoId, filename)
  
  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' })
  }

  // 设置适当的Content-Type
  const ext = getFileExtension(filename)
  const mimeTypes = {
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  }

  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext])
  }

  res.sendFile(filePath)
})

// 文件下载路由
app.use('/:videoId/files/:filename', (req, res) => {
  const { videoId, filename } = req.params
  const filePath = path.join(__dirname, 'public', videoId, 'files', filename)
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' })
  }

  res.download(filePath, filename)
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

  // 只发给当前连接的用户
  socket.emit('chatMessage', {
    user: "管理员",
    text: "系统提示：直播内容及互动评论须严格遵守直播规范，严禁传播违法违规、低俗血暴、吸烟酗酒、造谣诈骗等不良有害信息。如有违规，平台将进行封禁直至永久封停账号哦！注意理性打赏，未成年不提倡大额打赏。请勿轻信平台上各类广告信息，谨防上当受骗。"
  })

  // 转发聊天信息给所有人
  socket.on('chatMessage', ({ user, text }) => {
    console.log(`[${ip}] ${user}: ${text}`)
    io.emit('chatMessage', { user, text })
  })
})

const PORT = 1338;
server.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});