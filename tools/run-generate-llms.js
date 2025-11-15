// Cross-platform wrapper to run optional tools/generate-llms.js if present.
// This prevents shell operator relying (|| true) which fails on Windows PowerShell.

const path = require('path');
const fs = require('fs');

const target = path.join(__dirname, 'generate-llms.js');

(async () => {
  if (!fs.existsSync(target)) {
    console.log('Optional generator not found, skipping:', target);
    process.exit(0);
  }

  try {
    console.log('Running optional generator:', target);
    // Use dynamic import to support both ESM/CJS
    const mod = require(target);
    if (typeof mod === 'function') {
      await mod();
    }
    process.exit(0);
  } catch (err) {
    console.warn('Generator threw an error; continuing build. Error:', err && err.message);
    process.exit(0);
  }
})();
