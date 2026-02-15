// Popup Script - 弹窗逻辑

console.log('[小红书提取器 Popup] 已加载');

// DOM 元素
const elements = {
  noNotePage: document.getElementById('no-note-page'),
  loading: document.getElementById('loading'),
  extracted: document.getElementById('extracted'),
  error: document.getElementById('error'),
  noteTitle: document.getElementById('note-title'),
  noteType: document.getElementById('note-type'),
  imagesCount: document.getElementById('images-count'),
  markdownPreview: document.getElementById('markdown-preview'),
  charCount: document.getElementById('char-count'),
  errorMessage: document.getElementById('error-message'),
  webAppSection: document.getElementById('web-app-section'),
  openXhsBtn: document.getElementById('open-xhs-btn'),
  copyBtn: document.getElementById('copy-btn'),
  downloadBtn: document.getElementById('download-btn'),
  sendToWebBtn: document.getElementById('send-to-web-btn'),
  retryBtn: document.getElementById('retry-btn')
};

let extractedData = null;
let webAppTabId = null;
let currentTabId = null;

// 显示指定状态
function showState(state) {
  Object.values({
    noNotePage: elements.noNotePage,
    loading: elements.loading,
    extracted: elements.extracted,
    error: elements.error
  }).forEach(el => el.classList.add('hidden'));

  if (state === 'no-note') {
    elements.noNotePage.classList.remove('hidden');
  } else if (state === 'loading') {
    elements.loading.classList.remove('hidden');
  } else if (state === 'extracted') {
    elements.extracted.classList.remove('hidden');
  } else if (state === 'error') {
    elements.error.classList.remove('hidden');
  }
}

// 显示提取的数据
function showExtractedData(data) {
  extractedData = data;

  elements.noteTitle.textContent = data.title || '未命名笔记';
  elements.noteType.textContent = data.isVideo ? '视频' : '图文';

  if (data.isVideo) {
    elements.noteType.style.background = '#f59e0b';
  } else {
    elements.noteType.style.background = '#10b981';
  }

  if (data.isVideo && data.videoUrl) {
    elements.imagesCount.textContent = '1 个视频';
  } else {
    elements.imagesCount.textContent = `${data.images.length} 张图片`;
  }

  elements.markdownPreview.textContent = data.markdown || '无内容';
  elements.charCount.textContent = `${(data.markdown || '').length} 字符`;

  // 检查是否有 Web 应用打开
  checkWebAppTab();

  showState('extracted');
}

// 显示错误
function showError(message) {
  elements.errorMessage.textContent = message;
  showState('error');
}

// 检查 Web 应用标签页
async function checkWebAppTab() {
  try {
    const tabs = await chrome.tabs.query({});
    const webAppTabs = tabs.filter(tab =>
      tab.url && (
        tab.url.includes('xiaohongshu-web') ||
        tab.url.includes('localhost:3000') ||
        tab.url.includes('xiaohongshu-extract') ||
        tab.url.includes('127.0.0.1:3000')
      )
    );

    if (webAppTabs.length > 0) {
      webAppTabId = webAppTabs[0].id;
      elements.webAppSection.classList.remove('hidden');
    } else {
      elements.webAppSection.classList.add('hidden');
    }
  } catch (err) {
    console.error('[小红书提取器 Popup] 检查标签页失败:', err);
  }
}

// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess();
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopySuccess();
  }
}

