// Client-side utilities that don't require Node.js

/**
 * Normalize URL to standard format
 */
export function normalizeURL(url: string): string | null {
  // First try to match mobile share links
  const mobileUrlMatch = url.match(/http:\/\/xhslink\.com\/a?o?\/[^\s,，]+/);
  if (mobileUrlMatch) {
    return mobileUrlMatch[0];
  }

  // Then try to match desktop/web links (both discovery/item and explore formats)
  const webUrlMatch = url.match(/https:\/\/www\.xiaohongshu\.com\/(?:discovery\/item|explore)\/[a-zA-Z0-9]+(?:\?[^\s,，]*)?/);
  if (webUrlMatch) {
    // Normalize explore URLs to discovery/item format
    return webUrlMatch[0].replace('/explore/', '/discovery/item/');
  }

  return null;
}
