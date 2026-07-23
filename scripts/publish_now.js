const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('SSRealty');
  const blogs = db.collection('blogs');

  const slug = 'flat-for-sale-in-chattarpur-under-1-crore-3bhk-ready-to-move';
  const blog = await blogs.findOne({ slug });

  if (!blog) {
    console.log('❌ Article NOT FOUND with slug:', slug);
    await client.close();
    return;
  }

  console.log('✅ Found article:', blog._id.toString());
  console.log('   Title:', blog.title);
  console.log('   Current Status:', blog.status);
  console.log('   Published:', blog.published);

  const result = await blogs.updateOne(
    { _id: blog._id },
    {
      $set: {
        status: 'published',
        published: true,
        publishedAt: new Date(),
        scheduledAt: null,
      }
    }
  );

  console.log('\n🚀 Updated:', result.modifiedCount, 'document(s)');
  console.log('✅ Article is now LIVE!');
  await client.close();
}

main().catch(console.error);
