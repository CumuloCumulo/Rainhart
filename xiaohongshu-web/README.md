# 小红书内容提取器 - Xiaohongshu Web Extractor

A web application that extracts Xiaohongshu (小红书) content and converts it to Markdown format. Built with Next.js, with browser extension integration for reliable extraction and Kimi AI for content optimization.

## Features

- **Browser Extension Integration**: Seamless communication with Chrome/Edge extension for reliable extraction (no anti-bot detection!)
- URL Input: Paste any Xiaohongshu link (supports both mobile and desktop formats)
- Content Extraction: Automatically extract title, content, images, videos, and tags
- Markdown Preview: Real-time rendered Markdown preview with syntax highlighting
- AI Optimization: Use Kimi AI to structure and improve the extracted content
- Download: Export content as Markdown files
- Dark Mode Support: Beautiful dark mode interface

## Tech Stack

- **Frontend**: Next.js 16+ (App Router), React, Tailwind CSS
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **Extension**: Chrome Extension with external messaging API
- **AI**: OpenAI SDK with Kimi API (Moonshot)
- **Deployment**: Any Next.js-compatible platform (Vercel, Render, etc.)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Moonshot API Key (for AI optimization)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CumuloCumulo/Rainhart.git
cd Rainhart/xiaohongshu-web
```
cd xiaohongshu-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Moonshot API key:
```
MOONSHOT_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Paste a Xiaohongshu URL in the input field
2. Click "提取内容" to extract the content
3. View the extracted Markdown in the preview
4. (Optional) Click "AI 优化" to optimize the content with Kimi AI
5. Click "下载 Markdown" to download the file

### Browser Extension (Recommended)

For a better experience with no anti-bot detection, use the browser extension:

1. Build the extension:
```bash
cd extension
npm run build
```

2. Install in Chrome/Edge:
   - Open `chrome://extensions` (or `edge://extensions`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/dist` folder

3. Configure the extension:
   - Click the extension icon and go to "Options"
   - Add your web app URL to allowed domains (e.g., `http://localhost:3000`)

**Extension Advantages:**
- No anti-bot detection (runs in real browser)
- Auto-uses logged-in session
- Faster extraction speed
- No server cost
- Direct web-app integration

Visit `/extension` in the web app for detailed instructions.

**Extension Communication:**
The extension uses `chrome.runtime.onMessageExternal` to communicate with the web app. Make sure your web app domain is configured in the extension's options page.

## Supported URL Formats

- Mobile links: `http://xhslink.com/xxxxx`
- Desktop links: `https://www.xiaohongshu.com/discovery/item/xxxxx`
- Explore links: `https://www.xiaohongshu.com/explore/xxxxx`

## Project Structure

```
xiaohongshu-web/
├── app/
│   ├── page.tsx              # Main page (with extension integration)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── extension/            # Extension info page
│   └── api/
│       ├── optimize/
│       │   └── route.ts      # AI optimization API endpoint
│       └── health/
│           └── route.ts      # Health check endpoint
├── components/
│   ├── LinkInput.tsx         # URL input component
│   ├── MarkdownPreview.tsx    # Markdown preview component
│   └── DownloadButton.tsx    # Download button component
├── lib/
│   ├── extension.ts          # Extension communication library
│   ├── markdown.ts           # Markdown utilities
│   └── ai.ts                # AI integration
├── extension/               # Browser extension
│   ├── manifest.json         # Extension config (with externally_connectable)
│   ├── content/             # Content scripts
│   ├── background/          # Background service worker (with external message handling)
│   ├── popup/               # Popup UI
│   ├── options/             # Options page (domain configuration)
│   └── dist/                # Build output
├── types/
│   └── index.ts             # TypeScript type definitions
├── vercel.json              # Vercel deployment config
└── .env.example             # Environment variables template
```

## Deployment

### Deploy to Vercel (Recommended)

Vercel provides excellent Next.js hosting with zero configuration.

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variable: `MOONSHOT_API_KEY`
5. Deploy

### Deploy to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com)
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Set build and deploy options:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Add environment variable: `MOONSHOT_API_KEY`
7. Click "Deploy Web Service"

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MOONSHOT_API_KEY` | Your Moonshot AI API key | Yes |

## Known Limitations

- Xiaohongshu may update their HTML structure, which could break the extension
- Extension must be installed and configured with the web app domain
- Video URLs may expire over time

## License

MIT

## Acknowledgments

- Based on [xiaohongshu-importer](https://github.com/CumuloCumulo/Rainhart) Obsidian plugin
- Powered by [Moonshot AI](https://www.moonshot.cn/)
- Built with [Next.js](https://nextjs.org/)
