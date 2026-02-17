"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  X,
  ExternalLink,
  Puzzle,
  CheckCircle2,
  Link as LinkIcon,
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
  const [extensionId, setExtensionId] = useState<string | null>(null);
  const [showExtensionInput, setShowExtensionInput] = useState(false);
  const [manualExtensionId, setManualExtensionId] = useState("");
  const extensionCommunicator = getExtensionCommunicator();

  // 从粘贴文本中提取小红书 URL
  const extractXhsUrl = (text: string): string => {
    // 匹配小红书链接：https://www.xiaohongshu.com/... 或 http://xhslink.com/...
    const urlMatch = text.match(
      /https?:\/\/(?:www\.)?(?:xiaohongshu\.com|xhslink\.com)\/\S+/i,
    );
    if (urlMatch) {
      return urlMatch[0];
    }
    // 如果文本本身就是 URL，直接返回
    if (text.startsWith("http://") || text.startsWith("https://")) {
      return text;
    }
    return text;
  };

  const handleExtract = async (url: string) => {
    setIsExtracting(true);
    setError(null);
    setNoteData(null);
    setRawMarkdown("");
    setOptimizedMarkdown("");

    try {
      // 从粘贴文本中提取纯 URL
      const cleanUrl = extractXhsUrl(url);
      console.log("[Web App] 使用插件提取:", cleanUrl);
      const data = await extensionCommunicator.extractByUrl(cleanUrl);
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
      console.log("[Web App] ========== 开始检测扩展 ==========");
      console.log("[Web App] 当前页面 URL:", window.location.href);
      console.log(
        "[Web App] localStorage 中的扩展 ID:",
        localStorage.getItem("xhs_extension_id"),
      );

      try {
        const installed = await extensionCommunicator.isInstalled();
        setHasExtension(installed);
        console.log("[Web App] 扩展检测结果:", installed ? "已连接" : "未连接");
      } catch (e) {
        console.log("[Web App] 扩展检测失败:", e);
        setHasExtension(false);
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

  // 连接扩展 - 打开扩展设置页面
  const connectExtension = () => {
    setShowExtensionInput(true);
  };

  // 手动设置扩展 ID
  const handleSetExtensionId = () => {
    if (manualExtensionId.trim()) {
      extensionCommunicator.setExtensionId(manualExtensionId.trim());
      setExtensionId(manualExtensionId.trim());
      // 清空输入并刷新页面
      setManualExtensionId("");
      setShowExtensionInput(false);
      window.location.reload();
    }
  };

  // 打开扩展设置页面
  const openExtensionSettings = () => {
    // 打开 chrome://extensions/ 页面
    window.open("chrome://extensions/", "_blank");
  };

  // 处理 URL 参数中的扩展 ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const extIdFromUrl = urlParams.get("extension_id");
    if (extIdFromUrl) {
      localStorage.setItem("xhs_extension_id", extIdFromUrl);
      setExtensionId(extIdFromUrl);
      extensionCommunicator.setExtensionId(extIdFromUrl);
      // 清除 URL 参数
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      // 刷新页面以使用新的扩展 ID
      window.location.reload();
    }
  }, [extensionCommunicator]);

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
                    {showExtensionInput ? "输入扩展 ID" : "连接浏览器插件"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowExtensionBanner(false);
                      setShowExtensionInput(false);
                    }}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {!showExtensionInput ? (
                  <div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      安装插件后，可直接在小红书页面提取内容，无需手动复制链接
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        onClick={connectExtension}
                        className="flex items-center gap-1.5 rounded-md bg-rose-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        输入扩展 ID
                      </button>
                      <button
                        onClick={openXiaohongshu}
                        className="flex items-center gap-1.5 rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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
                ) : (
                  <div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      请按以下步骤获取并输入扩展 ID：
                    </p>
                    <ol className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 font-medium text-rose-500">
                          1.
                        </span>
                        <span>
                          打开浏览器扩展页面：
                          <button
                            onClick={openExtensionSettings}
                            className="text-rose-600 underline underline-offset-1 hover:text-rose-700"
                          >
                            chrome://extensions/
                          </button>
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 font-medium text-rose-500">
                          2.
                        </span>
                        <span>
                          找到"小红书提取器"，点击"选项"或"详细信息"按钮
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 font-medium text-rose-500">
                          3.
                        </span>
                        <span>在设置页面点击"复制"按钮复制扩展 ID</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 font-medium text-rose-500">
                          4.
                        </span>
                        <span>将扩展 ID 粘贴到下方输入框</span>
                      </li>
                    </ol>
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={manualExtensionId}
                        onChange={(e) => setManualExtensionId(e.target.value)}
                        placeholder="粘贴扩展 ID (如: abcdefghijklmnopqrstuvwxyz1234)"
                        className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-500 dark:placeholder-zinc-500"
                      />
                      <button
                        onClick={handleSetExtensionId}
                        disabled={!manualExtensionId.trim()}
                        className="rounded-md bg-rose-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-700"
                      >
                        连接
                      </button>
                    </div>
                  </div>
                )}
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
