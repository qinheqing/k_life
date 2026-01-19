# AI 服务迁移指南

## 从 Gemini 迁移到 DeepSeek/GLM

本项目已将 AI 服务从 Gemini 迁移到支持 DeepSeek 和 GLM 模型。以下是详细说明。

---

## 📋 迁移概述

### 变更内容
- ✅ 移除 Gemini SDK 依赖
- ✅ 使用统一 OpenAI SDK（DeepSeek 和 GLM 都兼容 OpenAI API）
- ✅ 支持多提供商配置（DeepSeek / GLM）
- ✅ 简化配置流程
- ✅ 保持接口不变，业务逻辑无需修改

### 优势
- **成本更低**：DeepSeek 和 GLM 提供更有竞争力的价格
- **响应更快**：国内访问速度更稳定
- **兼容性好**：统一使用 OpenAI API 格式
- **易于切换**：通过环境变量即可切换不同提供商

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 移除旧的 Gemini SDK
npm uninstall @google/generative-ai

# OpenAI SDK 已保留，无需安装
# 如果需要重新安装：
npm install openai@^4.73.0
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# 选择 AI 提供商: deepseek 或 glm
VITE_AI_PROVIDER=deepseek

# API Key（必填）
VITE_AI_API_KEY=your_api_key_here

# API Base URL（可选）
# 留空则使用提供商的默认地址
VITE_AI_BASE_URL=

# 模型名称（可选）
# 留空则使用提供商的默认模型
VITE_AI_MODEL=
```

### 3. 启动项目

```bash
npm run dev
```

---

## 🔧 配置详解

### DeepSeek 配置

#### 获取 API Key
1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key

#### 推荐模型
- `deepseek-chat` - 通用对话模型，速度快
- `deepseek-reasoner` - 深度推理模型，适合复杂分析（推荐）

#### 配置示例
```env
VITE_AI_PROVIDER=deepseek
VITE_AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
VITE_AI_MODEL=deepseek-reasoner
VITE_AI_BASE_URL=https://api.deepseek.com
```

### GLM（智谱AI）配置

#### 获取 API Key
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key

#### 推荐模型
- `glm-4-flash` - 快速响应模型，性价比高
- `glm-4-plus` - 强能力模型，效果更好
- `glm-4-0520` - 稳定版本

#### 配置示例
```env
VITE_AI_PROVIDER=glm
VITE_AI_API_KEY=xxxxxxxxxxxxxxxx.xxxxxxxx
VITE_AI_MODEL=glm-4-plus
VITE_AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
```

---

## 📁 代码变更说明

### 新增文件
- `services/aiService.ts` - 新的 AI 服务模块（替代 `geminiService.ts`）
- `.env.example` - 环境变量配置示例

### 修改文件
- `App.tsx` - 更新导入路径：`geminiService` → `aiService`
- `package.json` - 移除 `@google/generative-ai` 依赖
- `vite.config.ts` - 更新构建配置和环境变量

### 保留文件
- `services/geminiService.ts` - 保留用于参考或回滚（可删除）

---

## 🔍 功能对比

| 功能 | Gemini | DeepSeek/GLM |
|------|--------|-------------|
| 八字计算 | ✅ | ✅ |
| 命运分析 | ✅ | ✅ |
| JSON 结构化输出 | ✅ Schema | ✅ response_format |
| 流式响应 | ✅ | ✅ |
| 错误处理 | ✅ | ✅ |
| 配额检测 | ✅ | ✅ |

---

## 🧪 测试验证

### 测试步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器控制台**
   查看初始化日志：
   ```
   🤖 AI Provider: deepseek
   📡 Base URL: https://api.deepseek.com
   🎯 Model: deepseek-reasoner
   ```

3. **测试八字计算**
   - 输入出生信息
   - 提交表单
   - 检查返回的八字数据是否正确

4. **测试命运分析**
   - 确认八字信息
   - 等待 AI 分析完成
   - 检查 K 线图和六大维度分析

### 常见问题排查

#### 1. API 调用失败
**可能原因**：
- API Key 错误或过期
- 网络连接问题
- API 地址配置错误

**解决方法**：
- 检查 `.env.local` 中的配置
- 查看 API Key 余额
- 使用 curl 测试 API 连接

#### 2. JSON 解析错误
**可能原因**：
- AI 模型返回的不是有效 JSON
- 模型不支持 JSON 模式

**解决方法**：
- 确认使用的是支持的模型列表
- 检查模型是否支持 `response_format: { type: "json_object" }`

#### 3. 配额耗尽
**可能原因**：
- API Key 余额不足
- 超出速率限制

**解决方法**：
- 充值账户余额
- 升级 API 套餐
- 添加重试逻辑

---

## 📊 性能对比

### 响应时间（估算）
- DeepSeek: ~2-5 秒
- GLM-4-Flash: ~1-3 秒
- GLM-4-Plus: ~3-6 秒
- Gemini Flash: ~2-4 秒

### 成本对比（每 1M tokens）
- DeepSeek: ~¥1-2
- GLM-4-Flash: ~¥1
- GLM-4-Plus: ~¥10
- Gemini Flash: ~$0.075

*价格仅供参考，以官方定价为准*

---

## 🔄 回滚方案

如果需要回滚到 Gemini：

1. **恢复依赖**
   ```bash
   npm install @google/generative-ai@^0.24.1
   ```

2. **修改 App.tsx**
   ```typescript
   // 将导入改回
   import { calculateBaZi, generateDestinyAnalysis } from './services/geminiService';
   ```

3. **配置环境变量**
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_MODEL_NAME=gemini-2.0-flash-thinking-exp-01-21
   ```

---

## 🛠️ 高级配置

### 自定义 API 端点
如果有自部署或代理端点：
```env
VITE_AI_BASE_URL=https://your-proxy.com/v1
```

### 使用不同模型
```env
# DeepSeek V3（如果发布）
VITE_AI_MODEL=deepseek-v3

# GLM 其他版本
VITE_AI_MODEL=glm-4-air
```

### 生产环境建议
- 使用环境变量管理工具（如 vault）
- 设置 API 速率限制
- 添加请求重试逻辑
- 监控 API 使用量和成本

---

## 📞 技术支持

### DeepSeek 文档
- 官网: https://www.deepseek.com/
- 开发平台: https://platform.deepseek.com/
- 文档: https://platform.deepseek.com/api-docs/

### GLM 文档
- 官网: https://open.bigmodel.cn/
- 开发平台: https://open.bigmodel.cn/usercenter/apikeys
- 文档: https://open.bigmodel.cn/dev/api

---

## ✅ 迁移检查清单

- [ ] 安装依赖（移除 Gemini SDK）
- [ ] 创建 `.env.local` 配置文件
- [ ] 获取 DeepSeek 或 GLM API Key
- [ ] 更新环境变量配置
- [ ] 启动开发服务器验证
- [ ] 测试八字计算功能
- [ ] 测试命运分析功能
- [ ] 测试 PDF 导出功能
- [ ] 测试中英文切换
- [ ] 检查控制台日志
- [ ] 部署到测试环境
- [ ] 部署到生产环境

---

## 🎉 迁移完成

恭喜！你已经成功将 AI 服务迁移到 DeepSeek/GLM。

享受更快的响应速度和更低的成本吧！
