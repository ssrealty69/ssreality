const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/^MONGODB_URI=(.*)$/m);
if (!match) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const uri = match[1].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');

const PropertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

async function count() {
  try {
    await mongoose.connect(uri);
    const props = await Property.find({ title: 'test' }).lean();
    console.log(`Found ${props.length} properties with title 'test':`);
    props.forEach(p => {
      console.log(`ID: ${p._id}, updatedAt: ${p.updatedAt}`);
    });
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

count();
