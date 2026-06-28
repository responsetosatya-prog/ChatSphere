// frontend/copy-redirects.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'public', '_redirects');
const destDir = path.join(__dirname, 'dist');
const dest = path.join(destDir, '_redirects');

// Log paths for debugging
console.log('📁 Source:', source);
console.log('📁 Destination:', dest);

// Check if source exists
if (!fs.existsSync(source)) {
    console.error('❌ Source _redirects not found at:', source);
    process.exit(1);
}

// Create dist directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    console.log('📁 Creating dist directory...');
    fs.mkdirSync(destDir, { recursive: true });
}

// Copy the file
try {
    fs.copyFileSync(source, dest);
    console.log('✅ _redirects copied to dist/');
    
    // Verify it was copied
    if (fs.existsSync(dest)) {
        const content = fs.readFileSync(dest, 'utf8');
        console.log('✅ _redirects content:', content.trim());
    }
} catch (err) {
    console.error('❌ Error copying _redirects:', err);
    process.exit(1);
}
