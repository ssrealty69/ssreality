const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Update the blog with correct Amaryllis property ID and better cover image
  const result = await db.collection('blogs').updateOne(
    { slug: 'gwal-pahari-property-khareedne-ka-complete-guide-2026-legal-checklist-nbfc-loan-amaryllis-orchid-the-arch' },
    {
      $set: {
        linkedPropertyId: '6a267be020de1d93d18ae1b8',
        linkedPropertyName: 'AMARYLLIS',
        coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        updatedAt: new Date()
      }
    }
  );
  
  console.log('Updated:', result.modifiedCount, 'document');
  
  // Verify the blog
  const blog = await db.collection('blogs').findOne({ slug: 'gwal-pahari-property-khareedne-ka-complete-guide-2026-legal-checklist-nbfc-loan-amaryllis-orchid-the-arch' });
  console.log('\nVerification:');
  console.log('Title:', blog.title);
  console.log('Status:', blog.status);
  console.log('Published:', blog.published);
  console.log('Cover Image:', blog.coverImage);
  console.log('Linked Property:', blog.linkedPropertyName, '(', blog.linkedPropertyId, ')');
  console.log('Tags count:', blog.tags?.length);
  console.log('SEO Focus KW:', blog.seo?.focusKeyword);
  
  await mongoose.disconnect();
  console.log('\n✅ Done!');
}

main().catch(console.error);
