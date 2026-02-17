// Content Script - 注入到小红书页面，负责数据提取

console.log("[小红书提取器] Content Script 已加载");

// 检测是否在笔记页面
function isNotePage() {
  const url = window.location.href;
  return (
    url.includes("/discovery/item/") ||
    url.includes("/explore/") ||
    url.match(/xiaohongshu\.com\/[a-zA-Z0-9]{24}/)
  );
}

// 等待页面加载完成
function waitForPageLoad(callback, timeout = 10000) {
  if (document.readyState === "complete") {
    callback();
    return;
  }

  const startTime = Date.now();
  const check = () => {
    if (document.readyState === "complete") {
      callback();
    } else if (Date.now() - startTime > timeout) {
      console.error("[小红书提取器] 页面加载超时");
      callback();
    } else {
      requestAnimationFrame(check);
    }
  };
  check();
}

// 提取标签
function extractTags(content) {
  if (!content) return [];
  const tagMatches = content.match(/#\S+/g) || [];
  return tagMatches.map(function (tag) {
    return tag.replace("#", "").trim();
  });
}

// 从多个来源尝试获取笔记数据
async function getNoteData() {
  console.log("[小红书提取器] 开始获取笔记数据");

  // 等待一下，确保数据加载
  await new Promise(function (resolve) {
    setTimeout(resolve, 2000);
  });

  // 调试：输出所有可能的 window 属性
  const allKeys = Object.keys(window).filter(function (k) {
    return k.startsWith("__") && k.endsWith("__");
  });
  if (allKeys.length > 0) {
    console.log("[小红书提取器] 所有 __ 属性:", allKeys);
  }

  let note = null;
  let noteId = null;

  // 方法 1: 从 __INITIAL_STATE__ 获取
  try {
    const state = window.__INITIAL_STATE__;
    if (state && state.note && state.note.noteDetailMap) {
      noteId = Object.keys(state.note.noteDetailMap)[0];
      note = state.note.note.noteDetailMap[noteId]?.note;
      console.log(
        "[小红书提取器] 方法 1 (__INITIAL_STATE__):",
        note ? "成功，noteId=" + noteId : "失败",
      );
    }
  } catch (e) {
    console.log("[小红书提取器] 方法 1 失败:", e);
  }

  // 方法 2: 尝试从 HTML script 标签解析 (与 xiaohongshu-importer 相同的方法)
  if (!note) {
    try {
      const scripts = document.querySelectorAll("script");
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        const content = script.textContent;
        if (content && content.includes("__INITIAL_STATE__")) {
          // 使用与 xiaohongshu-importer 相同的正则表达式
          const match = content.match(
            /window\.__INITIAL_STATE__=(.*?)<\/script>/s,
          );
          if (match) {
            try {
              // 与 xiaohongshu-importer 相同：替换 undefined 为 null
              const jsonStr = match[1].trim();
              const cleanedJson = jsonStr.replace(/undefined/g, "null");
              const state = JSON.parse(cleanedJson);
              if (state && state.note && state.note.noteDetailMap) {
                noteId = Object.keys(state.note.noteDetailMap)[0];
                note = state.note.noteDetailMap[noteId]?.note;
                console.log(
                  "[小红书提取器] 方法 2 (HTML script):",
                  note ? "成功，noteId=" + noteId : "失败",
                );
                break;
              }
            } catch (parseErr) {
              console.log("[小红书提取器] 方法 2 JSON 解析失败:", parseErr);
            }
          }
        }
      }
    } catch (e) {
      console.log("[小红书提取器] 方法 2 失败:", e);
    }
  }

  // 方法 3: 尝试从 DOM 直接提取
  if (!note) {
    try {
      // 从标题获取
      const title = document.title.replace(/ - 小红书.*/, "").trim();

      // 尝试从页面元素获取内容
      const contentElement = document.querySelector(
        '.desc, [class*="desc"], [class*="content"]',
      );
      var content = contentElement ? contentElement.textContent : "";

      // 尝试获取图片 - 从多个可能的来源
      const images = [];
      const imgSelectors = [
        'img[src*="sns-avatar"]',
        'img[src*="xhslink"]',
        'img[class*="lazy"]',
        ".carousel-container img",
        ".swiper-slide img",
      ];

      for (let s = 0; s < imgSelectors.length; s++) {
        const elements = document.querySelectorAll(imgSelectors[s]);
        for (let i = 0; i < elements.length; i++) {
          const img = elements[i];
          var src =
            img.src ||
            img.getAttribute("data-src") ||
            img.getAttribute("data-original-src");
          if (
            src &&
            src.startsWith("http") &&
            !src.includes("avatar") &&
            !src.includes("xhslink-avatar")
          ) {
            images.push(src);
          }
        }
      }

      // 去重
      if (images.length === 0) {
        // 备用：从页面查找所有带图片的元素
        const allImgs = document.querySelectorAll(
          'img[src*="xhslink.com/"], img[src*="sns-avatar"]',
        );
        for (let i = 0; i < allImgs.length && images.length < 9; i++) {
          var src = allImgs[i].src;
          if (src && !src.includes("avatar")) {
            images.push(src);
          }
        }
      }

      note = {
        title: title,
        desc: content.substring(0, 5000),
        imageList: images.slice(0, 9).map(function (url) {
          return { urlDefault: url };
        }),
        type: "normal",
      };

      console.log("[小红书提取器] 方法 3 (DOM):", note ? "成功" : "失败");
    } catch (e) {
      console.log("[小红书提取器] 方法 3 失败:", e);
    }
  }

  // 如果所有方法都失败，返回 null
  if (!note) {
    console.error("[小红书提取器] 所有方法都未能获取到笔记数据");
    return null;
  }

  return {
    note: note,
    noteId: noteId,
  };
}

