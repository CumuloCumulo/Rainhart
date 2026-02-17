// Extension Communication Library for Web-Plugin Integration

// Known extension ID - will be filled dynamically at runtime
const EXTENSION_ID_KEY = "xhs_extension_id";
const DEFAULT_EXTENSION_ID = "xiaohongshu-extractor-extension";

export interface ExtractResult {
  title: string;
  desc: string;
  content: string;
  markdown?: string;
  images: string[];
  videoUrl: string | null;
  isVideo: boolean;
  source: string;
  tags: string[];
}

export interface ExtensionConfig {
  allowedDomains: string[];
  extractOptions: {
    includeImages: boolean;
    includeVideo: boolean;
    includeTags: boolean;
  };
}

export interface ExtensionState {
  hasExtractedData: boolean;
  hasExtractedUrl: boolean;
}

/**
 * Extension Communicator - Handles communication with browser extension
 */
export class ExtensionCommunicator {
  private extensionId: string | null = null;
  private isDetected: boolean = false;
  private listeners: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // Priority 1: Get extension ID from URL parameters (auto-connect flow)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const idFromParams = urlParams.get("extension_id");
      if (idFromParams) {
        this.extensionId = idFromParams;
        localStorage.setItem(EXTENSION_ID_KEY, idFromParams);
        console.log(
          "[ExtensionCommunicator] Extension ID from URL:",
          idFromParams,
        );
      }
    }

    // Priority 2: Get extension ID from localStorage with validation
    if (!this.extensionId && typeof window !== "undefined") {
      const storedId = localStorage.getItem(EXTENSION_ID_KEY);
      if (storedId) {
        // Validate extension ID format (should be 32 chars, lowercase letters and numbers)
        if (/^[a-z]{32}$/.test(storedId)) {
          this.extensionId = storedId;
          console.log(
            "[ExtensionCommunicator] Extension ID from localStorage:",
            storedId,
          );
        } else {
          // Invalid format, clear it
          console.log(
            "[ExtensionCommunicator] Invalid extension ID in localStorage, clearing:",
            storedId,
          );
          localStorage.removeItem(EXTENSION_ID_KEY);
        }
      }
    }

    // Listen for extension messages
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleWindowMessage.bind(this));
    }
  }

  /**
   * Handle messages sent via window.postMessage from content scripts
   */
  private handleWindowMessage(event: MessageEvent) {
    if (!event.data || event.data.type !== "XHS_NOTE_EXTRACTED") return;

    // Validate origin if possible
    if (event.origin && !event.origin.includes("xiaohongshu.com")) return;

    console.log("[ExtensionCommunicator] Received window message:", event.data);
    this.notifyListeners("EXTRACTED", event.data.data);
  }

  /**
   * Check if extension is installed and accessible
   */
  async isInstalled(): Promise<boolean> {
    if (this.isDetected && this.extensionId) {
      console.log("[ExtensionCommunicator] Already detected, skipping check");
      return true;
    }

    // Check for chrome.runtime
    if (typeof window === "undefined" || !(window as any).chrome?.runtime) {
      console.log("[ExtensionCommunicator] Chrome runtime not available");
      return false;
    }

    const chrome = (window as any).chrome;

    // Try to get extension ID if we don't have one
    if (!this.extensionId) {
      // Get extension ID from URL if we're on an extension page
      const urlParams = new URLSearchParams(window.location.search);
      const idFromParams = urlParams.get("extension_id");
      if (idFromParams) {
        this.extensionId = idFromParams;
        localStorage.setItem(EXTENSION_ID_KEY, idFromParams);
      }
    }

    // Try PING message
    if (this.extensionId) {
      console.log(
        "[ExtensionCommunicator] Attempting PING to extension:",
        this.extensionId,
      );
      try {
        const response = await this.sendMessage({
          type: "PING",
        });
        console.log("[ExtensionCommunicator] PING response:", response);
        if (response?.success) {
          this.isDetected = true;
          console.log(
            "[ExtensionCommunicator] ✓ Extension detected successfully",
          );
          return true;
        } else {
          console.log(
            "[ExtensionCommunicator] ✗ PING returned non-success:",
            response,
          );
        }
      } catch (e) {
        console.log("[ExtensionCommunicator] ✗ Extension PING failed:", e);
        console.log("[ExtensionCommunicator] Possible reasons:");
        console.log("  1. Extension ID is incorrect");
        console.log("  2. Extension is not installed or disabled");
        console.log("  3. Domain not in externally_connectable");
        console.log("  4. Extension needs to be reloaded");
        console.log("  Current extension ID:", this.extensionId);
        console.log("  Current page URL:", window.location.href);
      }
    } else {
      console.log("[ExtensionCommunicator] ✗ No extension ID available");
    }

    return false;
  }

  /**
   * Extract content from a Xiaohongshu URL using extension
   */
  async extractByUrl(url: string): Promise<ExtractResult> {
    if (!(await this.isInstalled())) {
      throw new Error("插件未安装或未启用。请先安装小红书提取器插件。");
    }

    console.log("[ExtensionCommunicator] Extracting URL:", url);

    // Try to use cached data first
    const state = await this.getState();
    if (state.hasExtractedData) {
      const data = await this.getExtractedData();
      if (data && data.url === url) {
        console.log("[ExtensionCommunicator] Using cached data");
        return data.data;
      }
    }

    // Send extract request
    const response = await this.sendMessage({
      type: "EXTRACT_URL",
      url: url,
    });

    if (!response?.success) {
      throw new Error(response?.error || "提取失败");
    }

    console.log("[ExtensionCommunicator] Extract result:", response);
    return response.data;
  }

  /**
   * Get current state of extension
   */
  async getState(): Promise<ExtensionState> {
    if (!(await this.isInstalled())) {
      return { hasExtractedData: false, hasExtractedUrl: false };
    }

    const response = await this.sendMessage({ type: "GET_STATE" });
    return response || { hasExtractedData: false, hasExtractedUrl: false };
  }

  /**
   * Get extracted data from extension
   */
  async getExtractedData(): Promise<{
    data: ExtractResult;
    url: string;
  } | null> {
    if (!(await this.isInstalled())) {
      return null;
    }

    const response = await this.sendMessage({ type: "GET_EXTRACTED_DATA" });
    return response?.success
      ? { data: response.data, url: response.url }
      : null;
  }

  /**
   * Get extension configuration
   */
  async getConfig(): Promise<ExtensionConfig | null> {
    if (!(await this.isInstalled())) {
      return null;
    }

    const response = await this.sendMessage({ type: "GET_CONFIG" });
    return response?.success ? response.config : null;
  }

  /**
   * Set extension configuration
   */
  async setConfig(config: Partial<ExtensionConfig>): Promise<boolean> {
    if (!(await this.isInstalled())) {
      throw new Error("插件未安装或未启用");
    }

    const response = await this.sendMessage({
      type: "SET_CONFIG",
      config,
    });
    return response?.success || false;
  }

  /**
   * Send a message to the extension
   */
  private async sendMessage(message: any): Promise<any> {
    if (!this.extensionId) {
      throw new Error("Extension ID not set");
    }

    console.log(
      "[ExtensionCommunicator] Sending message to extension:",
      message.type,
      "ID:",
      this.extensionId,
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Extension message timeout (30s)"));
      }, 30000);

      const chrome = (window as any).chrome;
      chrome.runtime.sendMessage(this.extensionId, message, (response: any) => {
        clearTimeout(timeout);

        if (chrome.runtime.lastError) {
          console.error(
            "[ExtensionCommunicator] Chrome runtime error:",
            chrome.runtime.lastError,
          );
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log(
            "[ExtensionCommunicator] Message response received:",
            response,
          );
          resolve(response);
        }
      });
    });
  }

  /**
   * Add an event listener
   */
  on(event: "EXTRACTED", callback: (data: ExtractResult) => void): void {
    this.listeners.set(event, callback);
  }

  /**
   * Remove an event listener
   */
  off(event: "EXTRACTED"): void {
    this.listeners.delete(event);
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(event: string, data: any) {
    const listener = this.listeners.get(event);
    if (listener) {
      listener(data);
    }
  }

  /**
   * Set extension ID manually (useful for development)
   */
  setExtensionId(id: string) {
    this.extensionId = id;
    this.isDetected = false; // Reset detection status when ID changes
    if (typeof window !== "undefined") {
      localStorage.setItem(EXTENSION_ID_KEY, id);
      console.log("[ExtensionCommunicator] Extension ID set manually:", id);
    }
  }

  /**
   * Get the current extension ID
   */
  getExtensionId(): string | null {
    return this.extensionId;
  }
}

// Singleton instance
let instance: ExtensionCommunicator | null = null;

export function getExtensionCommunicator(): ExtensionCommunicator {
  if (!instance) {
    instance = new ExtensionCommunicator();
  }
  return instance;
}
