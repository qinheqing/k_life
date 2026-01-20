# 人生 K 线 | Life K-Line

<div align="center">

[中文](./README.md) | [English](./README_en.md)

---

**洞悉命运起伏，预见人生轨迹**

一个结合传统八字命理与现代金融数据可视化的 AI 命运分析工具

<img src="doc/官网1.png" alt="官网首页" width="100%"/>

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

</div>

## 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [技术架构](#技术架构)
  - [整体架构设计](#整体架构设计)
  - [核心模块详解](#核心模块详解)
  - [技术栈选型](#技术栈选型)
- [开发指南](#开发指南)
- [部署说明](#部署说明)
- [项目结构](#项目结构)

---

## 项目简介

人生 K 线是一个创新的命运分析应用，将传统中国八字命理学与现代金融 K 线图可视化技术相结合。通过 AI 驱动的分析，将您的一生运势转化为直观的股票走势图，帮助您：

- 🎯 发现人生的"牛市"时期
- ⚠️ 规避"熊市"风险
- 🔮 把握关键转折点
- 📊 预见 100 年人生轨迹

本项目采用现代化的前端架构，结合 Gemini AI 的强大推理能力，为用户提供独特的人生视角。

---

## 核心功能

### 1. 智能八字排盘系统
- **真太阳时自动校正**：根据出生地经纬度自动计算真太阳时（考虑时差和经度修正）
- **农历日期转换**：将公历日期精准转换为农历日期（干支纪年）
- **本地四柱计算**：使用 lunar-javascript 库精确计算年、月、日、时四柱，不依赖AI
- **大运起运计算**：计算大运起运岁数、顺逆方向及大运柱列表
- **用户确认机制**：提供二次确认界面，确保命盘准确性

### 2. AI 命运分析引擎
- **100 年运势预测**：基于八字理论生成完整人生周期的运势数据
- **K 线图可视化**：将运势数据转化为金融 K 线图形式
- **多维度评分系统**：对六大维度进行 1-10 分量化评估
- **关键点标记**：自动识别人生巅峰时期

### 3. 六大维度分析
- **币圈交易运势**：加密货币与 Web3 投资运程分析
- **性格分析**：基于五行生克理论解析性格特质
- **事业与行业**：适合发展的行业方向与事业运势
- **风水建议**：居住环境、办公环境的风水布局
- **财富层级**：一生的财富积累能力评估
- **婚姻情感**：感情运程与婚姻匹配分析

### 4. 交互式数据展示
- **动态 K 线图表**：使用 Recharts 绘制的交互式 K 线图
- **年份详细点评**：每一年的运势详细解读
- **波动逻辑分析**：解释运势起伏的命理逻辑
- **响应式设计**：支持桌面端和移动端访问

### 5. 多语言与主题支持
- **中英文双语**：完整的国际化支持
- **亮色/暗色主题**：自动检测系统偏好，支持手动切换
- **本地化存储**：记住用户的语言和主题选择

### 6. PDF 报告导出
- **一键导出**：将完整分析报告保存为 PDF 文件
- **高清截图**：使用 html2canvas 技术保证清晰度
- **多页支持**：自动分页处理长内容

---

## 技术架构

### 整体架构设计

本项目采用**单页应用 (SPA)** 架构，基于 React 18.3 + TypeScript 5.8 开发，使用 Vite 6.2 作为构建工具。整体架构遵循以下设计原则：

1. **组件化设计**：将 UI 拆分为独立的、可复用的组件
2. **状态集中管理**：在根组件 App.tsx 中管理全局状态
3. **服务层分离**：将 AI 交互逻辑封装在独立的服务模块
4. **类型安全**：使用 TypeScript 接口定义所有数据结构
5. **渐进式交互**：采用多步骤向导式用户体验

#### 数据流架构

```
用户输入 → BaZi 计算 → 用户确认 → AI 分析 → 结果展示
   ↓           ↓           ↓          ↓          ↓
 InputForm  geminiService  BaZiConfirmation  AnalysisResult  KLineChart + AnalysisSection
```

### 核心模块详解

#### 1. 应用主控模块 ([App.tsx](App.tsx))

**职责**：应用状态管理中心和路由控制器

**核心状态**：
- `step`: 当前步骤 ('landing' | 'input' | 'confirmation' | 'result')
- `theme`: 主题模式 ('light' | 'dark')
- `lang`: 语言设置 ('zh' | 'en')
- `preliminaryBaZi`: 初步计算的八字结果
- `analysis`: 完整的命运分析结果

**关键逻辑**：
- 两阶段 AI 调用流程（先排盘，后分析）
- 错误处理与配额提示对话框
- 主题切换的 DOM 操作（classList 操作）
- 各步骤间的数据传递

#### 2. 真太阳时计算模块 ([services/solarTime.ts](services/solarTime.ts))

**核心功能**：精确计算真太阳时，修正平太阳时偏差

**计算原理**：
```
真太阳时 = 平太阳时 + 时差 + 经度修正
```

- **时差（Equation of Time）**：地球轨道椭圆导致的太阳位置差异
  - 使用美国海军天文台公式计算
  - 范围：约 -14 分钟到 +16 分钟

- **经度修正**：当地经度与标准经度差异
  - 每度经度对应 4 分钟
  - 标准经度：北京时间 120°E

- **地理编码**：通过出生地名称自动获取经纬度

#### 3. 四柱计算模块 ([services/baziCalculator.ts](services/baziCalculator.ts))

**核心功能**：本地精确计算四柱八字

**技术实现**：
- 使用 `lunar-javascript` 库（v1.7.7）
- 基于 Solar 和 Lunar 类进行计算
- 不依赖 AI，保证准确性

**计算结果**：
```typescript
interface BaZiCalculationResult {
  pillars: {
    year: { gan: string; zhi: string };   // 年干支
    month: { gan: string; zhi: string };  // 月干支
    day: { gan: string; zhi: string };    // 日干支
    hour: { gan: string; zhi: string };   // 时干支
  };
  lunarDate: string;      // 农历日期（如"壬申年腊月初九"）
  solarTime: string;      // 真太阳时
  solarHour: string;      // 时辰名称
  startAge: number;       // 起运岁数
  direction: string;      // 顺行/逆行
  daYun: string[];       // 大运柱列表
}
```

#### 4. AI 服务模块 ([services/aiService.ts](services/aiService.ts))

**架构特点**：支持多 AI 提供商统一架构

- **统一 OpenAI SDK**：使用 `openai` SDK，所有提供商都兼容 OpenAI API 格式
- **支持的提供商**：
  - **DeepSeek**：国产 AI 模型，性价比高，推理能力强
  - **GLM（智谱AI）**：国产大模型，支持多种模型版本
- **灵活切换**：通过环境变量 `VITE_AI_PROVIDER` 选择提供商

**核心函数**：

##### calculateBaZi(input: UserInput): Promise<BaZiResult>
- **功能**：计算八字排盘基础数据
- **实现**：使用本地计算器（baziCalculator），AI 仅负责运势分析
- **输入**：用户的出生信息（姓名、性别、出生日期时间、地点）
- **输出**：
  - 真太阳时 (solarTime)
  - 农历日期 (lunarDate)
  - 四柱八字 (bazi) - 本地精确计算
  - 起运岁数 (startAge)
  - 大运顺逆 (direction)
  - 大运柱列表 (daYun)

##### generateDestinyAnalysis(confirmedBaZi: BaZiResult, lang: Language): Promise<AnalysisResult>
- **功能**：生成完整的命运分析
- **输入**：确认的八字数据 + 语言设置
- **输出**：
  - 六大维度评分分析（cryptoFortune, personality, career, fengShui, wealth, marriage）
  - 100 年运势时间线（timeline）
  - 波动逻辑分析（volatilityAnalysis）
  - 命主属性（mainAttribute）

**数据清洗逻辑**：
```typescript
// 峰值唯一性保证
- 遍历 timeline 找出最高 high 值
- 如有 tie，按 close 值排序
- 再有 tie，按年份早晚排序
- 最终只标记一个 isPeak = true
```

**错误处理**：
- 配额耗尽检测（QUOTA_EXHAUSTED）
- 速率限制识别
- 友好的用户提示

#### 3. 类型定义模块 ([types.ts](types.ts))

**核心类型**：

##### UserInput
用户输入的原始数据结构
```typescript
interface UserInput {
  name: string;           // 姓名（可选）
  gender: Gender;         // 性别枚举
  birthDate: string;      // 公历日期 YYYY-MM-DD
  birthTime: string;      // 出生时间 HH:mm
  birthLocation: string;  // 出生地（用于计算真太阳时）
}
```

##### BaZiChart
八字四柱结构
```typescript
interface BaZiChart {
  year: BaZiPillar;   // 年柱
  month: BaZiPillar;  // 月柱
  day: BaZiPillar;    // 日柱
  hour: BaZiPillar;   // 时柱
}
```

##### AnalysisResult
完整分析结果结构
```typescript
interface AnalysisResult {
  bazi: BaZiChart;              // 确认的八字
  mainAttribute: string;        // 命主属性（如"弱火命"）
  generalComment: string;       // 命运总述
  cryptoFortune: ScoredContent; // 币圈运势（内容+评分）
  personality: ScoredContent;   // 性格分析
  career: ScoredContent;        // 事业发展
  fengShui: ScoredContent;      // 风水建议
  wealth: ScoredContent;        // 财富层级
  marriage: ScoredContent;      // 婚姻情感
  volatilityAnalysis: string;   // 波动逻辑解析
  timeline: YearlyFortune[];    // 100 年运势数据
}
```

##### YearlyFortune
单年运势数据（用于 K 线图）
```typescript
interface YearlyFortune {
  year: number;           // 公历年份
  age: number;            // 虚岁年龄
  open: number;           // 开盘值 (0-100)
  close: number;          // 收盘值 (0-100)
  high: number;           // 最高值 (0-100)
  low: number;            // 最低值 (0-100)
  summary: string;        // 年度总结
  detailedReview: string; // 详细点评
  isPeak?: boolean;       // 是否为人生巅峰
}
```

#### 4. K 线图组件 ([components/KLineChart.tsx](components/KLineChart.tsx))

**技术实现**：
- 基于 Recharts 的 ComposedChart 组件
- 自定义蜡烛图形状（CandleShape）
- 自定义 Tooltip 显示详细信息
- 峰值星星标记（PeakStar）

**核心逻辑**：

##### CandleShape 自定义绘制
```typescript
// 计算蜡烛图各部分位置
const isBull = close >= open;
const color = isBull ? COLOR_BULL : COLOR_BEAR;

// 计算实体和影线坐标
const bodyTopVal = Math.max(open, close);
const bodyBottomVal = Math.min(open, close);
const wickTopY = y - (highDiff * pixelPerUnit);
const wickBottomY = (y + height) + (lowDiff * pixelPerUnit);

// 绘制影线和实体
<line /> {/* 影线 */}
<rect /> {/* 实体 */}
```

##### 主题适配
- 根据 `theme` prop 动态调整颜色
- 网格线、坐标轴、Tooltip 的主题色切换
- 使用 CSS 类和 Tailwind 的 dark: 前缀

#### 5. 分析展示组件 ([components/AnalysisSection.tsx](components/AnalysisSection.tsx))

**UI 结构**：
- 六宫格卡片展示六大维度
- 评分进度条（RatingBar）带渐变色
- 流年详细点评列表（可滚动）
- PDF 导出按钮

**PDF 导出实现**：
```typescript
const handleDownloadPDF = async () => {
  // 1. 强制切换到亮色主题
  htmlElement.classList.remove('dark');
  htmlElement.classList.add('pdf-capture-mode');

  // 2. 展开所有滚动区域
  scrollables.forEach(el => {
    el.style.maxHeight = 'none';
    el.style.overflowY = 'visible';
  });

  // 3. 使用 html2canvas 截图
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    ignoreElements: (el) => /* 忽略不需要的元素 */
  });

  // 4. 生成 PDF
  const pdf = new jsPDF({ orientation: 'portrait', format: 'a4' });
  pdf.addImage(imgData, 'PNG', ...);

  // 5. 恢复原状态
  htmlElement.classList.add('dark'); // 如果原本是暗色
}
```

#### 6. 国际化模块 ([locales.ts](locales.ts))

**结构**：
```typescript
export const translations = {
  en: { /* 英文翻译 */ },
  zh: { /* 中文翻译 */ }
};

export const getTexts = (lang: Language) => translations[lang];
```

**使用方式**：
```typescript
const t = getTexts(lang);
<h1>{t.appTitle}</h1>
```

**特点**：
- 集中式翻译管理
- 覆盖所有 UI 文本
- 支持 AI 提示词的语言切换

#### 7. 其他关键组件

##### LandingPage.tsx
- 官网介绍页面
- 产品特色展示
- "开始使用"按钮

##### InputForm.tsx
- 表单验证
- 日期时间选择
- 地点输入

##### BaZiConfirmation.tsx
- 八字数据展示
- 用户确认/重新输入
- 加载状态管理

##### BaZiDisplay.tsx
- 只读的八字展示（用于结果页）
- 与 Confirmation 页面的展示复用

### 技术栈选型

#### 前端框架与工具
- **React 18.3**：使用 Hooks API，函数式组件
- **TypeScript 5.8**：完整类型安全
- **Vite 6.2**：快速开发服务器和构建工具
- **Tailwind CSS**：实用优先的 CSS 框架（通过 CDN 或 npm）

#### 可视化与 UI
- **Recharts 2.12**：声明式图表库
- **Lucide React 0.344**：现代图标库
- **html2canvas 1.4.1**：DOM 截图
- **jsPDF 2.5.1**：PDF 生成

#### AI 服务
- **openai 4.73.0**：统一 SDK，支持多个兼容 OpenAI API 的提供商
- **DeepSeek**：深度推理模型，适合复杂分析
- **GLM（智谱AI）**：多种模型选择，快速响应
- **多提供商架构**：通过 `VITE_AI_PROVIDER` 环境变量切换（deepseek/glm）

#### 命理计算
- **lunar-javascript 1.7.7**：专业的农历和八字计算库
  - 公历/农历转换
  - 干支纪年计算
  - 四柱八字排盘
  - 大运起运计算

#### 构建配置
```javascript
// vite.config.ts 关键配置
{
  server: { port: 3003, host: '0.0.0.0' },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          ai: ['@google/generative-ai', 'openai'],
          pdf: ['html2canvas', 'jspdf']
        }
      }
    }
  }
}
```

### 关键技术实现

#### 1. 双 AI 提供商适配

**问题**：需要同时支持原生 Gemini API 和第三方转发平台

**解决方案**：
```typescript
const useNativeGemini = !baseURL;

if (useNativeGemini) {
  genAI = new GoogleGenerativeAI(apiKey);
  // 使用 responseSchema 进行结构化输出
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: baziCalculationSchema
  }
} else {
  openai = new OpenAI({ baseURL, apiKey });
  // 使用 response_format: { type: "json_object" }
}
```

#### 2. 100 年时间线生成

**挑战**：确保 AI 生成恰好 100 年数据，从出生年开始

**解决方案**：
- Prompt 中明确要求：`EXACTLY 100 entries starting from Birth Year`
- 数据清洗阶段验证数组长度
- 重新排序确保年份连续性

#### 3. 峰值唯一性保证

**问题**：AI 可能生成多个 `isPeak: true` 的年份

**解决方案**：
```typescript
let maxHigh = -Infinity;
let maxClose = -Infinity;
let peakIdx = -1;

result.timeline.forEach((item, idx) => {
  item.isPeak = false; // 重置
  if (item.high > maxHigh) {
    maxHigh = item.high;
    maxClose = item.close;
    peakIdx = idx;
  } else if (item.high === maxHigh && item.close > maxClose) {
    peakIdx = idx;
  }
});

result.timeline[peakIdx].isPeak = true;
```

#### 4. PDF 导出暗色模式处理

**问题**：暗色主题下导出的 PDF 有黑色遮罩

**解决方案**：
- 临时移除 `dark` class
- 强制设置 `backgroundColor: '#ffffff'`
- 禁用 CSS transitions（避免部分渲染）
- 恢复时根据原状态判断是否加回 `dark` class

#### 5. 性能优化

**策略**：
- **代码分割**：vendor、charts、icons、ai、pdf 分块
- **懒加载**：组件按需加载
- **动画优化**：`isAnimationActive={false}` 减少重绘
- **虚拟化考虑**：100 年数据使用 Recharts 内置优化

---

## 开发指南

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/XIAOEEN/lifeline-k-.git
cd k_life
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

在项目根目录创建 `.env.local` 文件：

```env
# 选择 AI 提供商: deepseek 或 glm
VITE_AI_PROVIDER=deepseek

# API Key (必填)
# DeepSeek: https://platform.deepseek.com/api_keys
# GLM (智谱AI): https://open.bigmodel.cn/usercenter/apikeys
VITE_AI_API_KEY=your_api_key_here

# API Base URL (可选，留空使用默认值)
# DeepSeek 默认: https://api.deepseek.com
# GLM 默认: https://open.bigmodel.cn/api/paas/v4/
VITE_AI_BASE_URL=

# 模型名称 (可选，留空使用默认模型)
# DeepSeek 推荐模型: deepseek-chat, deepseek-reasoner
# GLM 推荐模型: glm-4-flash, glm-4-plus
VITE_AI_MODEL=
```

详细配置说明请参考 [AI_MIGRATION_GUIDE.md](AI_MIGRATION_GUIDE.md)

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3003

### 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# PM2 管理命令
npm run pm2:dev      # 启动开发环境
npm run pm2:prod     # 启动生产环境
npm run pm2:stop     # 停止服务
npm run pm2:restart  # 重启服务
npm run pm2:logs     # 查看日志
npm run pm2:status   # 查看状态
```

### 开发注意事项

1. **类型安全**：所有组件和函数必须使用 TypeScript 类型
2. **Props 传递**：`lang` prop 必须传递到所有需要国际化的组件
3. **主题适配**：所有颜色使用 Tailwind 的 `dark:` 前缀或条件类名
4. **AI 调用**：注意 API 配额，开发时考虑使用 mock 数据
5. **PDF 导出**：测试时注意检查暗色模式下的导出效果

### 代码规范

- 使用函数式组件和 Hooks
- 组件文件使用 PascalCase 命名
- 工具函数文件使用 camelCase 命名
- 导出优先使用命名导出，组件使用默认导出

---

## 部署说明

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 部署到静态服务器

**Vercel / Netlify / GitHub Pages**：
1. 连接仓库
2. 设置构建命令：`npm run build`
3. 设置发布目录：`dist/`
4. 配置环境变量

**传统服务器**：
```bash
# 构建
npm run build

# 使用 PM2 部署
npm run pm2:prod
```

### PM2 配置

项目包含 `ecosystem.config.cjs` 文件，配置了开发和生产环境。

### 环境变量配置

生产环境需要配置以下环境变量：
- `VITE_AI_PROVIDER`：必填，AI 提供商（deepseek 或 glm）
- `VITE_AI_API_KEY`：必填，AI 服务密钥
- `VITE_AI_BASE_URL`：可选，自定义 API 端点
- `VITE_AI_MODEL`：可选，指定使用的模型

---

## 项目结构

```
k_life/
 ├── components/              # UI 组件目录
 │   ├── AnalysisSection.tsx  # 分析结果展示（六宫格 + PDF 导出）
 │   ├── ApiQuotaDialog.tsx   # API 配额提示对话框
 │   ├── BaZiConfirmation.tsx # 八字确认页面
 │   ├── BaZiDisplay.tsx      # 八字只读展示
 │   ├── InputForm.tsx        # 输入表单
 │   ├── KLineChart.tsx       # K 线图组件
 │   └── LandingPage.tsx      # 官网落地页
 ├── services/                # 服务层
 │   ├── aiService.ts         # AI 交互服务（DeepSeek/GLM 统一架构）
 │   ├── baziCalculator.ts    # 本地四柱计算器（lunar-javascript）
 │   ├── solarTime.ts         # 真太阳时计算服务
 │   ├── geoLocation.ts       # 地理位置编码服务
 │   └── geminiService.ts     # 旧版 Gemini 服务（已弃用，可删除）
 ├── doc/                     # 文档和图片资源（会被复制到 dist）
 ├── server/                  # 后端服务
 │   ├── routes/             # API 路由
 │   ├── data/                # 数据库文件
 │   └── scripts/            # 工具脚本
 ├── App.tsx                  # 应用主组件
 ├── constants.ts             # 常量定义（颜色、应用名称）
 ├── locales.ts               # 国际化翻译
 ├── types.ts                 # TypeScript 类型定义
 ├── index.tsx                # 应用入口
 ├── vite.config.ts           # Vite 配置
 ├── package.json             # 项目依赖
 ├── tsconfig.json            # TypeScript 配置
 ├── ecosystem.config.cjs     # PM2 配置
 ├── .env.example             # 环境变量配置示例
 ├── README.md                # 中文说明文档
 ├── README_en.md             # 英文说明文档
 ├── AI_MIGRATION_GUIDE.md    # AI 服务迁移指南
 ├── SOLAR_TIME_IMPROVEMENT.md # 真太阳时优化文档
 ├── AGENTS.md                # AI Agent 工作指南
 └── CLAUDE.md                # Claude Code 工作指南
```

---

## 常见问题

### 1. API 调用失败
- 检查 `VITE_AI_API_KEY` 是否正确
- 确认 API Key 有足够配额
- 检查 `VITE_AI_PROVIDER` 配置（deepseek 或 glm）
- 查看 AI 提供商的服务状态页面

### 2. PDF 导出有遮罩
- 这是暗色主题的已知问题，已通过强制亮色主题解决
- 如果仍有问题，检查浏览器控制台错误

### 3. K 线图显示异常
- 检查 `timeline` 数据是否完整（100 年）
- 验证每个数据点的 open, close, high, low 值合法

### 4. 八字计算不准确
- 确认输入的出生地点正确（影响真太阳时）
- 如有疑问，使用"重新输入"功能

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具更新

---

## 许可证

[MIT License](LICENSE)

---

## 致谢

- [Gemini AI](https://ai.google.dev/) - 强大的 AI 推理能力
- [Recharts](https://recharts.org/) - 优雅的图表库
- [Vite](https://vitejs.dev/) - 快速的构建工具

---

## 联系方式

- GitHub: [@XIAOEEN](https://github.com/XIAOEEN)
- 项目链接: [https://github.com/XIAOEEN/lifeline-k-](https://github.com/XIAOEEN/lifeline-k-)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by @xiaoeen

</div>
