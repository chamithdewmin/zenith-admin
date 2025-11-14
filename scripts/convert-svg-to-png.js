// convert-svg-to-png.js
// Usage: install sharp (`npm install sharp`) then run:
// node scripts/convert-svg-to-png.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, '..', 'src', 'assets', 'zenith-logotype.svg');
const outPng = path.join(__dirname, '..', 'src', 'assets', 'zenith-logotype.png');

(async () => {
  try {
    const svg = fs.readFileSync(svgPath, 'utf8');

    // Render at large size for high-resolution export
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .resize(3000, 800, { fit: 'contain' })
      .toFile(outPng);

    console.log('Created PNG:', outPng);
  } catch (err) {
    console.error('Error creating PNG:', err);
    process.exit(1);
  }
})();
