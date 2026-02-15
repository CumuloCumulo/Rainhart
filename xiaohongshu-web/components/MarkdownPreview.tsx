"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import { FileText, Sparkles, Eye, Code } from "lucide-react";

export interface MarkdownPreviewProps {
  markdown: string;
  showRaw?: boolean;
  onToggleView?: () => void;
}

export default function MarkdownPreview({
  markdown,
  showRaw = false,
  onToggleView,
}: MarkdownPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {markdown.startsWith("---") ? (
            <FileText className="h-5 w-5 text-rose-500" />
          ) : (
            <Sparkles className="h-5 w-5 text-emerald-500" />
          )}
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {markdown.startsWith("---")
              ? "原始 Markdown"
              : "AI 优化后的 Markdown"}
          </h3>
        </div>
        {onToggleView && (
          <button
            onClick={onToggleView}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300"
          >
            {showRaw ? (
              <>
                <Eye className="h-4 w-4" />
                预览
              </>
            ) : (
              <>
                <Code className="h-4 w-4" />
                源码
              </>
            )}
          </button>
        )}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        {showRaw ? (
          <pre className="overflow-x-auto text-sm text-zinc-700 dark:text-zinc-300">
            <code>{markdown}</code>
          </pre>
        ) : (
          <article className="prose prose-zinc max-w-none dark:prose-invert prose-img:rounded-lg prose-video:w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
