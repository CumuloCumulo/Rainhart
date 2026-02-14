export interface XHSNoteData {
  title: string;
  content: string;
  desc: string;
  images: string[];
  videoUrl: string | null;
  tags: string[];
  isVideo: boolean;
  source: string;
}

export interface ExtractRequest {
  url: string;
}

export interface XHSExtractResponse {
  success: boolean;
  data?: XHSNoteData;
  error?: string;
}

export interface OptimizeRequest {
  markdown: string;
  apiKey?: string;
}

export interface OptimizeResponse {
  success: boolean;
  optimizedMarkdown?: string;
  error?: string;
}