// 提取笔记数据
async function extractNoteData() {
  console.log("[小红书提取器] 开始提取数据");

  try {
    const result = await getNoteData();

    if (!result.note) {
      console.error("[小红书提取器] 所有方法都未能获取到笔记数据");
      return null;
    }

    const note = result.note;
    const noteId = result.noteId;

    // 提取图片
    const images = (note.imageList || [])
      .map(function (img) {
        return img.urlDefault || img.url || "";
      })
      .filter(function (url) {
        return url && url.startsWith("http");
      });

    // 提取视频
    var videoUrl = null;
    if (note.video && note.video.media && note.video.media.stream) {
      var h264 = note.video.media.stream.h264;
      var h265 = note.video.media.stream.h265;
      if (h264 && h264.length > 0) {
        videoUrl = h264[0].masterUrl || null;
      } else if (h265 && h265.length > 0) {
        videoUrl = h265[0].masterUrl || null;
      }
    }

    // 提取内容
    const content = note.desc || "";
    const tags = extractTags(content);

    const noteData = {
      title:
        document.title.replace(/ - 小红书.*/, "").trim() ||
        note.title ||
        "未命名笔记",
      content: content,
      desc: content,
      images: images,
      videoUrl: videoUrl,
      tags: tags,
      isVideo: note.type === "video",
      source: window.location.href,
      noteId: noteId,
      author: {
        nickname: note.user && note.user.nickname ? note.user.nickname : "",
        userId: note.user && note.user.userId ? note.user.userId : "",
      },
      collected: note.collected || false,
      liked: note.liked || false,
    };

    console.log(
      "[小红书提取器] 数据提取成功:",
      noteData.title,
      "noteId=" + noteId,
    );
    return noteData;
  } catch (error) {
    console.error("[小红书提取器] 提取数据失败:", error);
    return null;
  }
}

