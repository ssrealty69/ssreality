const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty');


const PropertySchema = new mongoose.Schema({
  title: String,
  slug: String
}, { strict: false });
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

async function run() {
  try {
    const properties = await Property.find({ title: /duplex/i });
    console.log('Found Properties matching "duplex":', properties.map(p => p.title));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

run();