function showCopySuccess() {
  const btn = elements.copyBtn;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> 已复制`;
  btn.classList.add('success');
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove('success');
  }, 2000);
}

// 下载文件
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 生成文件名
function sanitizeFilename(title) {
  let sanitized = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s-_]/g, '').trim();
  sanitized = sanitized.replace(/\s+/g, '-');
  return sanitized.length > 0 ? sanitized.substring(0, 50) : 'xiaohongshu-note';
}

// 检查是否在小红书页面
function isXiaohongshuPage(url) {
  if (!url) return false;
  return url.includes('xiaohongshu.com');
}

// 检查是否在小红书笔记页面
function isNotePage(url) {
  if (!url) return false;
  return url.includes('/discovery/item/') ||
         url.includes('/explore/') ||
         url.match(/xiaohongshu\.com\/[a-zA-Z0-9]{24}/);
}

// 提取笔记数据
async function extractNote() {
  showState('loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      showError('无法获取当前标签页');
      return;
    }

    currentTabId = tab.id;

    // 检查是否在小红书页面
    if (!isXiaohongshuPage(tab.url)) {
      showError('请先访问小红书页面');
      return;
    }

    // 检查是否在笔记页面
    if (!isNotePage(tab.url)) {
      showError('请访问小红书笔记页面（点击进入具体笔记）');
      return;
    }

    // 尝试发送消息到 content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_NOTE' });

      if (response && response.success && response.data) {
        showExtractedData(response.data);
      } else {
        showError(response?.error || '无法提取笔记数据');
      }
    } catch (err) {
      console.error('[小红书提取器 Popup] content script 连接失败:', err);

      // 检查是否是因为 content script 未注入
      if (err.message.includes('Could not establish connection')) {
        // 尝试注入 content script
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/script.js']
          });

          // 等待一下后重试
          await new Promise(resolve => setTimeout(resolve, 500));

          const retryResponse = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_NOTE' });

          if (retryResponse && retryResponse.success && retryResponse.data) {
            showExtractedData(retryResponse.data);
          } else {
            showError(retryResponse?.error || '无法提取笔记数据');
          }
        } catch (injectErr) {
          console.error('[小红书提取器 Popup] 注入失败:', injectErr);
          showError('无法注入脚本，请刷新页面后重试');
        }
      } else {
        showError('提取失败: ' + err.message);
      }
    }
  } catch (err) {
    console.error('[小红书提取器 Popup] 提取失败:', err);
    showError('提取失败: ' + err.message);
  }
}

// 初始化
async function init() {
  // 先从 background 获取已缓存的数据
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_EXTRACTED_DATA' });
    if (response && response.success && response.data) {
      showExtractedData(response.data);
      return;
    }
  } catch (err) {
    console.log('[小红书提取器 Popup] 无缓存数据');
  }

  // 检查当前页面
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showState('no-note');
      return;
    }

    if (!tab.url) {
      showState('no-note');
      return;
    }

    // 检查是否在小红书页面
    if (!isXiaohongshuPage(tab.url)) {
      showState('no-note');
      return;
    }

    // 检查是否在笔记页面
    if (!isNotePage(tab.url)) {
      showState('no-note');
      return;
    }

    // 在小红书笔记页面，尝试提取
    extractNote();
  } catch (err) {
    console.error('[小红书提取器 Popup] 初始化失败:', err);
    showState('no-note');
  }
}

// 事件监听
elements.openXhsBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.xiaohongshu.com' }).catch(() => {});
});

elements.copyBtn.addEventListener('click', () => {
  if (extractedData && extractedData.markdown) {
    copyToClipboard(extractedData.markdown);
  }
});

elements.downloadBtn.addEventListener('click', () => {
  if (extractedData) {
    const filename = sanitizeFilename(extractedData.title) + '.md';
    downloadFile(extractedData.markdown, filename);
  }
});

elements.retryBtn.addEventListener('click', () => {
  extractNote();
});

elements.sendToWebBtn.addEventListener('click', async () => {
  if (!extractedData) return;

  try {
    // 检查是否在小红书页面
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.id && isXiaohongshuPage(tab.url)) {
      // 发送消息到 content script 让它通过 postMessage 发送
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'SEND_TO_WEB_APP' });
      } catch (err) {
        console.log('[小红书提取器 Popup] content script 不可用，尝试直接发送');

        // 如果 content script 不可用，直接在 popup 中发送（可能不工作）
        // 但至少让用户知道发生了什么
      }
    }

    // 如果 Web 应用打开，切换到它
    if (webAppTabId) {
      await chrome.tabs.update(webAppTabId, { active: true });
    } else {
      // 如果没有 Web 应用打开，打开它
      const newTab = await chrome.tabs.create({
        url: 'http://localhost:3000'
      });
      webAppTabId = newTab.id;
    }

    showCopySuccess();
  } catch (err) {
    console.error('[小红书提取器 Popup] 发送失败:', err);
    showError('发送失败');
  }
});

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'NOTE_UPDATED') {
    showExtractedData(message.data);
  }
});

// 初始化
init();
