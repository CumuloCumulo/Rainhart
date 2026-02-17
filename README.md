# Reinhart - 小红书内容提取器

[English](#english) | [中文](#中文)

---

## 中文

一个将小红书内容提取并转换为 Markdown 格式的 Web 应用。集成浏览器扩展进行可靠的内容提取，支持 Kimi AI 优化排版。

### 功能

- **浏览器扩展提取** - 通过 Chrome/Edge 扩展直接提取，绕过反爬虫检测
- **智能 URL 解析** - 自动从分享文本中识别小红书链接
- **Markdown 转换** - 自动提取标题、正文、图片、视频、标签
- **AI 优化** - 使用 Kimi AI 优化 Markdown 结构和排版
- **一键下载** - 导出为 `.md` 文件

### 支持的链接格式

- 手机分享链接：`http://xhslink.com/xxxxx`
- 桌面链接：`https://www.xiaohongshu.com/discovery/item/xxxxx`
- 探索链接：`https://www.xiaohongshu.com/explore/xxxxx`

### 快速开始

#### 1. 安装

```bash
git clone https://github.com/CumuloCumulo/Rainhart.git
cd Rainhart
npm install
```

#### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：
```
MOONSHOT_API_KEY=your_api_key_here
```

> API Key 从 [Moonshot 平台](https://platform.moonshot.cn/) 获取（AI 优化功能需要）

#### 3. 启动

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 浏览器扩展

扩展是内容提取的核心组件，在真实浏览器环境中运行，无反爬检测。

#### 安装扩展

**方式一：从 Web 应用下载**

访问 `/extension` 页面，下载 zip 并解压。

**方式二：本地构建**

```bash
cd extension
node build.js
```

#### 加载到浏览器

1. 打开 `chrome://extensions`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `extension/dist` 文件夹

#### 连接 Web 应用

1. 在 Web 应用首页点击"输入扩展 ID"
2. 在扩展选项页面复制扩展 ID
3. 粘贴到输入框并点击"连接"

### 使用方法

1. 粘贴小红书链接（支持直接粘贴分享文本）
2. 点击"提取内容"
3. 查看 Markdown 预览
4. （可选）点击"AI 优化"改善排版
5. 点击"下载 Markdown"导出文件

### 部署

#### Render

```yaml
# render.yaml 已配置好
Build Command: docker build
```

在 Render Dashboard 中添加环境变量 `MOONSHOT_API_KEY`。

#### Vercel

1. 导入 GitHub 仓库
2. 添加环境变量 `MOONSHOT_API_KEY`
3. 部署

### 项目结构

```
Reinhart/
├── app/
│   ├── page.tsx                # 主页面
│   ├── extension/page.tsx      # 扩展下载页
│   └── api/
│       ├── optimize/route.ts   # AI 优化 API
│       └── health/route.ts     # 健康检查
├── components/
│   ├── LinkInput.tsx           # URL 输入组件
│   ├── MarkdownPreview.tsx     # Markdown 预览
│   └── DownloadButton.tsx      # 下载按钮
├── lib/
│   ├── extension.ts            # 扩展通信库
│   ├── markdown.ts             # Markdown 工具
│   └── ai.ts                   # Kimi AI 集成
├── extension/                  # 浏览器扩展
│   ├── manifest.json
│   ├── background/             # Service Worker
│   ├── content/                # Content Script
│   ├── popup/                  # 弹出窗口
│   ├── options/                # 设置页面
│   └── dist/                   # 构建输出
├── types/index.ts
├── Dockerfile
├── render.yaml
└── .env.example
```

### 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `MOONSHOT_API_KEY` | Moonshot AI API Key | AI 优化功能需要 |

---

## English

A web application that extracts Xiaohongshu (Little Red Book) content and converts it to Markdown format. Features browser extension integration for reliable extraction and Kimi AI for content optimization.

### Features

- **Browser Extension Extraction** - Extract via Chrome/Edge extension, bypasses anti-bot detection
- **Smart URL Parsing** - Auto-detects Xiaohongshu URLs from share text
- **Markdown Conversion** - Extracts title, content, images, videos, and tags
- **AI Optimization** - Uses Kimi AI to improve Markdown structure and formatting
- **One-click Download** - Export as `.md` files

### Supported URL Formats

- Mobile share links: `http://xhslink.com/xxxxx`
- Desktop links: `https://www.xiaohongshu.com/discovery/item/xxxxx`
- Explore links: `https://www.xiaohongshu.com/explore/xxxxx`

### Quick Start

#### 1. Install

```bash
git clone https://github.com/CumuloCumulo/Rainhart.git
cd Reinhart
npm install
```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
MOONSHOT_API_KEY=your_api_key_here
```

> Get your API key from [Moonshot Platform](https://platform.moonshot.cn/) (required for AI optimization)

#### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Browser Extension

The extension is the core extraction component. It runs in a real browser environment with no anti-bot detection.

#### Install Extension

**Option 1: Download from Web App**

Visit the `/extension` page to download the zip file.

**Option 2: Build Locally**

```bash
cd extension
node build.js
```

#### Load into Browser

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/dist` folder

#### Connect to Web App

1. Click "Enter Extension ID" on the web app homepage
2. Copy the extension ID from the extension options page
3. Paste it and click "Connect"

### Usage

1. Paste a Xiaohongshu link (supports pasting share text directly)
2. Click "Extract Content"
3. View the Markdown preview
4. (Optional) Click "AI Optimize" to improve formatting
5. Click "Download Markdown" to export

### Deployment

#### Render

```yaml
# render.yaml is pre-configured
Build Command: docker build
```

Add `MOONSHOT_API_KEY` environment variable in Render Dashboard.

#### Vercel

1. Import GitHub repository
2. Add `MOONSHOT_API_KEY` environment variable
3. Deploy

### Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **Extension**: Chrome Extension Manifest V3
- **AI**: OpenAI SDK with Kimi API (Moonshot)
- **Deployment**: Docker / Vercel / Render

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MOONSHOT_API_KEY` | Moonshot AI API key | Required for AI optimization |

---

## License

MIT

## Acknowledgments

- Powered by [Moonshot AI (Kimi)](https://www.moonshot.cn/)
- Built with [Next.js](https://nextjs.org/)
