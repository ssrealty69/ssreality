const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('SSRealty');
  const blogs = db.collection('blogs');

  // List all scheduled blogs first
  const scheduled = await blogs.find({ status: 'scheduled' }).toArray();
  console.log(`\n📋 Scheduled blogs found: ${scheduled.length}\n`);
  scheduled.forEach((b, i) => {
    console.log(`${i + 1}. ${b.title?.substring(0, 60)}`);
    console.log(`   publishDate: ${b.publishDate || 'N/A'} | scheduledAt: ${b.scheduledAt || 'N/A'}`);
  });

  // Publish all scheduled blogs NOW
  const result = await blogs.updateMany(
    { status: 'scheduled' },
    {
      $set: {
        status: 'published',
        published: true,
        publishedAt: new Date(),
      }
    }
  );
  console.log(`\n✅ Published ${result.modifiedCount} scheduled blogs!`);

  // Also verify how many are now published
  const publishedCount = await blogs.countDocuments({ status: 'published', published: true });
  console.log(`✅ Total published blogs now: ${publishedCount}`);

  await client.close();
}

main().catch(console.error);
