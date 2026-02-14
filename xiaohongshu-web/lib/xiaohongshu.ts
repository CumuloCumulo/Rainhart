// Xiaohongshu content extraction logic

import type { XHSNoteData } from '@/types';
import { getBrowser, defaultViewport, defaultUserAgent } from './puppeteer';

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

/**
 * Extract note title from HTML
 */
function extractTitle(html: string): string {
  const match = html.match(/<title>(.*?)<\/title>/);
  return match ? match[1].replace(/ - 小红书/, "").trim() : "Untitled Xiaohongshu Note";
}

/**
 * Extract image URLs from note data
 */
function extractImages(html: string): string[] {
  const stateMatch = html.match(/window\.__INITIAL_STATE__=(.*?)<\/script>/s);
  if (!stateMatch) return [];

  try {
    const jsonStr = stateMatch[1].trim();
    const cleanedJson = jsonStr.replace(/undefined/g, "null");
    const state = JSON.parse(cleanedJson);
    const noteId = Object.keys(state.note.noteDetailMap)[0];
    const imageList = state.note.noteDetailMap[noteId].note.imageList || [];
    return imageList
      .map((img: any) => img.urlDefault || "")
      .filter((url: string) => url && url.startsWith("http"));
  } catch (e) {
    console.log(`Failed to parse images: ${(e as Error).message}`);
    return [];
  }
}

/**
 * Extract video URL from note data
 */
function extractVideoUrl(html: string): string | null {
  const stateMatch = html.match(/window\.__INITIAL_STATE__=(.*?)<\/script>/s);
  if (!stateMatch) return null;

  try {
    const jsonStr = stateMatch[1].trim();
    const cleanedJson = jsonStr.replace(/undefined/g, "null");
    const state = JSON.parse(cleanedJson);
    const noteId = Object.keys(state.note.noteDetailMap)[0];
    const noteData = state.note.noteDetailMap[noteId].note;
    const videoInfo = noteData.video;

    if (!videoInfo || !videoInfo.media || !videoInfo.media.stream) return null;

    if (videoInfo.media.stream.h264 && videoInfo.media.stream.h264.length > 0) {
      return videoInfo.media.stream.h264[0].masterUrl || null;
    }
    if (videoInfo.media.stream.h265 && videoInfo.media.stream.h265.length > 0) {
      return videoInfo.media.stream.h265[0].masterUrl || null;
    }
    return null;
  } catch (e) {
    console.log(`Failed to parse video URL: ${(e as Error).message}`);
    return null;
  }
}

/**
 * Extract note content from HTML or JSON
 */
function extractContent(html: string): string {
  const divMatch = html.match(/<div id="detail-desc" class="desc">([\s\S]*?)<\/div>/);
  if (divMatch) {
    return divMatch[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\[话题\]/g, "")
      .replace(/\[[^\]]+\]/g, "")
      .trim() || "Content not found";
  }

  const stateMatch = html.match(/window\.__INITIAL_STATE__=(.*?)<\/script>/s);
  if (stateMatch) {
    try {
      const jsonStr = stateMatch[1].trim();
      const cleanedJson = jsonStr.replace(/undefined/g, "null");
      const state = JSON.parse(cleanedJson);
      const noteId = Object.keys(state.note.noteDetailMap)[0];
      const desc = state.note.noteDetailMap[noteId].note.desc || "";
      return desc
        .replace(/\[话题\]/g, "")
        .replace(/\[[^\]]+\]/g, "")
        .trim() || "Content not found";
    } catch (e) {
      console.log(`Failed to parse content from JSON: ${(e as Error).message}`);
    }
  }
  return "Content not found";
}

/**
 * Determine if the note is a video note
 */
function isVideoNote(html: string): boolean {
  const stateMatch = html.match(/window\.__INITIAL_STATE__=(.*?)<\/script>/s);
  if (!stateMatch) return false;

  try {
    const jsonStr = stateMatch[1].trim();
    const cleanedJson = jsonStr.replace(/undefined/g, "null");
    const state = JSON.parse(cleanedJson);
    const noteId = Object.keys(state.note.noteDetailMap)[0];
    const noteType = state.note.noteDetailMap[noteId].note.type;
    return noteType === "video";
  } catch (e) {
    console.log(`Failed to determine note type: ${(e as Error).message}`);
    return false;
  }
}

/**
 * Extract tags from content
 */
function extractTags(content: string): string[] {
  const tagMatches = content.match(/#\S+/g) || [];
  return tagMatches.map((tag) => tag.replace("#", "").trim());
}

/**
 * Main function to extract Xiaohongshu note content
 */
export async function extractXHSNote(url: string): Promise<XHSNoteData> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport and user agent
    await page.setViewport(defaultViewport);
    await page.setUserAgent(defaultUserAgent);

    // Navigate to the URL with longer timeout
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for content to load
    await page.waitForSelector('title', { timeout: 10000 });

    // Get the HTML content
    const html = await page.content();

    // Extract note details
    const title = extractTitle(html);
    const videoUrl = extractVideoUrl(html);
    const images = extractImages(html);
    const content = extractContent(html);
    const isVideo = isVideoNote(html);
    const tags = extractTags(content);

    return {
      title,
      desc: content,
      content,
      images,
      videoUrl,
      isVideo,
      source: url,
      tags,
    };
  } finally {
    await page.close();
    await browser.close();
  }
}
