const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('SSRealty');
  const blogs = db.collection('blogs');

  // Restore original publishDate for the 5 blogs that were scheduled
  const restoreMap = [
    {
      slug: 'how-to-buy-a-flat-in-delhi-complete-legal-loan-registration-guide',
      publishDate: new Date('2026-07-15T04:30:00.000Z'), // Wed Jul 15 2026 10:00 IST
      publishedAt: null,
    },
    {
      slug: 'first-time-home-buyer-guide-delhi-step-by-step-flat-purchase',
      publishDate: new Date('2026-07-13T04:30:00.000Z'), // Mon Jul 13 2026 10:00 IST
      publishedAt: null,
    },
    {
      slug: 'duplex-flat-in-delhi-guide-south-delhi-builder-floor',
      publishDate: new Date('2026-07-11T07:45:00.000Z'), // Sat Jul 11 2026 13:15 IST
      publishedAt: null,
    },
    {
      slug: 'new-residential-projects-in-chattarpur-delhi-ss-realty-complete-guide',
      publishDate: new Date('2026-07-12T05:12:00.000Z'), // Sun Jul 12 2026 10:42 IST
      publishedAt: null,
    },
    {
      slug: 'builder-floor-vs-apartment-delhi-south-delhi-buyers-guide',
      publishDate: new Date('2026-07-19T04:30:00.000Z'), // Sun Jul 19 2026 10:00 IST
      publishedAt: null,
    },
    {
      slug: 'flat-for-sale-in-chattarpur-under-1-crore-3bhk-ready-to-move',
      publishDate: new Date('2026-08-18T08:43:00.000Z'), // Tue Aug 18 2026 14:13 IST
      publishedAt: null,
    },
  ];

  for (const item of restoreMap) {
    const result = await blogs.updateOne(
      { slug: item.slug },
      {
        $set: { publishDate: item.publishDate },
        $unset: { publishedAt: '' }
      }
    );
    console.log(`✅ Restored: ${item.slug.substring(0, 50)} → ${item.publishDate.toDateString()} | modified: ${result.modifiedCount}`);
  }

  // For all OTHER published blogs that had null publishDate — restore to null
  const restoreSlugs = restoreMap.map(r => r.slug);
  const result = await blogs.updateMany(
    {
      status: 'published',
      slug: { $nin: restoreSlugs }
    },
    {
      $set: { publishDate: null },
      $unset: { publishedAt: '' }
    }
  );
  console.log(`\n✅ Restored ${result.modifiedCount} other blogs → publishDate: null (original)`);

  console.log('\n✅ All dates restored to original!');
  await client.close();
}

main().catch(console.error);
