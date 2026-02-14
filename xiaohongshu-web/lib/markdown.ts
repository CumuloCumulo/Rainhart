// Markdown generation utilities

import type { XHSNoteData } from '@/types';

/**
 * Sanitize filename for markdown files
 */
export function sanitizeFilename(title: string): string {
  let sanitized = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s-_]/g, "").trim();
  sanitized = sanitized.replace(/\s+/g, "-");
  sanitized = sanitized.length > 0 ? sanitized : "Untitled";
  return sanitized.substring(0, 50);
}

/**
 * Generate markdown from extracted content
 */
export function generateMarkdown(note: XHSNoteData): string {
  const date = new Date().toISOString().split("T")[0];
  const importedAt = new Date().toLocaleString();

  let markdown = `---
title: ${note.title}
source: ${note.source}
date: ${date}
Imported At: ${importedAt}
tags: ${note.tags.join(", ")}
---

# ${note.title}\n\n`;

  // Handle video notes
  if (note.isVideo) {
    if (note.videoUrl) {
      markdown += `<video controls src="${note.videoUrl}" width="100%"></video>\n\n`;
    } else if (note.images.length > 0) {
      markdown += `[![Cover Image](${note.images[0]})](${note.source})\n\n`;
    }

    const cleanContent = note.content.replace(/#\S+/g, "").trim();
    markdown += `${cleanContent.split("\n").join("\n")}\n\n`;

    if (note.tags.length > 0) {
      markdown += "```\n";
      markdown += note.tags.map((tag) => `#${tag}`).join(" ") + "\n";
      markdown += "```\n";
    }
  }
  // Handle non-video notes
  else {
    if (note.images.length > 0) {
      markdown += `![Cover Image](${note.images[0]})\n\n`;
    }

    const cleanContent = note.content.replace(/#[^#\s]*(?:\s+#[^#\s]*)*\s*/g, "").trim();
    markdown += `${cleanContent.split("\n").join("\n")}\n\n`;

    if (note.tags.length > 0) {
      markdown += "```\n";
      markdown += note.tags.map((tag) => `#${tag}`).join(" ") + "\n";
      markdown += "```\n\n";
    }

    if (note.images.length > 0) {
      const imageMarkdown = note.images.map((url) => `![Image](${url})`).join("\n");
      markdown += `${imageMarkdown}\n`;
    }
  }

  return markdown;
}
