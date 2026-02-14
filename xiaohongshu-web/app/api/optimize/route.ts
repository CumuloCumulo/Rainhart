// API route for optimizing Markdown with AI

import { NextRequest, NextResponse } from 'next/server';
import { optimizeMarkdown } from '@/lib/ai';
import type { OptimizeRequest, OptimizeResponse } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeRequest = await request.json();
    const { markdown, apiKey } = body;

    if (!markdown) {
      return NextResponse.json<OptimizeResponse>(
        { success: false, error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    // Override API key if provided (for development/testing)
    if (apiKey) {
      process.env.MOONSHOT_API_KEY = apiKey;
    }

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json<OptimizeResponse>(
        { success: false, error: 'MOONSHOT_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Optimize markdown
    const optimizedMarkdown = await optimizeMarkdown(markdown);

    return NextResponse.json<OptimizeResponse>({
      success: true,
      optimizedMarkdown,
    });
  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json<OptimizeResponse>(
      {
        success: false,
        error: `Failed to optimize content: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
