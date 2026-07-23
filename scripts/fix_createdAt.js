const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('SSRealty');
  const blogs = db.collection('blogs');

  const today = new Date('2026-07-18T09:13:00.000Z'); // 18 July 2026 14:43 IST

  const result = await blogs.updateOne(
    { slug: 'flat-for-sale-in-chattarpur-under-1-crore-3bhk-ready-to-move' },
    {
      $set: {
        createdAt: today,
        publishDate: new Date('2026-07-18T04:30:00.000Z'),
      }
    }
  );

  console.log('Modified:', result.modifiedCount);

  // Verify
  const blog = await blogs.findOne(
    { slug: 'flat-for-sale-in-chattarpur-under-1-crore-3bhk-ready-to-move' },
    { projection: { title: 1, createdAt: 1, publishDate: 1, status: 1, published: 1 } }
  );
  console.log('\nVerification:');
  console.log('  Title:', blog.title.substring(0, 55));
  console.log('  createdAt:', blog.createdAt);
  console.log('  publishDate:', blog.publishDate);
  console.log('  status:', blog.status, '| published:', blog.published);

  await client.close();
}

main().catch(console.error);
