const http = require('http');
const fs = require('fs');
const path = require('path');

// Read ADMIN_SECRET from .env.local
let adminSecret = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const match = envContent.match(/^ADMIN_SECRET=(.+)$/m);
  if (match) adminSecret = match[1].trim();
} catch(e) {}

// Step 1: Fetch the blog by slug
function fetchBlog(slug, callback) {
  const opts = {
    hostname: 'localhost', port: 3000,
    path: `/api/blog/${slug}`, method: 'GET',
    headers: { 'x-admin-secret': adminSecret }
  };
  const r = http.request(opts, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try { callback(null, JSON.parse(d)); }
      catch(e) { callback(e); }
    });
  });
  r.on('error', callback);
  r.end();
}

// Step 2: Update blog by ID
function updateBlog(id, updateData, callback) {
  const body = JSON.stringify(updateData);
  const opts = {
    hostname: 'localhost', port: 3000,
    path: `/api/admin/blogs/${id}`, method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'x-admin-secret': adminSecret
    }
  };
  const r = http.request(opts, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try { callback(null, JSON.parse(d)); }
      catch(e) { callback(e, d); }
    });
  });
  r.on('error', callback);
  r.write(body);
  r.end();
}

function removeEmojis(str) {
  // Remove emoji characters - comprehensive unicode ranges
  return str
    // Standard emoji ranges
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{2300}-\u{23FF}]/gu, '')
    .replace(/[\u{2B00}-\u{2BFF}]/gu, '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
    // Specifically used in this blog
    .replace(/✅/g, '')
    .replace(/🚩/g, '')
    .replace(/🔍/g, '')
    .replace(/📋/g, '')
    .replace(/🏗️/g, '')
    .replace(/👷/g, '')
    .replace(/📞/g, '')
    .replace(/📍/g, '')
    .replace(/⭐/g, '')
    .replace(/💡/g, '')
    .replace(/🏠/g, '')
    .replace(/🏢/g, '')
    // Clean up extra spaces left after emoji removal
    .replace(/ {2,}/g, ' ')
    .replace(/\n {2,}/g, '\n')
    // Clean leading spaces/bullets that look odd without emoji
    .replace(/<li>\s+<strong>/g, '<li><strong>')
    .replace(/<li>\s+/g, '<li>');
}

console.log('Fetching blog...');
fetchBlog('construction-quality-check-buying-flat-apartment-property-delhi-ncr', (err, data) => {
  if (err) { console.log('Fetch error:', err); return; }
  
  const blog = data.data || data;
  if (!blog || !blog._id) {
    console.log('Blog not found. Response:', JSON.stringify(data).substring(0, 300));
    return;
  }
  
  console.log('Found blog:', blog.title);
  console.log('Blog ID:', blog._id);
  
  // Update title: 2025 -> 2026
  const newTitle = blog.title.replace(/2025/g, '2026');
  
  // Update slug
  const newSlug = blog.slug.replace(/2025/g, '2026');
  
  // Update SEO title
  const newSeoTitle = (blog.seo?.title || '').replace(/2025/g, '2026');
  
  // Remove all emojis from content
  const cleanContent = removeEmojis(blog.content);
  
  // Also update excerpt if it has year
  const newExcerpt = blog.excerpt.replace(/2025/g, '2026');
  
  const updateData = {
    title: newTitle,
    slug: newSlug,
    excerpt: newExcerpt,
    content: cleanContent,
    seo: {
      ...(blog.seo || {}),
      title: newSeoTitle,
    }
  };
  
  console.log('New title:', newTitle);
  console.log('Removing emojis from content...');
  
  updateBlog(blog._id, updateData, (err2, result) => {
    if (err2) { console.log('Update error:', err2); return; }
    if (result.success) {
      console.log('Blog updated successfully!');
      console.log('New slug:', result.data?.slug || newSlug);
    } else {
      console.log('Update failed:', JSON.stringify(result).substring(0, 300));
    }
  });
});
