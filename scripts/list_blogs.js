/* Fetch all blogs - show title, slug, status, publishDate */
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

MongoClient.connect(uri).then(async (client) => {
  const db = client.db('SSRealty');
  const blogs = await db.collection('blogs').find({}).project({ title:1, slug:1, status:1, publishDate:1 }).sort({ createdAt: 1 }).toArray();
  console.log('\n=== ALL BLOGS ===\n');
  blogs.forEach((b, i) => {
    console.log(`${i+1}. [${(b.status||'').toUpperCase()}] ${b.title}`);
    console.log(`   slug: ${b.slug}`);
    if (b.publishDate) console.log(`   publishDate: ${b.publishDate}`);
    console.log('');
  });
  console.log(`Total: ${blogs.length} blogs`);
  client.close();
}).catch(e => console.error(e.message));
