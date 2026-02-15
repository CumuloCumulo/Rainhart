'use client';

import { useState } from 'react';
import { Sparkles, Download, X } from 'lucide-react';
import LinkInput from '@/components/LinkInput';
import MarkdownPreview from '@/components/MarkdownPreview';
import DownloadButton from '@/components/DownloadButton';
import { sanitizeFilename } from '@/lib/markdown';

type NoteData = {
  title: string;
  desc: string;
  content: string;
  images: string[];
  videoUrl: string | null;
  isVideo: boolean;
  source: string;
  tags: string[];
};

export default function Home() {
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [optimizedMarkdown, setOptimizedMarkdown] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (url: string) => {
    setIsExtracting(true);
    setError(null);
    setNoteData(null);
    setRawMarkdown('');
    setOptimizedMarkdown('');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '提取失败');
      }

      setNoteData(result.data);
      setRawMarkdown(result.data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取失败，请重试');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleOptimize = async () => {
    if (!rawMarkdown) return;

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: rawMarkdown }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'AI 优化失败');
      }

      setOptimizedMarkdown(result.optimizedMarkdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 优化失败，请重试');
    } finally {
      setIsOptimizing(false);
    }
  };

  const currentMarkdown = optimizedMarkdown || rawMarkdown;
  const hasOptimized = !!optimizedMarkdown;

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            小红书内容提取器
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            粘贴小红书链接，一键提取内容并转换为 Markdown 格式
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <LinkInput
            onExtract={handleExtract}
            isLoading={isExtracting}
            disabled={isExtracting || isOptimizing}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Content Section */}
        {currentMarkdown && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {hasOptimized ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    已优化
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    原始内容
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!hasOptimized && rawMarkdown && (
                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-rose-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isOptimizing ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        优化中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        AI 优化
                      </>
                    )}
                  </button>
                )}
                <DownloadButton
                  markdown={currentMarkdown}
                  filename={noteData ? `${sanitizeFilename(noteData.title)}.md` : undefined}
                />
              </div>
            </div>

            {/* Markdown Preview */}
            <MarkdownPreview
              markdown={currentMarkdown}
              showRaw={showRaw}
              onToggleView={() => setShowRaw(!showRaw)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>基于 xiaohongshu-importer 项目开发 · 支持 Kimi AI 优化</p>
        </div>
      </div>
    </main>
  );
}
