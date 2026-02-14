'use client';

import { useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';

interface LinkInputProps {
  onExtract: (url: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export default function LinkInput({ onExtract, isLoading, disabled }: LinkInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await onExtract(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="粘贴小红书链接 (如: http://xhslink.com/...)"
          disabled={disabled || isLoading}
          className="w-full rounded-lg border border-zinc-200 bg-white px-10 py-3 pr-4 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || isLoading || !url.trim()}
        className="flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            提取中...
          </>
        ) : (
          '提取内容'
        )}
      </button>
    </form>
  );
}
