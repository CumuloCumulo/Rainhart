export interface OptimizeRequest {
  markdown: string;
  apiKey?: string;
}

export interface OptimizeResponse {
  success: boolean;
  optimizedMarkdown?: string;
  error?: string;
}
