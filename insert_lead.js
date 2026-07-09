const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty');

const PropertySchema = new mongoose.Schema({
  title: String,
  slug: String
}, { strict: false });
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

const PropertyEnquirySchema = new mongoose.Schema({
  name: String,
  phone: String,
  requirement: String,
  propertyId: String,
  propertyTitle: String,
  propertyUrl: String,
  isBrochureDownload: Boolean,
  source: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}, { strict: false, collection: 'propertyenquiries' });
const PropertyEnquiry = mongoose.models.PropertyEnquiry || mongoose.model('PropertyEnquiry', PropertyEnquirySchema);

async function run() {
  try {
    const property = await Property.findOne({ title: /The Arch/i });
    console.log('Found Property:', property ? property.title : 'Not Found');

    const createdAt = new Date('2026-07-08T23:43:00+05:30'); // 8 july 2026, 11:43 PM IST

    const enquiry = new PropertyEnquiry({
      name: "Divya Saini",
      phone: "9318379942",
      requirement: "3BHK Apartments",
      propertyId: property ? property._id.toString() : "unknown",
      propertyTitle: property ? property.title : "3BHK Apartments in The Arch",
      propertyUrl: property ? `/properties/${property.slug || property._id}` : "/properties/the-arch",
      isBrochureDownload: true,
      source: "Brochure Download",
      status: "new",
      createdAt: createdAt,
      updatedAt: createdAt
    });

    await enquiry.save();
    console.log('Enquiry saved successfully:', enquiry);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

run();
