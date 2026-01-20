# 使用码功能部署指南

## 一、项目结构

```
k_life/
├── server/                      # 后端服务器
│   ├── server.js               # Express 服务器主文件
│   ├── database.js             # SQLite 数据库连接
│   ├── adminAuth.js            # 认证中间件
│   ├── config.js               # 配置文件管理
│   ├── config.json             # 管理员密码等配置
│   ├── package.json            # 后端依赖
│   ├── routes/
│   │   ├── accessCode.js       # 使用码验证路由（前端用）
│   │   └── admin.js            # 后台管理路由
│   ├── public/                 # 后台管理页面静态文件
│   │   ├── login.html
│   │   ├── index.html
│   │   ├── css/admin.css
│   │   └── js/login.js, admin.js
│   ├── scripts/
│   │   └── generateCodes.js    # 使用码生成脚本
│   └── data/
│       └── access_codes.db    # SQLite 数据库（自动生成）
├── components/
│   └── AccessCodeForm.tsx     # 使用码输入表单
├── services/
│   └── accessCodeService.ts    # API 服务
├── App.tsx                     # 主应用（已更新）
├── vite-env.d.ts               # TypeScript 类型定义（已添加）
├── ecosystem.config.cjs         # PM2 配置（已更新）
├── vite.config.ts              # Vite 配置（已更新）
└── .env.local                  # 环境变量（已更新）
```

## 二、部署步骤

### 1. 安装后端依赖

```bash
cd server
npm install
```

### 2. 修改管理员密码

编辑 `server/config.json`，修改默认密码：

```json
{
  "admin": {
    "password": "your_secure_password_here",  // 修改为您的密码
    "sessionTimeout": 7200
  },
  "accessCode": {
    "defaultLength": 12,
    "defaultBatchSize": 10
  }
}
```

### 3. 启动后端服务器

**方式一：使用 PM2（推荐生产环境）**

```bash
pm2 start ecosystem.config.cjs --only life-destiny-backend
```

**方式二：直接启动（开发环境）**

```bash
cd server
node server.js
```

后端默认运行在端口 `3004`

### 4. 启动前端应用

**方式一：使用 PM2（推荐生产环境）**

```bash
pm2 start ecosystem.config.cjs --only life-destiny-k-line-prod
```

**方式二：开发模式**

```bash
npm run dev
```

前端默认运行在端口 `3003`

## 三、访问后台管理界面

1. 打开浏览器访问：`http://localhost:3004/admin`
2. 在登录页面输入您在 `config.json` 中设置的密码
3. 登录成功后进入管理面板

## 四、使用码管理

### 生成使用码

1. 点击"Generate Codes"按钮
2. 输入生成数量（1-1000）
3. 输入码长度（6-32）
4. 点击"Generate"生成

生成的使用码会显示在列表中，格式如：`ZJE9CS3VPIY4`

### 导出使用码

1. 点击"Export CSV"按钮
2. CSV 文件会自动下载，包含所有使用码及其状态

### 重置使用码

对于已使用过的码，点击"Reset"按钮可将其重置为未使用状态。

### 删除使用码

点击"Delete"按钮删除不需要的使用码。

### 搜索和筛选

- **搜索**：在搜索框中输入码的一部分即可实时过滤
- **筛选**：使用下拉框选择显示全部/仅未用/仅已用的码

### 查看统计

顶部显示统计卡片：
- Total Codes: 总数
- Used: 已使用
- Unused: 未使用
- Usage Rate: 使用率

### 查看日志

页面底部显示最近的操作日志，包括：
- 登录记录
- 生成使用码
- 重置/删除操作

## 五、用户使用流程

1. **输入使用码**
   - 用户在首页点击"开始分析"
   - 进入使用码输入页面
   - 输入从管理员处获得的使用码
   - 点击"验证使用码"

2. **验证失败处理**
   - 如果使用码无效或已使用，会显示错误提示
   - 提供"联系管理员获取使用码"按钮
   - 点击后会打开微信联系弹窗（WeChatModal）

3. **验证成功**
   - 验证通过后进入个人信息输入页面
   - 填写信息并提交
   - 系统自动将使用码标记为已使用

4. **再次使用**
   - 使用码验证通过后，后续提交时系统会自动标记为已使用
   - 已使用的码不能再次使用

## 六、API 接口文档

### 前端接口

#### 验证使用码
```
POST /api/verify-code
Content-Type: application/json

Request:
{
  "code": "ZJE9CS3VPIY4"
}

Response:
{
  "valid": true,
  "used": false,
  "message": "Code is valid"
}
```

#### 标记使用码为已使用
```
POST /api/use-code
Content-Type: application/json

Request:
{
  "code": "ZJE9CS3VPIY4",
  "userName": "张三",
  "userIp": "127.0.0.1"
}

Response:
{
  "success": true,
  "message": "Code used successfully"
}
```

### 后台管理接口

