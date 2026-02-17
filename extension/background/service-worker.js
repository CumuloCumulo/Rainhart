// Background Service Worker - 处理跨域请求和消息路由

console.log("[小红书提取器] Background Service Worker 已加载");
console.log("[小红书提取器] 扩展 ID:", chrome.runtime.id);

// 插件ID，用于验证来源
const EXTENSION_ID = chrome.runtime.id;

// 默认配置
const DEFAULT_CONFIG = {
  allowedDomains: [
    "http://localhost:*",
    "https://xiaohongshu.reinhart.io",
    "https://xiaohongshu-web.vercel.app",
    "https://rainhart.onrender.com",
  ],
  extractOptions: {
    includeImages: true,
    includeVideo: true,
    includeTags: true,
  },
};

// 存储提取的数据
let extractedData = null;
let noteUrl = null;

// 验证来源是否允许
function isSourceAllowed(senderUrl) {
  if (!senderUrl) return false;

  return chrome.storage.local.get(["allowedDomains"], (result) => {
    const domains = result.allowedDomains || DEFAULT_CONFIG.allowedDomains;
    return domains.some((domain) => {
      if (domain.includes(":*")) {
        const baseDomain = domain.replace(":*", "");
        return senderUrl.startsWith(baseDomain);
      }
      return senderUrl === domain;
    });
  });
}

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[小红书提取器 Background] 收到消息:", message);

  if (message.type === "NOTE_EXTRACTED") {
    extractedData = message.data;
    noteUrl = message.data?.source || sender.tab?.url;
    console.log("[小红书提取器 Background] 数据已缓存:", message.data?.title);

    // 设置图标状态为"可提取"
    if (sender.tab?.id) {
      chrome.action
        .setIcon({
          tabId: sender.tab.id,
          path: {
            16: "icon16-active.png",
            48: "icon48-active.png",
            128: "icon128-active.png",
          },
        })
        .catch(() => {});
      chrome.action
        .setBadgeText({
          tabId: sender.tab.id,
          text: "✓",
        })
        .catch(() => {});
      chrome.action
        .setBadgeBackgroundColor({
          tabId: sender.tab.id,
          color: "#10b981",
        })
        .catch(() => {});
    }

    sendResponse({ success: true });
    return true;
  }

  if (message.type === "GET_EXTRACTED_DATA") {
    sendResponse({
      success: true,
      data: extractedData,
      url: noteUrl,
    });
    return true;
  }

  if (message.type === "CLEAR_DATA") {
    extractedData = null;
    noteUrl = null;
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "CHECK_PAGE") {
    // 转发到 content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          sendResponse(response || { isNotePage: false });
        });
      } else {
        sendResponse({ isNotePage: false });
      }
    });
    return true;
  }

  if (message.type === "SEND_TO_WEB_APP") {
    // 转发到 content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ success: false, error: "无法找到活动标签页" });
      }
    });
    return true;
  }
});

// 监听标签页更新，重置状态
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // 重置图标
    chrome.action
      .setIcon({
        tabId: tabId,
        path: {
          16: "icon16.png",
          48: "icon48.png",
          128: "icon128.png",
        },
      })
      .catch(() => {});
    chrome.action
      .setBadgeText({
        tabId: tabId,
        text: "",
      })
      .catch(() => {});
  }
});

// 监听标签页激活
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url?.includes("xiaohongshu.com")) {
      chrome.action
        .setIcon({
          tabId: activeInfo.tabId,
          path: {
            16: "icon16-active.png",
            48: "icon48-active.png",
            128: "icon128-active.png",
          },
        })
        .catch(() => {});
    }
  });
});

