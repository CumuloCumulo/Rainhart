# 小红书提取器 - 浏览器插件

一个 Chrome/Edge 浏览器插件，用于直接在小红书页面提取内容并转换为 Markdown 格式。

## 功能特点

- 🚀 **直接提取** - 在小红书页面一键提取内容，无需跳转
- 🔒 **自动登录** - 自动使用已登录状态，无需手动复制 Cookie
- 🎯 **避免反爬** - 在真实浏览器环境中运行，完全避免反爬虫检测
- 📋 **一键复制** - 快速复制 Markdown 到剪贴板
- 💾 **文件下载** - 下载 .md 文件到本地
- 🔗 **Web 应用集成** - 一键发送数据到 Web 应用

## 安装方法

### 方法 1：开发者模式安装（推荐）

1. 运行构建脚本：
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. 打开浏览器扩展页面：
   - Chrome/Edge: 在地址栏输入 `chrome://extensions`

3. 开启右上角的「开发者模式」

4. 点击「加载已解压的扩展程序」，选择 `extension/dist` 文件夹

5. 插件安装完成！

### 方法 2：从 Web 应用下载

访问 Web 应用的 `/extension` 页面，下载预打包的插件文件。

## 使用方法

### 在小红书页面直接提取

1. 访问任意小红书笔记页面
2. 点击浏览器工具栏中的插件图标
3. 查看提取预览，选择操作：
   - **复制 Markdown** - 复制到剪贴板
   - **下载文件** - 下载 .md 文件
   - **发送到 Web 应用** - 发送到已打开的 Web 应用

### 从 Web 应用启动

1. 打开 Web 应用首页
2. 点击「打开小红书」按钮
3. 在新打开的小红书页面点击插件图标
4. 点击「发送到 Web 应用」
5. 数据自动填充到 Web 应用中

## 文件结构

```
extension/
├── manifest.json              # 插件配置
├── background/
│   └── service-worker.js    # 后台服务
├── content/
│   └── script.js            # 内容脚本（注入小红书页面）
├── popup/
│   ├── popup.html           # 弹窗页面
│   ├── popup.js             # 弹窗逻辑
│   └── popup.css            # 弹窗样式
├── build.js                # 构建脚本
├── package.json            # 依赖配置
└── dist/                   # 构建输出目录
```

## 开发

### 构建

```bash
cd extension
npm run build
```

### 重新加载插件

修改代码后，在 `chrome://extensions` 页面点击插件的「重新加载」按钮。

## 技术实现

### Content Script
- 注入到 `xiaohongshu.com` 页面
- 从 `window.__INITIAL_STATE__` 提取笔记数据
- 生成 Markdown 格式

### Background Service Worker
- 处理跨域请求
- 管理插件状态
- 与 Web 应用通信

### Popup
- 显示提取预览
- 提供操作按钮
- 检测 Web 应用状态

### Web 应用集成
- 通过 `window.postMessage` 接收数据
- 自动填充提取的内容
- 支持后续 AI 优化等操作

## 隐私说明

- 插件仅在小红书页面运行
- 不收集任何用户数据
- 所有处理均在本地完成
- 可随时卸载

## 故障排除

### 插件无法提取内容

1. 确认是否在小红书笔记页面（包含 `/discovery/item/` 或 `/explore/`）
2. 刷新页面后重试
3. 检查浏览器控制台是否有错误

### 无法发送到 Web 应用

1. 确保 Web 应用已在另一个标签页打开
2. 刷新插件弹窗后重试

### 图标不显示

- 图标为占位符，不影响功能使用

## License

MIT
