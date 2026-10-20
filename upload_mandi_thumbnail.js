const fs = require('fs');
const mongoose = require('mongoose');

// ── Load env from .env.local ──────────────────────────────────────────────
function getEnv(key) {
  if (process.env[key]) return process.env[key];
  if (fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(key + '=')) {
        return trimmed.slice(key.length + 1).replace(/^["']|["']$/g, '').trim();
      }
    }
  }
  return undefined;
}

const MONGODB_URI        = getEnv('MONGODB_URI');
const CLOUD_NAME         = getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = getEnv('CLOUDINARY_API_KEY');
const CLOUDINARY_SECRET  = getEnv('CLOUDINARY_API_SECRET');

if (!MONGODB_URI || !CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_SECRET) {
  console.error('Missing env vars. Check .env.local for MONGODB_URI, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

// ── Cloudinary upload via REST API (no SDK needed) ────────────────────────
const https  = require('https');
const http   = require('http');
const crypto = require('crypto');
const path   = require('path');

function cloudinarySign(params, secret) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + secret;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(imagePath) {
  const { default: FormData } = await import('form-data');
  const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

  const timestamp = Math.floor(Date.now() / 1000);
  const folder    = 'ss-realty/blog';
  const toSign    = { folder, timestamp };
  const signature = cloudinarySign(toSign, CLOUDINARY_SECRET);

  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('api_key', CLOUDINARY_API_KEY);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const res  = await fetch(url, { method: 'POST', body: form });
  const json = await res.json();
  if (!json.secure_url) throw new Error(JSON.stringify(json));
  return json.secure_url;
}

// ── Main ──────────────────────────────────────────────────────────────────
const IMAGE_PATH = process.argv[2];
const SLUG       = 'why-invest-in-mandi-gurgaon-real-estate-guide';

async function main() {
  if (!IMAGE_PATH || !fs.existsSync(IMAGE_PATH)) {
    console.error('Usage: node upload_mandi_thumbnail.js <path-to-image>');
    process.exit(1);
  }

  console.log('Uploading thumbnail to Cloudinary...');
  const imageUrl = await uploadToCloudinary(IMAGE_PATH);
  console.log('Uploaded URL:', imageUrl);

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const result = await db.collection('blogs').updateOne(
    { slug: SLUG },
    { $set: { coverImage: imageUrl, image: imageUrl, updatedAt: new Date() } }
  );

  if (result.modifiedCount === 1) {
    console.log('Blog thumbnail updated in MongoDB!');
    console.log('New thumbnail:', imageUrl);
    console.log('Live blog: https://ssrealty.org/blog/' + SLUG);
  } else {
    console.error('Blog not found in MongoDB! Check slug:', SLUG);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(console.error);
