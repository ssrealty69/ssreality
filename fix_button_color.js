const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const blog = await db.collection('blogs').findOne({ slug: 'gwal-pahari-property-khareedne-ka-complete-guide-2026-legal-checklist-nbfc-loan-amaryllis-orchid-the-arch' });
  if (!blog) {
    console.log('Blog not found!');
    await mongoose.disconnect();
    return;
  }

  let content = blog.content;

  // Replace colors in the buttons to be explicitly black and add !important to override tailwind inherit rules
  content = content.replace(
    /background:linear-gradient\(135deg,#C9A227,#E8C84A\);color:#1A1800;/g,
    'background:linear-gradient(135deg,#C9A227,#E8C84A);color:#000000 !important;'
  );

  content = content.replace(
    /background:linear-gradient\(135deg,#C9A227,#E8C84A\);color:#1A1800;font-weight:700;/g,
    'background:linear-gradient(135deg,#C9A227,#E8C84A);color:#000000 !important;font-weight:700;'
  );

  // Let's also check other buttons in case they were formatted differently
  // Example: style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#C9A227,#E8C84A);color:#1A1800;font-weight:700;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:14px;"
  content = content.replace(
    /color:#1A1800;/g,
    'color:#000000 !important;'
  );

  const result = await db.collection('blogs').updateOne(
    { slug: 'gwal-pahari-property-khareedne-ka-complete-guide-2026-legal-checklist-nbfc-loan-amaryllis-orchid-the-arch' },
    { $set: { content: content, updatedAt: new Date() } }
  );

  console.log('Updated:', result.modifiedCount, 'document');

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(console.error);
