/* eslint-disable */
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

MongoClient.connect(uri).then(async (client) => {
  const db = client.db('SSRealty');
  const slugs = ['orchid', 'nivasa-iii', 'amaryllis', 'the-arch'];
  
  for (const slug of slugs) {
    const prop = await db.collection('properties').findOne({ slug });
    if (prop) {
      console.log(`\n=== ${prop.name || slug} ===`);
      console.log('images:', JSON.stringify(prop.images?.slice(0, 3)));
      console.log('mobileBannerUrl:', prop.mobileBannerUrl);
      console.log('highlightsImageUrl:', prop.highlightsImageUrl);
    } else {
      console.log(`\n=== ${slug} === NOT FOUND IN properties`);
      // try by name
      const byName = await db.collection('properties').findOne({ name: { $regex: slug, $options: 'i' } });
      if (byName) {
        console.log('Found by name match:', byName.name);
        console.log('images:', JSON.stringify(byName.images?.slice(0, 3)));
      }
    }
  }

  // Also check delivered landmarks for Nivasa
  console.log('\n=== Delivered Landmarks (Nivasa) ===');
  const delivered = await db.collection('deliveredlandmarks').find({}).toArray();
  for (const d of delivered) {
    console.log(`- ${d.name}: images=${JSON.stringify(d.images?.slice(0,2))}, image=${d.image}`);
  }

  client.close();
}).catch(e => console.error('Error:', e.message));
