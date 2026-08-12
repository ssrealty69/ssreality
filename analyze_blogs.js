const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const blogs = await db.collection('blogs').find({}).toArray();
  const sortedByViews = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0));
  
  console.log('TOP 15 BLOGS BY VIEWS:');
  sortedByViews.slice(0, 15).forEach((blog, i) => {
    console.log(`${i+1}. VIEWS:${blog.views||0} | ${blog.title}`);
    console.log(`   slug:${blog.slug}`);
    console.log(`   category:${blog.category} | tags:${(blog.tags||[]).join(', ')}`);
    console.log(`   property:${blog.linkedPropertyName||'None'}`);
    console.log(`   focusKw:${blog.seo?.focusKeyword||'None'}`);
    console.log('');
  });

  // Fetch enquiries to see blog source 
  const enquiries = await db.collection('propertyenquiries').find({}).toArray();
  console.log(`\nTotal Enquiries: ${enquiries.length}`);
  
  // Show recent 20 enquiries with source
  console.log('\nRecent Enquiries (with source):');
  [...enquiries].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)).slice(0,30).forEach(e => {
    console.log(`  Phone:${e.phone} | Property:${e.propertyTitle} | Source:${e.source||'none'} | Brochure:${e.isBrochureDownload} | Date:${new Date(e.createdAt).toLocaleDateString('en-IN')}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
