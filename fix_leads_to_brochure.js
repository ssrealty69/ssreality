const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty');

const Schema = new mongoose.Schema({}, { strict: false, collection: 'propertyenquiries' });
const PE = mongoose.model('PE', Schema);

async function run() {
  try {
    // Update Jai Veer: "Duplex Apartments" → "3BHK"
    const r1 = await PE.findOneAndUpdate(
      { name: 'Jai Veer', phone: '8810201051' },
      { $set: { requirement: 'Brochure Download Request. Looking for: 3BHK' } }
    );

    // Update Divya Saini: "3BHK Apartments" → "3BHK"
    const r2 = await PE.findOneAndUpdate(
      { name: 'Divya Saini', phone: '9318379942' },
      { $set: { requirement: 'Brochure Download Request. Looking for: 3BHK' } }
    );

    // Update Akriti: "3BHK Duplex" → "3BHK"
    const r3 = await PE.findOneAndUpdate(
      { name: 'Akriti', phone: '9354093379' },
      { $set: { requirement: 'Brochure Download Request. Looking for: 3BHK' } }
    );

    console.log('Jai Veer updated:', !!r1);
    console.log('Divya Saini updated:', !!r2);
    console.log('Akriti updated:', !!r3);

    // Verify final state
    const all = await PE.find({ name: { $in: ['Jai Veer', 'Divya Saini', 'Akriti'] } }).lean();
    all.forEach(e => {
      console.log('\n✅ ' + e.name + ' (' + e.phone + ')');
      console.log('   requirement: "' + e.requirement + '"');
      console.log('   createdAt: ' + e.createdAt + ' (unchanged)');
    });

    console.log('\nAll 3 entries now show "Looking for: 3BHK" — format matches other entries.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

run();
