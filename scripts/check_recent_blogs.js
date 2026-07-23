const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('SSRealty');
  const blogs = db.collection('blogs');

  // Get TOP 10 latest blogs by createdAt
  const latest = await blogs
    .find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .project({ title: 1, status: 1, published: 1, createdAt: 1, publishedAt: 1, slug: 1 })
    .toArray();

  console.log('\n📋 Top 10 latest blogs by createdAt:\n');
  latest.forEach((b, i) => {
    console.log(`${i + 1}. ${b.title?.substring(0, 55)}`);
    console.log(`   slug: ${b.slug}`);
    console.log(`   status: ${b.status} | published: ${b.published}`);
    console.log(`   createdAt:   ${b.createdAt}`);
    console.log(`   publishedAt: ${b.publishedAt || 'N/A'}`);
    console.log('');
  });

  // Total count
  const total = await blogs.countDocuments({});
  console.log(`Total blogs in DB: ${total}`);

  await client.close();
}

main().catch(console.error);
