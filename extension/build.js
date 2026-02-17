// Build script for the extension

const fs = require("fs");
const path = require("path");

console.log("Building Xiaohongshu Extractor Extension...");

// Create build directory
const buildDir = path.join(__dirname, "dist");
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Files to copy
const files = [
  "manifest.json",
  "background/service-worker.js",
  "content/script.js",
  "popup/popup.html",
  "popup/popup.js",
  "popup/popup.css",
  "options/options.html",
  "options/options.js",
];

// Copy files
files.forEach((file) => {
  const src = path.join(__dirname, file);
  const dest = path.join(buildDir, file);
  const destDir = path.dirname(dest);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  } else {
    console.error(`Not found: ${file}`);
  }
});

// Check if icons exist (they should be created by create-icons.sh first)
const iconSizes = [16, 48, 128];
const allIconsExist = iconSizes.every(
  (size) =>
    fs.existsSync(path.join(buildDir, `icon${size}.png`)) &&
    fs.existsSync(path.join(buildDir, `icon${size}-active.png`)),
);

if (allIconsExist) {
  console.log("Icons already exist (created by create-icons.sh)");
} else {
  console.log('Warning: Icons not found. Run "npm run build:icons" first.');
}

// Generate zip for web download
const { execSync } = require("child_process");
const publicDir = path.join(__dirname, "..", "public");
const zipPath = path.join(publicDir, "extension.zip");

try {
  // Remove old zip if exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  execSync(`cd "${buildDir}" && zip -r "${zipPath}" . -x ".*"`, {
    stdio: "pipe",
  });
  console.log("\nGenerated: public/extension.zip");
} catch (e) {
  console.log("\nWarning: Could not generate zip file:", e.message);
}

console.log("\nBuild complete!");
console.log("Extension files are in: " + buildDir);
