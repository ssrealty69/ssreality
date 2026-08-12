const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const props = await db.collection('properties').find({}).project({ _id: 1, title: 1, name: 1, slug: 1, coverImage: 1 }).toArray();
  props.forEach(p => console.log(`ID: ${p._id} | Title: ${p.title || p.name} | Slug: ${p.slug}`));
  
  // Also get existing blog cover images for reference
  const blogs = await db.collection('blogs').find({}).project({ title: 1, coverImage: 1 }).sort({ views: -1 }).limit(5).toArray();
  console.log('\nTop blog cover images:');
  blogs.forEach(b => console.log(`${b.title?.substring(0,50)}: ${b.coverImage}`));
  
  await mongoose.disconnect();
}
main().catch(console.error);
