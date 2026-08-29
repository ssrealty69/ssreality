const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty');

const PropertyEnquirySchema = new mongoose.Schema({}, { strict: false, collection: 'propertyenquiries' });
const PropertyEnquiry = mongoose.models.PropertyEnquiry || mongoose.model('PropertyEnquiry', PropertyEnquirySchema);


async function run() {

  try {
    // Show all brochure entries with their exact fields
    const entries = await PropertyEnquiry.find({
      isBrochureDownload: true
    }).sort({ createdAt: -1 }).lean();

    console.log(`Total brochure entries: ${entries.length}\n`);
    entries.forEach((e, i) => {
      console.log(`[${i + 1}] ${e.name} | ${e.phone}`);
      console.log(`    requirement: "${e.requirement}"`);
      console.log(`    source: "${e.source}"`);
      console.log(`    isBrochureDownload: ${e.isBrochureDownload}`);
      console.log(`    createdAt: ${e.createdAt}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}


run();
