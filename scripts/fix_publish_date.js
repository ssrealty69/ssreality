/**
 * One-time fix: sets publishDate = July 22, 2026 for the Chattarpur/Gwal Pahari article.
 * Run: node scripts/fix_publish_date.js
 */
const path = require('path');
const mongoose = require(path.join(__dirname, '..', 'node_modules', 'mongoose'));

const MONGODB_URI = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';
const SLUG = 'property-investment-south-delhi-chattarpur-gwal-pahari-best-locations';

// 22 July 2026, 17:11 IST = 11:41 UTC
const PUBLISH_DATE = new Date('2026-07-22T11:41:00.000Z');

const BlogSchema = new mongoose.Schema(
  { slug: String, publishDate: Date, status: String, published: Boolean },
  { timestamps: true }
);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  // Find the blog to confirm it exists
  const existing = await Blog.findOne({ slug: SLUG }).select('slug publishDate status createdAt');
  if (!existing) {
    console.error('Blog not found with slug:', SLUG);
    console.log('Listing all blog slugs...');
    const all = await Blog.find({}).select('slug');
    all.forEach(b => console.log(' -', b.slug));
    await mongoose.disconnect();
    return;
  }

  console.log('Found blog:');
  console.log('  slug       :', existing.slug);
  console.log('  publishDate:', existing.publishDate || 'NOT SET');
  console.log('  createdAt  :', existing.createdAt);
  console.log('  status     :', existing.status);

  const result = await Blog.updateOne(
    { slug: SLUG },
    { $set: { publishDate: PUBLISH_DATE } }
  );

  console.log('\nUpdate result:', JSON.stringify(result));

  const updated = await Blog.findOne({ slug: SLUG }).select('slug publishDate status');
  console.log('\nAfter update:');
  console.log('  publishDate:', updated.publishDate);

  await mongoose.disconnect();
  console.log('\nDone! Disconnected.');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
