/* Upload blog thumbnail to Cloudinary and update MongoDB */
const cloudinary = require('cloudinary').v2;
const { MongoClient } = require('mongodb');

cloudinary.config({
  cloud_name: 'ddpahrqfk',
  api_key: '551377621351515',
  api_secret: 'ecSm4RPDidl0BZCmdyPGDJDXz1I',
});

const imgPath = 'C:/Users/Pawan/.gemini/antigravity-ide/brain/272cad99-6cf2-4bb2-8636-34f98d4b47f0/blog_chattarpur_3bhk_thumbnail_1783585859405.png';
const mongoUri = 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';
const blogSlug = '3bhk-flat-in-chattarpur-registry-flat-jvts-garden-chattarpur-enclave-phase-2';

async function run() {
  console.log('Uploading to Cloudinary...');
  const upload = await cloudinary.uploader.upload(imgPath, {
    folder: 'ss-realty/blog',
    public_id: 'chattarpur-3bhk-registry-flat-jvts-garden',
    overwrite: true,
    resource_type: 'image',
    format: 'webp',
    quality: 82,
  });

  const imageUrl = upload.secure_url;
  console.log('Cloudinary URL:', imageUrl);

  const client = await MongoClient.connect(mongoUri);
  const db = client.db('SSRealty');

  const result = await db.collection('blogs').updateOne(
    { slug: blogSlug },
    { $set: { coverImage: imageUrl, updatedAt: new Date() } }
  );

  console.log('MongoDB updated:', result.modifiedCount, 'doc');
  console.log('Done! Image now live at:', imageUrl);
  client.close();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
