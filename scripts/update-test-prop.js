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

async function updateTestProperty() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const updateDoc = {
      mobileBannerUrl: "https://res.cloudinary.com/ddpahrqfk/image/upload/v1780905563/ss-realty/properties/zqcrzqn1s1iwuycmscub.jpg",
      galleryImages: [
        "https://res.cloudinary.com/ddpahrqfk/image/upload/v1780963737/ss-realty/ocq0m8a067h6t7scdixx.jpg"
      ],
      brochureUrl: "https://res.cloudinary.com/ddpahrqfk/image/upload/v1780918533/ss-realty/properties/tukncequzyvtuzgsjyeo.pdf",
      googleMapsUrl: "https://maps.google.com/test",
      highlights: ["Highlight A", "Highlight B"],
      highlightsImageUrl: "https://res.cloudinary.com/ddpahrqfk/image/upload/v1780906168/ss-realty/properties/olhgwofc2rsi6sozdy1l.jpg",
      locationMapUrl: "https://res.cloudinary.com/ddpahrqfk/image/upload/v1780906715/ss-realty/properties/r8dinvkocxvwdnkpwcu8.jpg",
      nearby: [{ type: "landmark", name: "Test School", distance: "1 Km" }],
      worldClassAmenities: ["Gym", "Spa"],
      images: ["https://res.cloudinary.com/ddpahrqfk/image/upload/v1780905552/ss-realty/properties/muy0bkky1u4wgnyqasvg.jpg"],
      interiorImages: ["https://res.cloudinary.com/ddpahrqfk/image/upload/v1780917875/ss-realty/properties/pp1rcn67dbzcedajds7y.jpg"]
    };

    const res = await Property.updateOne({ title: 'test' }, { $set: updateDoc });
    console.log("Update result:", res);
    process.exit(0);
  } catch (err) {
    console.error("Error updating test property:", err);
    process.exit(1);
  }
}

updateTestProperty();
