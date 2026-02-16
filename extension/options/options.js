// Options page logic
console.log("[小红书提取器 Options] 页面已加载");

// 检查是否是从 Web 应用返回的
const urlParams = new URLSearchParams(window.location.search);
const returnUrl = urlParams.get("return_url");
const connectSection = document.getElementById("connectSection");
const connectHint = document.getElementById("connectHint");
const connectWebAppBtn = document.getElementById("connectWebAppBtn");

// 如果有返回 URL，显示连接区域
if (returnUrl) {
  if (connectSection) {
    connectSection.style.display = "block";
    if (connectHint) {
      connectHint.textContent = `点击下方按钮返回 ${new URL(returnUrl).hostname} 并完成连接`;
    }
  }

  if (connectWebAppBtn) {
    connectWebAppBtn.addEventListener("click", () => {
      const extensionId = chrome.runtime.id;
      const url = new URL(returnUrl);
      url.searchParams.set("extension_id", extensionId);
      window.location.href = url.toString();
    });
  }
}

// 默认配置
const DEFAULT_CONFIG = {
  allowedDomains: [
    "http://localhost:*",
    "https://xiaohongshu.reinhart.io",
    "https://xiaohongshu-web.vercel.app",
  ],
  extractOptions: {
    includeImages: true,
    includeVideo: true,
    includeTags: true,
  },
};

// 当前配置
let currentConfig = {
  allowedDomains: [],
  extractOptions: { ...DEFAULT_CONFIG.extractOptions },
};

// DOM 元素
const domainListEl = document.getElementById("domainList");
const addDomainBtn = document.getElementById("addDomainBtn");
const includeImagesEl = document.getElementById("includeImages");
const includeVideoEl = document.getElementById("includeVideo");
const includeTagsEl = document.getElementById("includeTags");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const statusMessageEl = document.getElementById("statusMessage");
const extensionVersionEl = document.getElementById("extensionVersion");
const extensionIdEl = document.getElementById("extensionId");

// 显示状态消息
function showStatusMessage(message, type = "success") {
  statusMessageEl.textContent = message;
  statusMessageEl.className = `status-message ${type}`;
  statusMessageEl.style.display = "block";

  setTimeout(() => {
    statusMessageEl.style.display = "none";
  }, 3000);
}

// 加载配置
function loadConfig() {
  chrome.storage.local.get(["allowedDomains", "extractOptions"], (result) => {
    currentConfig.allowedDomains = result.allowedDomains || [
      ...DEFAULT_CONFIG.allowedDomains,
    ];
    currentConfig.extractOptions = {
      ...DEFAULT_CONFIG.extractOptions,
      ...(result.extractOptions || {}),
    };

    renderDomainList();
    updateCheckboxes();

    console.log("[小红书提取器 Options] 配置已加载:", currentConfig);
  });

  // 显示插件信息
  const manifest = chrome.runtime.getManifest();
  extensionVersionEl.textContent = manifest.version;
  extensionIdEl.textContent = chrome.runtime.id;
}

// 渲染域名列表
function renderDomainList() {
  domainListEl.innerHTML = "";

  currentConfig.allowedDomains.forEach((domain, index) => {
    const item = document.createElement("div");
    item.className = "domain-item";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-input";
    input.value = domain;
    input.placeholder = "https://example.com";
    input.addEventListener("input", (e) => {
      currentConfig.allowedDomains[index] = e.target.value;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-danger btn-icon";
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
    deleteBtn.addEventListener("click", () => {
      removeDomain(index);
    });

    item.appendChild(input);
    item.appendChild(deleteBtn);
    domainListEl.appendChild(item);
  });
}

// 添加域名
function addDomain() {
  currentConfig.allowedDomains.push("");
  renderDomainList();

  // 聚焦到新输入框
  const inputs = domainListEl.querySelectorAll("input");
  if (inputs.length > 0) {
    inputs[inputs.length - 1].focus();
  }
}

// 删除域名
function removeDomain(index) {
  currentConfig.allowedDomains.splice(index, 1);
  renderDomainList();
}

// 更新复选框状态
function updateCheckboxes() {
  includeImagesEl.checked = currentConfig.extractOptions.includeImages;
  includeVideoEl.checked = currentConfig.extractOptions.includeVideo;
  includeTagsEl.checked = currentConfig.extractOptions.includeTags;
}

// 获取复选框值
function getCheckboxValues() {
  return {
    includeImages: includeImagesEl.checked,
    includeVideo: includeVideoEl.checked,
    includeTags: includeTagsEl.checked,
  };
}

// 保存配置
function saveConfig() {
  // 过滤空域名
  currentConfig.allowedDomains = currentConfig.allowedDomains.filter(
    (d) => d.trim() !== "",
  );

  if (currentConfig.allowedDomains.length === 0) {
    showStatusMessage("请至少添加一个允许的域名", "error");
    return;
  }

  // 验证域名格式
  const invalidDomains = currentConfig.allowedDomains.filter((d) => {
    return !d.match(/^https?:\/\/.+/) && !d.match(/^http:\/\/localhost:\*$/);
  });

  if (invalidDomains.length > 0) {
    showStatusMessage(`域名格式错误: ${invalidDomains.join(", ")}`, "error");
    return;
  }

  // 更新配置
  currentConfig.extractOptions = getCheckboxValues();

  chrome.storage.local.set(currentConfig, () => {
    if (chrome.runtime.lastError) {
      showStatusMessage(
        "保存失败: " + chrome.runtime.lastError.message,
        "error",
      );
    } else {
      showStatusMessage("设置已保存");
      console.log("[小红书提取器 Options] 配置已保存:", currentConfig);

      // 更新 manifest 的 externally_connectable（需要在重新加载插件时生效）
      console.log(
        "[小红书提取器 Options] 注意：域名更改需要重新加载插件才能生效",
      );
    }
  });
}

// 重置默认配置
function resetConfig() {
  if (confirm("确定要重置为默认配置吗？")) {
    currentConfig.allowedDomains = [...DEFAULT_CONFIG.allowedDomains];
    currentConfig.extractOptions = { ...DEFAULT_CONFIG.extractOptions };

    renderDomainList();
    updateCheckboxes();

    chrome.storage.local.set(currentConfig, () => {
      showStatusMessage("已重置为默认配置");
      console.log("[小红书提取器 Options] 配置已重置");
    });
  }
}

// 事件监听
addDomainBtn.addEventListener("click", addDomain);
saveBtn.addEventListener("click", saveConfig);
resetBtn.addEventListener("click", resetConfig);

// 初始化
document.addEventListener("DOMContentLoaded", loadConfig);
