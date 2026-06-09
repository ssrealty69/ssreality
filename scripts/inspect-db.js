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

async function inspect() {
  try {
    await mongoose.connect(uri);
    const prop = await Property.findOne({ title: /Amaryllis/i }).lean();
    if (prop) {
      console.log(JSON.stringify(prop, null, 2));
    } else {
      console.log("Amaryllis property not found");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error inspecting database:", err);
    process.exit(1);
  }
}

inspect();
