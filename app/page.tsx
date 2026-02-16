"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  X,
  ExternalLink,
  Puzzle,
  CheckCircle2,
} from "lucide-react";
import LinkInput from "@/components/LinkInput";
import MarkdownPreview from "@/components/MarkdownPreview";
import DownloadButton from "@/components/DownloadButton";
import { sanitizeFilename } from "@/lib/markdown";
import { getExtensionCommunicator } from "@/lib/extension";

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
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [optimizedMarkdown, setOptimizedMarkdown] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);
  const [showExtensionBanner, setShowExtensionBanner] = useState(true);
  const extensionCommunicator = getExtensionCommunicator();

  const handleExtract = async (url: string) => {
    setIsExtracting(true);
    setError(null);
    setNoteData(null);
    setRawMarkdown("");
    setOptimizedMarkdown("");

    try {
      // 使用插件提取
      console.log("[Web App] 使用插件提取:", url);
      const data = await extensionCommunicator.extractByUrl(url);
      setNoteData(data);
      setRawMarkdown(data.markdown || data.content);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "提取失败，请重试";
      setError(errorMessage);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleOptimize = async () => {
    if (!rawMarkdown) return;

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: rawMarkdown }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "AI 优化失败");
      }

      setOptimizedMarkdown(result.optimizedMarkdown || "");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "AI 优化失败，请重试";
      setError(errorMessage);
    } finally {
      setIsOptimizing(false);
    }
  };

  const currentMarkdown = optimizedMarkdown || rawMarkdown;
  const hasOptimized = !!optimizedMarkdown;

  // 检测插件是否安装
  useEffect(() => {
    const checkExtension = async () => {
      try {
        const installed = await extensionCommunicator.isInstalled();
        setHasExtension(installed);
        if (installed) {
          console.log("[Web App] 插件已检测到");
        }
      } catch (e) {
        console.log("[Web App] 插件检测失败", e);
      }
    };

    checkExtension();

    // 监听来自插件的消息
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "XHS_NOTE_EXTRACTED") return;

      const { data } = event.data;
      console.log("[Web App] 收到插件消息:", data);

      // 设置提取的数据
      setNoteData({
        title: data.title,
        desc: data.desc,
        content: data.markdown || data.content,
        images: data.images || [],
        videoUrl: data.videoUrl || null,
        isVideo: data.isVideo || false,
        source: data.source,
        tags: data.tags || [],
      });
      setRawMarkdown(data.markdown || data.content);
      setOptimizedMarkdown("");
      setError(null);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [extensionCommunicator]);

  // 打开小红书
  const openXiaohongshu = () => {
    window.open("https://www.xiaohongshu.com", "_blank");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900">
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

        {/* Extension Banner */}
        {showExtensionBanner && hasExtension && (
          <div className="mb-6 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    浏览器插件已启用
                  </h3>
                  <button
                    onClick={() => setShowExtensionBanner(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  插件已连接，可以直接提取小红书内容
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extension Not Installed Banner */}
        {showExtensionBanner && !hasExtension && (
          <div className="mb-6 overflow-hidden rounded-lg border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Puzzle className="h-5 w-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    浏览器插件未安装
                  </h3>
                  <button
                    onClick={() => setShowExtensionBanner(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  安装插件后，可直接在小红书页面提取内容，无需手动复制链接
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={openXiaohongshu}
                    className="flex items-center gap-1.5 rounded-md bg-rose-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    打开小红书
                  </button>
                  <a
                    href="/extension/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-rose-600 underline underline-offset-2 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                  >
                    查看插件说明
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extract Method Toggle - removed (extension only) */}

        {/* URL Input */}
        <LinkInput
          onExtract={handleExtract}
          isLoading={isExtracting}
          disabled={isExtracting || isOptimizing}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
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
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0c5.373 0 018-8V2h4.587z"
                          />
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
                  filename={
                    noteData
                      ? `${sanitizeFilename(noteData.title)}.md`
                      : undefined
                  }
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
