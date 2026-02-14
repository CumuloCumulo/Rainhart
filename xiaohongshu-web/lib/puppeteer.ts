// Puppeteer configuration for Vercel

import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

export async function getBrowser() {
  const executablePath = await chromium.executablePath();

  return puppeteerCore.launch({
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    executablePath,
    headless: true,
  });
}

export const defaultViewport = {
  width: 1920,
  height: 1080,
};

export const defaultUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
