# Runtime Configuration Guide / 运行时配置指南

## Overview / 概述

K-Life Docker 容器支持通过挂载配置文件在运行时提供 AI API 配置，无需重新构建镜像。

## Configuration File Format / 配置文件格式

创建一个 JSON 配置文件（例如 `runtime-config.json`）：

```json
{
  "provider": "deepseek",
  "apiKey": "your_api_key_here",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat"
}
```

## Configuration Options / 配置选项

### Provider / 提供商

支持的 AI 提供商：

- **deepseek** - DeepSeek AI (默认)
  - `baseURL`: `https://api.deepseek.com`
  - `model`: `deepseek-chat`

- **glm** - 智谱清言 (GLM)
  - `baseURL`: `https://open.bigmodel.cn/api/paas/v4/`
  - `model`: `glm-4-flash`

### Fields / 字段说明

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | No | AI provider: 'deepseek' or 'glm' (default: 'deepseek') |
| `apiKey` | string | Yes | Your API key for the selected provider |
| `baseURL` | string | No | Custom API endpoint (uses provider default if empty) |
| `model` | string | No | Model name (uses provider default if empty) |

## Usage / 使用方法

### Option 1: Using docker-compose (推荐 / Recommended)

1. Create config file / 创建配置文件：
```bash
cp runtime-config.example.json my-config.json
# Edit my-config.json with your API keys
```

2. Modify docker-compose.yml / 修改 docker-compose.yml：
```yaml
services:
  k-life:
    image: qinheqing/k-life:v1.0
    ports:
      - "3003:3003"
    volumes:
      - ./my-config.json:/config/runtime-config.json:ro
    restart: unless-stopped
```

3. Start container / 启动容器：
```bash
docker-compose up -d
```

### Option 2: Using docker run

```bash
docker run -d \
  --name k-life \
  -p 3003:3003 \
  -v $(pwd)/my-config.json:/config/runtime-config.json:ro \
  qinheqing/k-life:v1.0
```

### Option 3: Synology NAS

1. Create config file on your Synology / 在群晖上创建配置文件：
```bash
# SSH into Synology
ssh your-username@your-synology-ip

# Create directory
mkdir -p /volume1/docker/k-life
cd /volume1/docker/k-life

# Create config file
cat > runtime-config.json << 'EOF'
{
  "provider": "deepseek",
  "apiKey": "your_api_key_here",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat"
}
EOF
```

2. Run container / 运行容器：
```bash
docker run -d \
  --name k-life \
  --restart unless-stopped \
  -p 3003:3003 \
  -v /volume1/docker/k-life/runtime-config.json:/config/runtime-config.json:ro \
  qinheqing/k-life:v1.0
```

## Configuration Examples / 配置示例

### DeepSeek (Default / 默认)

```json
{
  "provider": "deepseek",
  "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-chat"
}
```

### GLM (智谱清言)

```json
{
  "provider": "glm",
  "apiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxx",
  "baseURL": "https://open.bigmodel.cn/api/paas/v4/",
  "model": "glm-4-flash"
}
```

### Minimal Configuration (最小配置)

Only `apiKey` is required. Provider defaults will be used if omitted:
只需要 `apiKey`，其他字段会使用默认值：

```json
{
  "apiKey": "your_api_key_here"
}
```

## How It Works / 工作原理

1. Container startup script checks for `/config/runtime-config.json`
   容器启动脚本检查 `/config/runtime-config.json`

2. If found, generates `config.js` with the configuration
   如果找到，生成包含配置的 `config.js`

3. Frontend application loads `config.js` on startup
   前端应用在启动时加载 `config.js`

4. AI service uses runtime configuration if available, falls back to build-time config
   AI 服务优先使用运行时配置，如果没有则回退到构建时配置

## Security Notes / 安全提示

1. **File Permissions**: Ensure your config file has restricted permissions (600 or 400)
   **文件权限**：确保配置文件有受限权限（600 或 400）

```bash
chmod 600 runtime-config.json
```

2. **Volume Mount**: Use `:ro` (read-only) flag when mounting
   **卷挂载**：挂载时使用 `:ro`（只读）标志

3. **Don't Commit Config**: Never commit config files with real API keys to version control
   **不要提交配置**：永远不要将包含真实 API Key 的配置文件提交到版本控制

4. **Use .env for development**: Use `.env.local` for local development
   **开发环境使用 .env**：本地开发使用 `.env.local`

## Troubleshooting / 故障排查

### Config not loading

Check container logs:
检查容器日志：

```bash
docker logs k-life
```

Look for messages like:
查找类似消息：

```
✅ Found runtime config file: /config/runtime-config.json
📝 Generating config.js from runtime config...
```

### Config file not found

If you see:
如果看到：

```
⚠️  No runtime config file found at: /config/runtime-config.json
```

Check:
检查：

1. Volume mount path is correct (卷挂载路径是否正确)
2. File exists on host (主机上文件是否存在)
3. File permissions allow reading (文件权限是否允许读取)

### Invalid JSON format

If your config has invalid JSON, the script will fail to parse it.
如果配置包含无效的 JSON，脚本将无法解析。

Validate your JSON:
验证 JSON：

```bash
# Python
python3 -m json.tool runtime-config.json

# jq (if installed)
jq . runtime-config.json
```

## Switching Providers / 切换提供商

To switch from DeepSeek to GLM:
从 DeepSeek 切换到 GLM：

1. Update your config file (更新配置文件)：
```json
{
  "provider": "glm",
  "apiKey": "your_glm_api_key",
  "baseURL": "https://open.bigmodel.cn/api/paas/v4/",
  "model": "glm-4-flash"
}
```

2. Restart container (重启容器)：
```bash
docker restart k-life
```

No need to rebuild the image!
无需重新构建镜像！
