"use client";

import { Download } from "lucide-react";

export interface DownloadButtonProps {
  markdown: string;
  filename?: string;
}

export default function DownloadButton({
  markdown,
  filename,
}: DownloadButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "xiaohongshu-note.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      <Download className="h-4 w-4" />
      下载 Markdown
    </button>
  );
}
