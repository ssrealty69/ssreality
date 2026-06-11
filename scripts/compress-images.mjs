/**
 * Image compression script using Sharp
 * Converts large PNGs to optimized WebP and compressed JPEGs
 * Run: node scripts/compress-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

// Image directories to process
const DIRS_TO_PROCESS = [
  'Farm House',
  'World Class Amenities',
  'Project Amenities',
];

// Compression settings
const PNG_TO_WEBP_QUALITY = 75;
const JPEG_TO_WEBP_QUALITY = 78;
const MAX_WIDTH = 1920; // Limit max width to reduce file sizes

async function processImage(filePath, fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  
  if (!['png', 'jpg', 'jpeg'].includes(ext)) return;

  try {
    const inputStat = await stat(filePath);
    const inputSizeMB = (inputStat.size / 1024 / 1024).toFixed(2);

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // For PNGs larger than 1MB, create WebP version
    if (ext === 'png' && inputStat.size > 1 * 1024 * 1024) {
      const webpPath = filePath.replace(/\.png$/i, '.webp');
      
      // Resize if wider than MAX_WIDTH
      let pipeline = image;
      if (metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }
      
      await pipeline
        .webp({ quality: PNG_TO_WEBP_QUALITY, effort: 4 })
        .toFile(webpPath);

      const outputStat = await stat(webpPath);
      const outputSizeMB = (outputStat.size / 1024 / 1024).toFixed(2);
      const savings = (((inputStat.size - outputStat.size) / inputStat.size) * 100).toFixed(0);
      
      console.log(`✅ ${fileName}: ${inputSizeMB}MB → ${outputSizeMB}MB WebP (${savings}% saved)`);
    }
    
    // For large JPEGs, create optimized WebP 
    if ((ext === 'jpg' || ext === 'jpeg') && inputStat.size > 200 * 1024) {
      const webpPath = filePath.replace(/\.(jpg|jpeg)$/i, '.webp');
      
      let pipeline = image;
      if (metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }

      await pipeline
        .webp({ quality: JPEG_TO_WEBP_QUALITY, effort: 4 })
        .toFile(webpPath);

      const outputStat = await stat(webpPath);
      const outputSizeMB = (outputStat.size / 1024 / 1024).toFixed(2);
      const savings = (((inputStat.size - outputStat.size) / inputStat.size) * 100).toFixed(0);
      
      console.log(`✅ ${fileName}: ${(inputStat.size/1024).toFixed(0)}KB → ${(outputStat.size/1024).toFixed(0)}KB WebP (${savings}% saved)`);
    }

  } catch (err) {
    console.error(`❌ Error processing ${fileName}:`, err.message);
  }
}

async function processDirectory(dirPath) {
  let files;
  try {
    files = await readdir(dirPath);
  } catch (err) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  console.log(`\n📁 Processing: ${dirPath}`);
  for (const file of files) {
    const filePath = join(dirPath, file);
    await processImage(filePath, file);
  }
}

// Check if sharp is available
async function checkSharp() {
  try {
    await import('sharp');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const hasSharp = await checkSharp();
  if (!hasSharp) {
    console.error('❌ Sharp is not installed. Run: npm install --save-dev sharp');
    process.exit(1);
  }

  console.log('🖼️  SS Realty Image Compressor\n');
  console.log('Converting large PNGs to WebP format...\n');

  for (const dir of DIRS_TO_PROCESS) {
    const dirPath = join(PUBLIC_DIR, dir);
    await processDirectory(dirPath);
  }

  // Also process individual large files in root public dir
  console.log('\n📁 Processing root public directory...');
  const rootFiles = await readdir(PUBLIC_DIR);
  for (const file of rootFiles) {
    const filePath = join(PUBLIC_DIR, file);
    const fileStat = await stat(filePath);
    if (!fileStat.isDirectory()) {
      await processImage(filePath, file);
    }
  }

  console.log('\n✨ Done! All images processed.');
  console.log('💡 Update your components to use .webp paths for maximum performance.');
}

main().catch(console.error);
