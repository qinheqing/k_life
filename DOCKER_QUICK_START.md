# 🐳 K-Life Docker 快速部署指南

## 📦 已创建的文件

```
k_life/
├── Dockerfile                    # 标准 Dockerfile（多阶段构建）
├── Dockerfile.cn                 # 国内镜像加速版
├── docker-compose.yml            # Docker Compose 配置
├── nginx.conf                    # Nginx 配置
├── .dockerignore                 # Docker 忽略文件
├── .env.docker.example          # Docker 构建配置示例 ⭐ NEW
├── build-and-push.sh            # 构建并推送脚本 ⭐
├── deploy-synology.sh           # 群晖快速部署脚本 ⭐
└── DEPLOYMENT.md                 # 完整部署文档
```

## 🚀 三步完成部署

### 步骤 1️⃣: 构建并推送镜像（在本地开发机器）

#### 方式 A：快速构建（无 API Key - 推荐）

```bash
# 进入项目目录
cd /path/to/k_life

# 执行一键构建推送脚本（不包含 API Key）
./build-and-push.sh
```

#### 方式 B：构建时包含 API Key（可选）

如果要将 API Key 打包到镜像中：

```bash
# 设置环境变量
export GEMINI_API_KEY="your_api_key_here"
export MODEL_NAME="gemini-2.0-flash-thinking-exp-01-21"
export BASE_URL=""

# 执行构建脚本
./build-and-push.sh
```

**或手动执行：**
```bash
# 不包含 API Key 的构建
docker build -t qinheqing/k-life:latest .

# 包含 API Key 的构建
docker build \
  --build-arg GEMINI_API_KEY="your_key" \
  --build-arg MODEL_NAME="gemini-2.0-flash-thinking-exp-01-21" \
  -t qinheqing/k-life:latest .

# 登录 Docker Hub
docker login

# 推送
docker push qinheqing/k-life:latest
```

⚠️ **注意**：如果是前端应用，API Key 会被打包到镜像的 JavaScript 文件中。
如果不打包 API Key，用户需要在前端界面手动输入。

### 步骤 2️⃣: 在群晖上部署

#### 方式 A：使用快速部署脚本（推荐）

```bash
# 1. 上传 deploy-synology.sh 到群晖
# 2. SSH 登录群晖
ssh your-username@your-synology-ip

# 3. 执行脚本
chmod +x deploy-synology.sh
./deploy-synology.sh
```

#### 方式 B：使用 docker-compose

```bash
# 1. 上传 docker-compose.yml 到群晖

# 2. SSH 登录群晖
ssh your-username@your-synology-ip

# 3. 进入目录
cd /path/to/docker-compose.yml

# 4. 启动
docker-compose up -d
```

#### 方式 C：使用群晖 Docker UI

1. 打开 **Container Manager**
2. 在注册表搜索 `qinheqing/k-life`
3. 下载 `latest` 标签
4. 新建容器：
   - 名称: `k-life`
   - 端口: `3003:3003`
   - 环境变量: `TZ=Asia/Shanghai`
   - 重启: 除非手动停止

### 步骤 3️⃣: 访问应用

```
http://your-synology-ip:3003
```

## 🔑 API Key 配置说明

### 方式 1：构建时包含（适合个人使用）

优点：用户无需配置即可使用
缺点：API Key 会打包到镜像中

```bash
# 方式一：使用环境变量
export GEMINI_API_KEY="your_key"
export MODEL_NAME="gemini-2.0-flash-thinking-exp-01-21"
./build-and-push.sh

# 方式二：使用 docker build
docker build \
  --build-arg GEMINI_API_KEY="your_key" \
  --build-arg MODEL_NAME="your_model" \
  -t k-life:custom \
  .

# 方式三：使用 docker-compose
# 编辑 docker-compose.yml，取消注释 build 部分
docker-compose build
docker-compose up -d
```

### 方式 2：运行时配置（适合公共部署）

如果镜像不包含 API Key，用户需要在前端界面手动输入配置。

## 📋 常用命令

```bash
# 查看容器状态
docker ps | grep k-life

# 查看日志
docker logs -f k-life

# 重启容器
docker restart k-life

# 停止容器
docker stop k-life

# 删除容器
docker rm k-life

# 更新到最新版本
docker stop k-life
docker rm k-life
docker pull qinheqing/k-life:latest
./deploy-synology.sh
```

## 🔧 配置说明

### 镜像信息
- **仓库名**: qinheqing/k-life
- **标签**: latest
- **基础镜像**: nginx:alpine
- **镜像大小**: ~30-50MB

### 服务配置
- **端口**: 3003 → 3003
- **时区**: Asia/Shanghai
- **重启策略**: unless-stopped
- **健康检查**: 已启用

### API 配置（可选）
- **GEMINI_API_KEY**: Gemini API 密钥（构建时传入）
- **MODEL_NAME**: 模型名称（默认：gemini-2.0-flash-thinking-exp-01-21）
- **BASE_URL**: API 基础 URL（留空使用原生 Gemini）

### 目录结构
```
/usr/share/nginx/html/
├── index.html
├── assets/
│   ├── index-xxx.css
│   ├── index-xxx.js
│   └── ...
└── doc/
    ├── k线.png
    ├── wechat-qr.png
    └── ...
```

## 🐛 故障排查

### 容器无法启动
```bash
# 查看详细日志
docker logs k-life

# 进入容器检查
docker exec -it k-life sh
ls -la /usr/share/nginx/html
```

### 无法访问应用
1. 检查容器是否运行: `docker ps`
2. 检查端口映射: `docker port k-life`
3. 测试内部访问:
   ```bash
   docker exec k-life wget -O- http://localhost:3003
   ```
4. 检查防火墙设置

### 更新失败
```bash
# 清理旧镜像
docker rmi qinheqing/k-life:latest

# 重新拉取
docker pull qinheqing/k-life:latest
```

## 💡 提示

1. **首次构建** 可能需要 5-10 分钟（取决于网络速度）
2. **国内用户** 建议使用 `Dockerfile.cn`（配置了淘宝镜像源）
3. **生产环境** 建议使用具体版本标签（如 v1.0.0）而非 latest
4. **定期更新** 镜像以获取最新功能和安全补丁
5. **API Key 安全**：
   - 包含 API Key 的镜像不要推送到公共仓库
   - 生产环境考虑使用密钥管理服务
   - 参考 [`.env.docker.example`](.env.docker.example) 了解配置方法

## 📞 获取帮助

- 完整文档: [DEPLOYMENT.md](DEPLOYMENT.md)
- 项目文档: [CLAUDE.md](CLAUDE.md)
- Issue: [GitHub Issues](https://github.com/yourusername/k-life/issues)
- 微信: @heqing

## 🎉 部署成功！

现在你可以通过以下方式访问你的应用：

```
http://your-synology-ip:3003
```

享受你的 K-Life 应用吧！ 🎊