#### 管理员登录
```
POST /api/admin/login
Content-Type: application/json

Request:
{
  "password": "your_password"
}

Response:
{
  "success": true,
  "token": "jwt_token_here"
}
```

#### 获取统计信息
```
GET /api/admin/stats
Authorization: Bearer {token}

Response:
{
  "total": 100,
  "used": 45,
  "unused": 55,
  "usageRate": "45.00"
}
```

#### 获取使用码列表
```
GET /api/admin/codes?page=1&limit=20&status=all&search=
Authorization: Bearer {token}

Response:
{
  "codes": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

#### 生成使用码
```
POST /api/admin/codes/generate
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "count": 10,
  "length": 12
}

Response:
{
  "success": true,
  "count": 10,
  "codes": ["ZJE9CS3VPIY4", ...]
}
```

#### 重置使用码
```
PUT /api/admin/codes/{id}/reset
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Code reset successfully"
}
```

#### 删除使用码
```
DELETE /api/admin/codes/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Code deleted successfully"
}
```

## 七、PM2 管理命令

### 启动所有服务
```bash
pm2 start ecosystem.config.cjs
```

### 启动特定服务
```bash
pm2 start ecosystem.config.cjs --only life-destiny-backend
pm2 start ecosystem.config.cjs --only life-destiny-k-line-prod
```

### 停止所有服务
```bash
pm2 stop ecosystem.config.cjs
```

### 重启所有服务
```bash
pm2 restart ecosystem.config.cjs
```

### 查看日志
```bash
pm2 logs life-destiny-backend
pm2 logs life-destiny-k-line
```

### 查看状态
```bash
pm2 status
```

## 八、配置说明

### 环境变量（.env.local）

```bash
# AI 服务配置（已有）
VITE_AI_PROVIDER=deepseek
VITE_AI_API_KEY=your_api_key_here
VITE_AI_MODEL=deepseek-reasoner

# 后端服务 URL（新增）
VITE_BACKEND_URL=http://localhost:3004
```

### 后端配置（server/config.json）

```json
{
  "admin": {
    "password": "admin123",           // 管理员密码
    "sessionTimeout": 7200            // Session 超时时间（秒）
  },
  "accessCode": {
    "defaultLength": 12,              // 默认码长度
    "defaultBatchSize": 10            // 默认批量生成数量
  }
}
```

### Vite 代理配置（vite.config.ts）

```javascript
server: {
  proxy: {
    '/api': {
      target: env.VITE_BACKEND_URL || 'http://localhost:3004',
      changeOrigin: true,
    },
  },
}
```

## 九、常见问题

### 1. 数据库文件无法创建

**问题**：`Error: SQLITE_CANTOPEN: unable to open database file`

**解决方案**：
```bash
# 确保数据目录存在
mkdir -p server/data

# 设置正确的权限
chmod 755 server/data

# 如果仍有问题，创建空文件
touch server/data/access_codes.db
```

### 2. 后端服务器无法启动

**问题**：端口已被占用

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3004

# 杀死进程
kill -9 <PID>

# 或者修改 ecosystem.config.cjs 中的 PORT
```

### 3. 生成使用码超时

**问题**：生成大量使用码时超时

**解决方案**：
- 减少单次生成的数量
- 增加服务器超时时间
- 使用脚本直接生成：`cd server && npm run generate-codes -- --count=100 --length=12`

### 4. 前端无法连接后端

**问题**：CORS 错误或连接失败

**解决方案**：
- 检查 `.env.local` 中的 `VITE_BACKEND_URL` 是否正确
- 确保后端服务器正在运行
- 检查防火墙设置
- 在生产环境中配置正确的 CORS 规则

## 十、安全建议

1. **修改默认密码**
   - 首次部署时务必修改 `config.json` 中的管理员密码

2. **使用强密码**
   - 密码长度至少 12 位
   - 包含大小写字母、数字和特殊字符

3. **限制后台访问**
   - 在生产环境中，使用反向代理（如 Nginx）限制后台 IP 访问
   - 或使用 VPN 等方式保护后台页面

4. **定期备份**
   - 定期备份 `server/data/access_codes.db` 数据库文件

5. **监控日志**
   - 定期查看操作日志，发现异常活动

6. **HTTPS**
   - 生产环境务必使用 HTTPS
   - 配置 SSL 证书

## 十一、维护命令

### 备份数据库
```bash
cp server/data/access_codes.db server/data/access_codes.db.backup.$(date +%Y%m%d)
```

### 查看数据库内容
```bash
sqlite3 server/data/access_codes.db "SELECT * FROM access_codes;"
```

### 重置所有使用码为未使用（谨慎操作）
```bash
sqlite3 server/data/access_codes.db "UPDATE access_codes SET is_used = 0, used_at = NULL, user_name = NULL, user_ip = NULL;"
```

### 清空日志
```bash
sqlite3 server/data/access_codes.db "DELETE FROM admin_logs;"
```

## 十二、联系方式

如有问题，请联系开发人员或查看项目文档。
