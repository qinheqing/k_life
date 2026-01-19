# K-Life Docker 部署指南

本文档提供完整的 Docker 部署说明，包括本地构建、推送到 Docker Hub 以及在群晖 NAS 上部署。

## 📋 前提条件

- Docker Desktop 已安装并运行
- Docker Hub 账号（仓库：qinheqing/k-life）
- 群晖 NAS 支持 Docker Container Manager

## 🚀 快速开始

### 方式一：使用自动化脚本（推荐）

在项目根目录执行：

```bash
# 一键构建并推送
./build-and-push.sh
```

### 方式二：手动构建和推送

```bash
# 1. 构建 Docker 镜像
docker build -t qinheqing/k-life:latest .

# 2. 测试运行（可选）
docker run -d -p 3003:80 --name k-life-test qinheqing/k-life:latest

# 3. 登录 Docker Hub
docker login

# 4. 推送镜像
docker push qinheqing/k-life:latest
```

## 📦 Docker 文件说明

### 1. **Dockerfile** - 多阶段构建
- **Stage 1 (Builder)**: Node.js 20 Alpine
  - 安装依赖
  - 构建生产版本
- **Stage 2 (Runtime)**: Nginx Alpine
  - 轻量级 Web 服务器
  - 静态文件服务
  - 健康检查

### 2. **docker-compose.yml** - 部署配置
```yaml
服务配置:
  - 端口: 3003:80
  - 重启策略: unless-stopped
  - 时区: Asia/Shanghai
  - 健康检查: 已启用
```

### 3. **nginx.conf** - Nginx 配置
- Gzip 压缩
- SPA 路由支持
- 安全头设置
- 静态文件缓存策略

### 4. **.dockerignore** - 构建优化
排除不必要的文件，减小镜像大小。

## 🌐 群晖 NAS 部署

### 方法一：使用 docker-compose（推荐）

1. **上传文件到群晖**
   ```
   上传 docker-compose.yml 到任意目录（如：/docker/k-life/）
   ```

2. **SSH 登录群晖**
   ```bash
   ssh your-username@your-synology-ip
   ```

3. **进入项目目录**
   ```bash
   cd /path/to/docker-compose.yml
   ```

4. **拉取并启动**
   ```bash
   # 拉取最新镜像
   docker pull qinheqing/k-life:latest

   # 启动服务
   docker-compose up -d

   # 查看日志
   docker-compose logs -f

   # 停止服务
   docker-compose down
   ```

### 方法二：使用群晖 Docker Container Manager（图形界面）

1. **打开 Docker Container Manager**
   - 登录群晖 DSM
   - 打开"套件中心"
   - 搜索并安装"Container Manager"

2. **注册表**
   - 在左侧菜单点击"注册表"
   - 搜索 `qinheqing/k-life`
   - 双击下载 `latest` 标签

3. **创建容器**
   - 点击"容器" → "新建"
   - 图像: `qinheqing/k-life:latest`
   - 容器名称: `k-life`
   - 端口设置:
     - 本地端口: `3003`
     - 容器端口: `80`
   - 环境变量:
     - `TZ=Asia/Shanghai`
   - 重启策略: "除非手动停止"

4. **启动容器**
   - 点击"完成"
   - 容器将自动启动

### 方法三：使用 docker run 命令

```bash
docker run -d \
  --name k-life \
  --restart unless-stopped \
  -p 3003:80 \
  -e TZ=Asia/Shanghai \
  qinheqing/k-life:latest
```

## 🔧 配置说明

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| TZ | Asia/Shanghai | 时区设置 |

### 端口映射

| 容器端口 | 本地端口 | 说明 |
|----------|----------|------|
| 80 | 3003 | Web 服务端口 |

### 访问应用

部署成功后，通过以下地址访问：

```
http://your-synology-ip:3003
```

例如：
```
http://192.168.1.100:3003
```

## 📊 常用管理命令

### 查看容器状态
```bash
docker ps | grep k-life
```

### 查看日志
```bash
docker logs k-life
docker logs -f k-life  # 实时日志
```

### 重启容器
```bash
docker restart k-life
```

### 停止并删除容器
```bash
docker stop k-life
docker rm k-life
```

### 更新到最新版本
```bash
# 1. 停止并删除旧容器
docker stop k-life
docker rm k-life

# 2. 拉取最新镜像
docker pull qinheqing/k-life:latest

# 3. 重新创建容器
docker run -d \
  --name k-life \
  --restart unless-stopped \
  -p 3003:80 \
  -e TZ=Asia/Shanghai \
  qinheqing/k-life:latest
```

## 🔍 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker logs k-life

# 检查容器状态
docker inspect k-life
```

### 端口冲突

如果端口 3003 已被占用，修改端口映射：

```bash
docker run -d \
  --name k-life \
  --restart unless-stopped \
  -p 8080:80 \
  -e TZ=Asia/Shanghai \
  qinheqing/k-life:latest
```

### 无法访问

1. 检查容器是否运行：`docker ps`
2. 检查防火墙设置
3. 确认端口映射正确
4. 查看容器日志：`docker logs k-life`

## 📈 性能优化

### 镜像大小优化

- 使用 Alpine Linux 基础镜像
- 多阶段构建减小最终镜像大小
- 预期镜像大小：~30-50MB

### 资源限制

如果需要限制资源使用：

```yaml
# docker-compose.yml
services:
  k-life:
    image: qinheqing/k-life:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## 🔐 安全建议

1. **定期更新镜像**
   ```bash
   docker pull qinheqing/k-life:latest
   ```

2. **使用特定版本标签**
   ```bash
   docker pull qinheqing/k-life:v1.0.0
   ```

3. **检查镜像漏洞**
   ```bash
   docker scan qinheqing/k-life:latest
   ```

## 📝 技术栈

- **前端框架**: React + TypeScript + Vite
- **Web 服务器**: Nginx (Alpine)
- **构建工具**: Docker multi-stage build
- **容器运行时**: Docker Engine

## 🆘 获取帮助

如有问题，请：

1. 查看项目文档: [CLAUDE.md](CLAUDE.md)
2. 提交 Issue: [GitHub Issues](https://github.com/yourusername/k-life/issues)
3. 联系作者: @heqing (微信)

## 📄 许可证

MIT License
