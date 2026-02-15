// Create zip file for the extension

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

console.log('Creating extension zip file...');

const distDir = path.join(__dirname, 'dist');
const zipPath = path.join(__dirname, '..', 'public', 'extension.zip');

if (!fs.existsSync(distDir)) {
  console.error('Build directory not found. Please run: npm run build');
  process.exit(1);
}

// Create zip
const zip = new AdmZip();
zip.addLocalFolder(distDir);
zip.writeZip(zipPath);

console.log(`Zip file created: ${zipPath}`);
console.log('File size:', fs.statSync(zipPath).size, 'bytes');
