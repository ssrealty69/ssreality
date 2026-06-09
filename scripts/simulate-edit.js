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

function parsePriceText(text) {
  if (!text) return 0;
  let cleanText = text.replace(/[₹\s,]/g, '').toLowerCase();
  if (cleanText.includes('cr')) {
    const numPart = parseFloat(cleanText.split('cr')[0]);
    return isNaN(numPart) ? 0 : Math.round(numPart * 10000000);
  }
  if (cleanText.includes('l')) {
    const numPart = parseFloat(cleanText.split('l')[0]);
    return isNaN(numPart) ? 0 : Math.round(numPart * 100000);
  }
  if (cleanText.includes('k')) {
    const numPart = parseFloat(cleanText.split('k')[0]);
    return isNaN(numPart) ? 0 : Math.round(numPart * 1000);
  }
  const parsed = parseFloat(cleanText);
  return isNaN(parsed) ? 0 : parsed;
}

function formatPriceForEdit(price) {
  if (!price) return '';
  if (price >= 10000000) {
    const val = price / 10000000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 2)} Cr`;
  } else if (price >= 100000) {
    const val = price / 100000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 2)} L`;
  }
  return price.toString();
}

async function simulate() {
  try {
    await mongoose.connect(uri);
    
    // We will search for Property #1
    const prop = await Property.findOne({ title: /test/i }).lean();
    if (!prop) {
      console.log("No property found to simulate");
      process.exit(0);
    }
    
    console.log("Original Document Title:", prop.title);
    console.log("prop object:", JSON.stringify(prop, null, 2));
    
    // Step 1: Simulate the loadProperty mapping
    const formData = {
      title: prop.title || '',
      description: prop.description || '',
      price: prop.price !== undefined ? formatPriceForEdit(prop.price) : '',
      priceType: prop.priceType || 'sale',
      propertyType: prop.propertyType || 'apartment',
      status: prop.status || 'available',
      location: {
        address: prop.location?.address || '',
        city: prop.location?.city || '',
        state: prop.location?.state || '',
      },
      features: {
        area: prop.features?.area !== undefined ? prop.features.area.toString() : '',
        areaUnit: prop.features?.areaUnit || 'sqft',
        bedrooms: prop.features?.bedrooms !== undefined && prop.features?.bedrooms !== null ? prop.features.bedrooms.toString() : '',
        bathrooms: prop.features?.bathrooms !== undefined && prop.features?.bathrooms !== null ? prop.features.bathrooms.toString() : '',
        registryAvailable: prop.features?.registryAvailable !== undefined ? prop.features.registryAvailable : true,
        parking: prop.features?.parking || false,
        furnished: prop.features?.furnished || false,
        floor: prop.features?.floor !== undefined && prop.features?.floor !== null ? prop.features.floor.toString() : '',
        totalFloors: prop.features?.totalFloors !== undefined && prop.features?.totalFloors !== null ? prop.features.totalFloors.toString() : '',
        towers: prop.features?.towers !== undefined && prop.features?.towers !== null ? prop.features.towers.toString() : '',
        totalUnits: prop.features?.totalUnits !== undefined && prop.features?.totalUnits !== null ? prop.features.totalUnits.toString() : '',
        reraApproved: prop.features?.reraApproved || false
      },
      agent: {
        name: prop.agent?.name || '',
        phone: prop.agent?.phone || '',
        email: prop.agent?.email || '',
      },
      amenities: prop.amenities || [],
      worldClassAmenities: prop.worldClassAmenities || [],
      priceList: prop.priceList && prop.priceList.length > 0 
         ? prop.priceList.map((p) => ({ ...p, isEditing: false })) 
         : [{ type: '', size: '', price: '', negotiable: false, isEditing: true }],
      images: prop.images && prop.images.length > 0 ? [prop.images[0]] : [''],
      mobileBannerUrl: prop.mobileBannerUrl || '',
      interiorImages: prop.interiorImages && prop.interiorImages.length > 0
        ? prop.interiorImages
        : (prop.images && prop.images.length > 1 ? prop.images.slice(1) : []),
      galleryImages: prop.galleryImages && prop.galleryImages.length > 0
        ? prop.galleryImages
        : [],
      videoUrl: prop.videoUrl || '',
      brochureUrl: prop.brochureUrl || '',
      googleMapsUrl: prop.googleMapsUrl || '',
      highlights: prop.highlights && prop.highlights.length > 0 
        ? prop.highlights.map((h) => typeof h === 'string' ? h : h.title || '') 
        : [''],
      highlightsImageUrl: prop.highlightsImageUrl || '',
      locationMapUrl: prop.locationMapUrl || '',
      nearby: prop.nearby && prop.nearby.length > 0 ? prop.nearby : [{ type: 'landmark', name: '', distance: '' }],
      featured: prop.featured || false
    };

    const seoData = {
      title: prop.seo?.title || '',
      description: prop.seo?.description || '',
      keywords: prop.seo?.keywords || '',
      focusKeyword: prop.seo?.focusKeyword || '',
      canonicalUrl: prop.seo?.canonicalUrl || '',
    };

    // Step 2: Simulate handleSubmit payload creation
    const payload = {
      ...formData,
      price: formData.price ? parsePriceText(formData.price) : 0,
      images: formData.images.filter(img => img.trim() !== ''),
      interiorImages: formData.interiorImages.filter(img => img.trim() !== ''),
      galleryImages: formData.galleryImages.filter(img => img.trim() !== ''),
      highlights: formData.highlights.filter(h => typeof h === 'string' && h.trim() !== ''),
      nearby: formData.nearby.filter(n => n.name.trim() !== '' && n.distance.trim() !== ''),
      priceList: formData.priceList
        .filter(p => p.type.trim() !== '' && p.price.trim() !== '')
        .map(({ isEditing, ...rest }) => rest),
      features: {
        ...formData.features,
        area: formData.features.area ? parseFloat(formData.features.area) : 0,
        bedrooms: formData.features.bedrooms ? parseInt(formData.features.bedrooms) : undefined,
        bathrooms: formData.features.bathrooms ? parseInt(formData.features.bathrooms) : undefined,
        floor: formData.features.floor ? parseInt(formData.features.floor) : undefined,
        totalFloors: formData.features.totalFloors ? parseInt(formData.features.totalFloors) : undefined,
        towers: formData.features.towers ? parseInt(formData.features.towers) : undefined,
        totalUnits: formData.features.totalUnits ? parseInt(formData.features.totalUnits) : undefined,
      },
      seo: seoData
    };

    // Serialize payload to simulate JSON stringify/parse roundtrip (strips undefined values)
    const processedPayload = JSON.parse(JSON.stringify(payload));

    // Compare original prop with processed payload to identify differences
    console.log("\n--- Comparison of Original Doc fields vs Processed Payload fields ---");
    
    const fieldsToCheck = [
      'title', 'description', 'price', 'priceType', 'propertyType', 'status',
      'featured', 'videoUrl', 'brochureUrl', 'googleMapsUrl', 'mobileBannerUrl',
      'highlightsImageUrl', 'locationMapUrl'
    ];

    fieldsToCheck.forEach(f => {
      const orig = prop[f];
      const pay = processedPayload[f];
      if (orig !== pay) {
        console.log(`Field [${f}]: Original = "${orig}", Payload = "${pay}"`);
      }
    });

    // Nested: location
    console.log("\n--- Location Nested ---");
    Object.keys(prop.location || {}).forEach(k => {
      const orig = prop.location[k];
      const pay = processedPayload.location ? processedPayload.location[k] : undefined;
      if (orig !== pay) {
        console.log(`location.[${k}]: Original = "${orig}", Payload = "${pay}"`);
      }
    });

    // Nested: agent
    console.log("\n--- Agent Nested ---");
    Object.keys(prop.agent || {}).forEach(k => {
      const orig = prop.agent[k];
      const pay = processedPayload.agent ? processedPayload.agent[k] : undefined;
      if (orig !== pay) {
        console.log(`agent.[${k}]: Original = "${orig}", Payload = "${pay}"`);
      }
    });

    // Nested: features
    console.log("\n--- Features Nested ---");
    Object.keys(prop.features || {}).forEach(k => {
      const orig = prop.features[k];
      const pay = processedPayload.features ? processedPayload.features[k] : undefined;
      if (orig !== pay) {
        console.log(`features.[${k}]: Original = "${orig}", Payload = "${pay}"`);
      }
    });

    // Arrays: images, interiorImages, galleryImages, highlights, nearby, priceList
    console.log("\n--- Arrays ---");
    console.log(`images length: Original = ${prop.images?.length}, Payload = ${processedPayload.images?.length}`);
    console.log(`interiorImages length: Original = ${prop.interiorImages?.length}, Payload = ${processedPayload.interiorImages?.length}`);
    console.log(`galleryImages length: Original = ${prop.galleryImages?.length}, Payload = ${processedPayload.galleryImages?.length}`);
    console.log(`highlights length: Original = ${prop.highlights?.length}, Payload = ${processedPayload.highlights?.length}`);
    console.log(`nearby length: Original = ${prop.nearby?.length}, Payload = ${processedPayload.nearby?.length}`);
    console.log(`priceList length: Original = ${prop.priceList?.length}, Payload = ${processedPayload.priceList?.length}`);

    process.exit(0);
  } catch (err) {
    console.error("Simulation failed:", err);
    process.exit(1);
  }
}

simulate();
