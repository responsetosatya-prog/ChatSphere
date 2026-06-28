// frontend/copy-redirects.js
import ncp from 'ncp';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const copy = promisify(ncp);

const source = path.join(__dirname, 'public', '_redirects');
const dest = path.join(__dirname, 'dist', '_redirects');

// Ensure dist directory exists
if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
}

try {
    await copy(source, dest);
    console.log('✅ _redirects copied to dist/');
} catch (err) {
    console.error('❌ Error copying _redirects:', err);
    process.exit(1);
}