// 插件安装时
chrome.runtime.onInstalled.addListener((details) => {
  console.log("[小红书提取器] 插件已安装:", details.reason);

  if (details.reason === "install") {
    // 首次安装，保存默认配置
    chrome.storage.local.set(DEFAULT_CONFIG, () => {
      console.log("[小红书提取器] 默认配置已保存");
    });

    // 首次安装，打开选项页面
    chrome.tabs
      .create({
        url: chrome.runtime.getURL("options/options.html"),
      })
      .catch(() => {});
  } else if (details.reason === "update") {
    // 扩展更新时，合并新的默认域名（不覆盖用户自定义的域名）
    chrome.storage.local.get(["allowedDomains"], (result) => {
      const storedDomains = result.allowedDomains || [];
      const newDomains = DEFAULT_CONFIG.allowedDomains.filter(
        (d) => !storedDomains.includes(d),
      );
      if (newDomains.length > 0) {
        const mergedDomains = [...storedDomains, ...newDomains];
        chrome.storage.local.set({ allowedDomains: mergedDomains }, () => {
          console.log("[小红书提取器] 已合并新的默认域名:", newDomains);
          console.log("[小红书提取器] 当前域名列表:", mergedDomains);
        });
      }
    });
  }
});

// 监听来自外部网页的消息（Web端与插件联动）
chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    console.log("[小红书提取器 External] ========== 收到外部消息 ==========");
    console.log("[小红书提取器 External] 消息类型:", message.type);
    console.log("[小红书提取器 External] 发送者 ID:", sender.id);
    console.log("[小红书提取器 External] 发送者 URL:", sender.url);

    // 验证来源（在externally_connectable中配置）
    const senderUrl = sender.url;
    if (!senderUrl) {
      console.log("[小红书提取器 External] ✗ 拒绝：没有来源URL");
      sendResponse({ success: false, error: "未知的来源" });
      return false;
    }

    // 验证来源是否在允许列表中
    // 去除末尾斜杠以统一比较
    const normalizedSenderUrl = senderUrl.replace(/\/+$/, "");
    const isAllowed = await new Promise((resolve) => {
      chrome.storage.local.get(["allowedDomains"], (result) => {
        const domains = result.allowedDomains || DEFAULT_CONFIG.allowedDomains;
        console.log("[小红书提取器 External] 允许的域名列表:", domains);
        console.log(
          "[小红书提取器 External] 发送者 URL (标准化):",
          normalizedSenderUrl,
        );
        const allowed = domains.some((domain) => {
          const normalizedDomain = domain.replace(/\/+$/, "");
          if (normalizedDomain.includes(":*")) {
            const baseDomain = normalizedDomain.replace(":*", "");
            const matches = normalizedSenderUrl.startsWith(baseDomain);
            console.log(
              `[小红书提取器 External] 检查域名 "${baseDomain}*" 匹配:`,
              matches,
            );
            return matches;
          }
          const matches = normalizedSenderUrl === normalizedDomain;
          console.log(
            `[小红书提取器 External] 检查域名 "${normalizedDomain}" 匹配:`,
            matches,
          );
          return matches;
        });
        resolve(allowed);
      });
    });

    if (!isAllowed) {
      console.log(
        "[小红书提取器 External] ✗ 拒绝：来源不在允许列表中",
        senderUrl,
      );
      sendResponse({ success: false, error: "来源不被允许" });
      return false;
    }

    console.log("[小红书提取器 External] ✓ 来源验证通过");

    // 处理不同类型的消息
    switch (message.type) {
      case "PING":
        console.log("[小红书提取器 External] 处理 PING 请求");
        // 健康检查
        sendResponse({
          success: true,
          version: "1.1.0",
          extensionId: EXTENSION_ID,
        });
        console.log("[小红书提取器 External] ✓ PING 响应已发送");
        break;

      case "GET_STATE":
        // 获取当前状态
        sendResponse({
          success: true,
          hasExtractedData: !!extractedData,
          hasExtractedUrl: !!noteUrl,
        });
        break;

      case "GET_CONFIG":
        // 获取配置
        chrome.storage.local.get(
          ["allowedDomains", "extractOptions"],
          (result) => {
            sendResponse({
              success: true,
              config: {
                allowedDomains:
                  result.allowedDomains || DEFAULT_CONFIG.allowedDomains,
                extractOptions:
                  result.extractOptions || DEFAULT_CONFIG.extractOptions,
              },
            });
          },
        );
        return true; // 异步响应

      case "SET_CONFIG":
        // 设置配置
        if (message.config) {
          chrome.storage.local.set(message.config, () => {
            console.log("[小红书提取器 External] 配置已更新:", message.config);
            sendResponse({ success: true });
          });
          return true; // 异步响应
        }
        sendResponse({ success: false, error: "无效的配置" });
        break;

      case "EXTRACT_URL":
        // 提取指定URL的内容
        if (!message.url) {
          sendResponse({ success: false, error: "URL不能为空" });
          break;
        }

        console.log("[小红书提取器 External] 提取 URL:", message.url);

        try {
          // 检查是否已有缓存数据
          if (extractedData && noteUrl === message.url) {
            console.log("[小红书提取器 External] 使用缓存数据");
            sendResponse({
              success: true,
              data: extractedData,
              url: noteUrl,
              fromCache: true,
            });
            break;
          }

          // 辅助函数：向标签页发送提取请求，失败时尝试注入 content script
          async function extractFromTab(tabId, url) {
            // 先尝试直接发送消息
            try {
              const response = await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(
                  tabId,
                  { type: "EXTRACT_NOTE" },
                  (resp) => {
                    if (chrome.runtime.lastError) {
                      reject(chrome.runtime.lastError);
                    } else {
                      resolve(resp);
                    }
                  },
                );
              });
              return response;
            } catch (e) {
              console.log(
                "[小红书提取器 External] Content script 未就绪，尝试注入...",
                e.message,
              );
            }

            // Content script 未注入，使用 scripting API 注入
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content/script.js"],
              });
              console.log("[小红书提取器 External] Content script 注入成功");

              // 等待 content script 初始化和数据提取
              await new Promise((resolve) => setTimeout(resolve, 5000));

              // 再次尝试发送消息
              const response = await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(
                  tabId,
                  { type: "EXTRACT_NOTE" },
                  (resp) => {
                    if (chrome.runtime.lastError) {
                      reject(chrome.runtime.lastError);
                    } else {
                      resolve(resp);
                    }
                  },
                );
              });
              return response;
            } catch (injectErr) {
              console.error(
                "[小红书提取器 External] Content script 注入失败:",
                injectErr,
              );
              return {
                success: false,
                error: "无法注入 content script，请手动打开小红书页面后重试",
              };
            }
          }

          // 检查是否有小红书标签页已打开
          chrome.tabs.query({}, async (tabs) => {
            const targetTab = tabs.find(
              (tab) =>
                tab.url === message.url ||
                (tab.url && tab.url.startsWith("https://www.xiaohongshu.com")),
            );

            let tabId;

            if (targetTab && targetTab.id) {
              console.log(
                "[小红书提取器 External] 找到已有标签页:",
                targetTab.url,
              );
              tabId = targetTab.id;
            } else {
              // 没有找到标签页，打开一个新的
              console.log(
                "[小红书提取器 External] 未找到标签页，正在打开新标签页",
              );
              try {
                const newTab = await chrome.tabs.create({
                  url: message.url,
                });
                tabId = newTab.id;

                // 等待页面加载完成
                await new Promise((resolve) => {
                  const listener = (tid, changeInfo) => {
                    if (tid === tabId && changeInfo.status === "complete") {
                      chrome.tabs.onUpdated.removeListener(listener);
                      resolve();
                    }
                  };
                  chrome.tabs.onUpdated.addListener(listener);
                  // 超时保护
                  setTimeout(() => {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                  }, 15000);
                });

                console.log("[小红书提取器 External] 新标签页加载完成");
              } catch (e) {
                sendResponse({
                  success: false,
                  error: "无法打开标签页: " + e.message,
                });
                return;
              }
            }

            // 从标签页提取数据
            const result = await extractFromTab(tabId, message.url);
            sendResponse(result || { success: false, error: "提取返回空结果" });
          });
          return true; // 异步响应
        } catch (e) {
          console.error("[小红书提取器 External] 提取失败:", e);
          sendResponse({ success: false, error: e.message });
        }
        break;

      case "GET_EXTRACTED_DATA":
        // 获取已提取的数据
        sendResponse({
          success: true,
          data: extractedData,
          url: noteUrl,
        });
        break;

      default:
        console.log("[小红书提取器 External] 未知消息类型:", message.type);
        sendResponse({ success: false, error: "未知的消息类型" });
        break;
    }

    return true; // 保持消息通道开放
  },
);
