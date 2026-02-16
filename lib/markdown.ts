// Markdown generation utilities

/**
 * Sanitize filename for markdown files
 */
export function sanitizeFilename(title: string): string {
  let sanitized = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s-_]/g, "").trim();
  sanitized = sanitized.replace(/\s+/g, "-");
  sanitized = sanitized.length > 0 ? sanitized : "Untitled";
  return sanitized.substring(0, 50);
}