// 生成 Markdown
function generateMarkdown(note) {
  const date = new Date().toISOString().split("T")[0];
  const importedAt = new Date().toLocaleString();

  var markdown =
    "---\n" +
    "title: " +
    note.title +
    "\n" +
    "source: " +
    note.source +
    "\n" +
    "date: " +
    date +
    "\n" +
    "Imported At: " +
    importedAt +
    "\n" +
    "tags: " +
    note.tags.join(", ") +
    "\n" +
    "---\n\n" +
    "# " +
    note.title +
    "\n\n";

  // 处理视频笔记
  if (note.isVideo) {
    if (note.videoUrl) {
      markdown +=
        '<video controls src="' + note.videoUrl + '" width="100%"></video>\n\n';
    } else if (note.images.length > 0) {
      markdown +=
        "[![封面图片](" + note.images[0] + ")](" + note.source + ")\n\n";
    }

    var cleanContent = note.content.replace(/#\S+/g, "").trim();
    markdown += cleanContent.split("\n").join("\n") + "\n\n";

    if (note.tags.length > 0) {
      markdown += "```\n";
      markdown +=
        note.tags
          .map(function (tag) {
            return "#" + tag;
          })
          .join(" ") + "\n";
      markdown += "```\n";
    }
  }
  // 处理非视频笔记
  else {
    if (note.images.length > 0) {
      markdown += "![封面图片](" + note.images[0] + ")\n\n";
    }

    cleanContent = note.content
      .replace(/#[^#\s]*(?:\s+#[^#\s]*)*\s*/g, "")
      .trim();
    markdown += cleanContent.split("\n").join("\n") + "\n\n";

    if (note.tags.length > 0) {
      markdown += "```\n";
      markdown +=
        note.tags
          .map(function (tag) {
            return "#" + tag;
          })
          .join(" ") + "\n";
      markdown += "```\n\n";
    }

    if (note.images.length > 0) {
      var imageMarkdown = note.images
        .map(function (url) {
          return "![图片](" + url + ")";
        })
        .join("\n");
      markdown += imageMarkdown + "\n";
    }
  }

  return markdown;
}

// 通知 background 和 popup
function notifyExtracted(data) {
  // 通知 background
  chrome.runtime
    .sendMessage({
      type: "NOTE_EXTRACTED",
      data: data,
    })
    .catch(function (err) {
      console.error("[小红书提取器] 发送消息失败:", err);
    });

  // 通知 Web 应用（如果打开了）
  try {
    window.postMessage(
      {
        type: "XHS_NOTE_EXTRACTED",
        data: data,
      },
      "*",
    );
  } catch (err) {
    console.error("[小红书提取器] postMessage 失败:", err);
  }
}

// 主初始化函数
async function init() {
  if (!isNotePage()) {
    console.log("[小红书提取器] 当前不是笔记页面");
    return;
  }

  console.log("[小红书提取器] 检测到笔记页面，等待加载完成...");

  waitForPageLoad(async function () {
    // 等待更长时间确保页面完全加载
    await new Promise(function (resolve) {
      setTimeout(resolve, 3000);
    });

    const data = await extractNoteData();
    if (data) {
      const markdown = generateMarkdown(data);
      var result = {
        title: data.title,
        content: data.content,
        desc: data.desc,
        images: data.images,
        videoUrl: data.videoUrl,
        tags: data.tags,
        isVideo: data.isVideo,
        source: data.source,
        markdown: markdown,
      };
      notifyExtracted(result);
    }
  });
}

// 构建笔记响应数据
function buildNoteResponse(data) {
  var markdown = generateMarkdown(data);
  return {
    success: true,
    data: {
      title: data.title,
      content: data.content,
      desc: data.desc,
      images: data.images,
      videoUrl: data.videoUrl,
      tags: data.tags,
      isVideo: data.isVideo,
      source: data.source,
      markdown: markdown,
    },
  };
}

// 监听来自 popup/background 的消息
// 注意：不能使用 async function，否则 Chrome 无法正确保持消息通道
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("[小红书提取器] 收到消息:", message);

  if (message.type === "EXTRACT_NOTE") {
    // 使用 .then() 代替 await，确保同步返回 true
    extractNoteData().then(function (data) {
      if (data) {
        sendResponse(buildNoteResponse(data));
      } else {
        sendResponse({
          success: false,
          error: "无法提取笔记数据，请刷新页面重试",
        });
      }
    });
    return true; // 同步返回 true，保持消息通道开放
  }

  if (message.type === "CHECK_PAGE") {
    sendResponse({
      isNotePage: isNotePage(),
    });
    return true;
  }

  if (message.type === "SEND_TO_WEB_APP") {
    extractNoteData().then(function (data) {
      if (data) {
        var response = buildNoteResponse(data);
        window.postMessage(
          { type: "XHS_NOTE_EXTRACTED", data: response.data },
          "*",
        );
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "无法提取数据" });
      }
    });
    return true;
  }
});

// 页面加载时初始化
init();

// 监听 URL 变化（SPA）
var lastUrl = location.href;
new MutationObserver(function () {
  var url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log("[小红书提取器] URL 变化:", url);
    init();
  }
}).observe(document.body, { subtree: true, childList: true });
