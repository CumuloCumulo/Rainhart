// Create plugin icons from SVG

const fs = require('fs');
const path = require('path');

// Simple SVG icon
const svgIcon = `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#EF4444"/>
  <path d="M36 40C36 35.5817 39.5817 32 44 32H84C88.4183 32 92 35.5817 92 40V56H36V40Z" fill="white"/>
  <rect x="36" y="64" width="56" height="8" rx="4" fill="white"/>
  <rect x="36" y="80" width="40" height="8" rx="4" fill="white"/>
  <rect x="36" y="96" width="48" height="8" rx="4" fill="white"/>
  <circle cx="96" cy="88" r="16" fill="#10B981"/>
  <path d="M96 80L102 86H96V80Z" fill="white"/>
  <path d="M90 88L96 94L106 82" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Active version (green checkmark)
const svgIconActive = `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#10B981"/>
  <path d="M36 40C36 35.5817 39.5817 32 44 32H84C88.4183 32 92 35.5817 92 40V56H36V40Z" fill="white"/>
  <rect x="36" y="64" width="56" height="8" rx="4" fill="white"/>
  <rect x="36" y="80" width="40" height="8" rx="4" fill="white"/>
  <rect x="36" y="96" width="48" height="8" rx="4" fill="white"/>
  <circle cx="96" cy="88" r="16" fill="#10B981"/>
  <path d="M96 80L102 86H96V80Z" fill="white"/>
  <path d="M90 88L96 94L106 82" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Create PNG using canvas (Node.js)
const { createCanvas } = require('canvas');

function createIcon(svg, size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Simple gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#EF4444');
  gradient.addColorStop(1, '#F97316');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.1875);
  ctx.fill();

  // Draw simple document shape
  const padding = size * 0.28;
  const docWidth = size * 0.44;
  const docHeight = size * 0.19;
  const radius = size * 0.03;

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.roundRect(padding, padding, docWidth, docHeight, radius);
  ctx.fill();

  // Draw lines
  ctx.fillStyle = 'white';
  const lineHeight = size * 0.06;
  const lineGap = size * 0.125;
  const lineWidth = size * 0.44;

  ctx.beginPath();
  ctx.roundRect(padding, padding + docHeight + lineGap, lineWidth, lineHeight, radius);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(padding, padding + docHeight + lineGap * 2, lineWidth * 0.71, lineHeight, radius);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(padding, padding + docHeight + lineGap * 3, lineWidth * 0.86, lineHeight, radius);
  ctx.fill();

  // Export as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

// Create active icon (green)
function createActiveIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Green gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#10B981');
  gradient.addColorStop(1, '#059669');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.1875);
  ctx.fill();

  // Draw checkmark
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.05;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(size * 0.375, size * 0.5);
  ctx.lineTo(size * 0.46875, size * 0.59375);
  ctx.lineTo(size * 0.6875, size * 0.375);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

const sizes = [16, 48, 128];

// Create regular icons
sizes.forEach(size => {
  createIcon(null, size, `icon${size}.png`);
});

// Create active icons
sizes.forEach(size => {
  createActiveIcon(size, `icon${size}-active.png`);
});

console.log('All icons created!');
