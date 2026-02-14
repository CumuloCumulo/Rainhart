import { NextResponse } from 'next/server';
import { normalizeURL, extractXHSNote } from '@/lib/xiaohongshu';
import { generateMarkdown } from '@/lib/markdown';
import type { XHSExtractResponse } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Normalize and validate URL
    const normalizedUrl = normalizeURL(url);
    if (!normalizedUrl) {
      return NextResponse.json(
        { success: false, error: 'Invalid Xiaohongshu URL' },
        { status: 400 }
      );
    }

    // Extract content using Puppeteer
    const noteData = await extractXHSNote(normalizedUrl);

    // Generate markdown
    const markdown = generateMarkdown(noteData);

    const response: XHSExtractResponse = {
      success: true,
      data: {
        title: noteData.title,
        desc: noteData.desc,
        content: markdown,
        images: noteData.images,
        videoUrl: noteData.videoUrl,
        isVideo: noteData.isVideo,
        source: noteData.source,
        tags: noteData.tags,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract content',
      },
      { status: 500 }
    );
  }
}
