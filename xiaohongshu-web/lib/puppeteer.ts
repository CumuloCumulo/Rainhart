// Puppeteer configuration for Vercel and local development

import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

/**
 * Detect if running in Vercel/production environment
 */
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

/**
 * Get browser instance based on environment
 */
export async function getBrowser() {
  if (isVercel) {
    // Use @sparticuz/chromium for Vercel
    const executablePath = await chromium.executablePath();
    return puppeteerCore.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath,
      headless: true,
    });
  } else {
    // Use standard Puppeteer for local development
    return puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ],
    });
  }
}

export const defaultViewport = {
  width: 1920,
  height: 1080,
};

export const defaultUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
