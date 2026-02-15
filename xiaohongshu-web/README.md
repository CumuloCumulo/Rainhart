# 小红书内容提取器 - Xiaohongshu Web Extractor

A web application that extracts Xiaohongshu (小红书) content and converts it to Markdown format. Built with Next.js, powered by Puppeteer for web scraping and Kimi AI for content optimization.

## Features

- URL Input: Paste any Xiaohongshu link (supports both mobile and desktop formats)
- Content Extraction: Automatically extract title, content, images, videos, and tags
- Markdown Preview: Real-time rendered Markdown preview with syntax highlighting
- AI Optimization: Use Kimi AI to structure and improve the extracted content
- Download: Export content as Markdown files
- Dark Mode Support: Beautiful dark mode interface

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Markdown**: react-markdown, remark-gfm, rehype-highlight
- **Web Scraping**: Puppeteer with @sparticuz/chromium for Vercel compatibility
- **AI**: OpenAI SDK with Kimi API (Moonshot)
- **Deployment**: Vercel Serverless Functions

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

## Supported URL Formats

- Mobile links: `http://xhslink.com/xxxxx`
- Desktop links: `https://www.xiaohongshu.com/discovery/item/xxxxx`
- Explore links: `https://www.xiaohongshu.com/explore/xxxxx`

## Project Structure

```
xiaohongshu-web/
├── app/
│   ├── page.tsx              # Main page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── extract/
│       │   └── route.ts      # Extraction API endpoint
│       └── optimize/
│           └── route.ts      # AI optimization API endpoint
├── components/
│   ├── LinkInput.tsx         # URL input component
│   ├── MarkdownPreview.tsx    # Markdown preview component
│   └── DownloadButton.tsx    # Download button component
├── lib/
│   ├── xiaohongshu.ts       # Xiaohongshu extraction logic
│   ├── markdown.ts           # Markdown generation
│   ├── puppeteer.ts          # Puppeteer configuration
│   └── ai.ts                # AI integration
├── types/
│   └── index.ts             # TypeScript type definitions
├── vercel.json              # Vercel deployment config
└── .env.example             # Environment variables template
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variable: `MOONSHOT_API_KEY`
5. Deploy

The app will automatically be configured with @sparticuz/chromium for serverless compatibility.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MOONSHOT_API_KEY` | Your Moonshot AI API key | Yes |

## Known Limitations

- Xiaohongshu may update their HTML structure, which could break the scraper
- Large notes may take longer to extract
- Video URLs may expire over time

## License

MIT

## Acknowledgments

- Based on [xiaohongshu-importer](https://github.com/CumuloCumulo/Rainhart) Obsidian plugin
- Powered by [Moonshot AI](https://www.moonshot.cn/)
- Built with [Next.js](https://nextjs.org/)
