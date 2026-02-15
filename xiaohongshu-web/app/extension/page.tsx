"use client";

import { Download, Copy, Check, ExternalLink, Puzzle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ExtensionPage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50">
            <Puzzle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            小红书提取器 - 浏览器插件
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            直接在小红书页面提取内容，无需手动复制链接
          </p>
        </div>

        {/* Features */}
        <div className="mb-12 space-y-6">
          <div className="rounded-xl border border-rose-200 bg-white p-6 dark:border-rose-900/50 dark:bg-zinc-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              <Check className="h-5 w-5 text-emerald-500" />
              插件优势
            </h2>
            <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                <span>无需手动复制 Cookie，自动使用已登录状态</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                <span>完全避免反爬虫检测，真实浏览器环境</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                <span>提取速度快，无需服务器处理</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                <span>支持一键发送到 Web 应用</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              安装说明
            </h2>
            <ol className="space-y-4 text-zinc-700 dark:text-zinc-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
                  1
                </span>
                <div>
                  <p className="font-medium">下载插件文件</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    点击下方按钮下载插件压缩包
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
                  2
                </span>
                <div>
                  <p className="font-medium">解压到本地</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    将下载的 zip 文件解压到一个文件夹
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
                  3
                </span>
                <div>
                  <p className="font-medium">打开浏览器扩展页面</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    在地址栏输入：<code className="rounded bg-white px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                      chrome://extensions
                    </code>
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
                  4
                </span>
                <div>
                  <p className="font-medium">加载插件</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    开启右上角"开发者模式"，点击"加载已解压的扩展程序"，选择解压的文件夹
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Download Button */}
        <div className="mb-12 flex justify-center">
          <a
            href="/extension.zip"
            download="xiaohongshu-extractor-extension.zip"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-rose-600 hover:to-orange-600 hover:shadow-xl"
          >
            <Download className="h-6 w-6" />
            下载插件
          </a>
        </div>

        {/* Web App URL */}
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
            Web 应用地址
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={typeof window !== 'undefined' ? window.location.origin : ''}
              readOnly
              className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            />
            <button
              onClick={() => copyToClipboard(typeof window !== 'undefined' ? window.location.origin : '')}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            将此地址配置到插件的 Web 应用设置中，以便数据自动发送
          </p>
        </div>

        {/* Usage */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            使用方法
          </h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
            <div>
              <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">
                方法一：直接在小红书页面提取
              </p>
              <ol className="ml-4 list-decimal space-y-1 text-sm">
                <li>访问任意小红书笔记页面</li>
                <li>点击浏览器工具栏中的插件图标</li>
                <li>查看提取预览，选择复制或下载</li>
              </ol>
            </div>
            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <p className="mb-2 font-medium text-zinc-700 dark:text-zinc-300">
                方法二：从 Web 应用启动
              </p>
              <ol className="ml-4 list-decimal space-y-1 text-sm">
                <li>在 Web 应用首页点击"打开小红书"按钮</li>
                <li>在小红书页面点击插件图标</li>
                <li>点击"发送到 Web 应用"</li>
                <li>数据将自动填充到 Web 应用中</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>如有问题，请查看 GitHub 仓库或提交 Issue</p>
        </div>
      </div>
    </main>
  );
}
