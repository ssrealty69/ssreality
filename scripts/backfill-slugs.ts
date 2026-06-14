import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const index = line.indexOf('=');
    if (index !== -1) {
      const key = line.substring(0, index).trim();
      const value = line.substring(index + 1).trim();
      process.env[key] = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    }
  });
}


function extractCleanName(title: string, propertyName?: string): string {
  let name = propertyName;
  if (!name) {
    const match = title.match(/^(.*?)(?=\s+\d+BHK|\s+2BHK|\s+3BHK|\s+4BHK|\s+Simple|\s+Apartments)/i);
    name = match && match[1] ? match[1].trim() : title;
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function backfillSlugs() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const properties = await db.collection('properties').find({}).toArray();
    console.log(`Found ${properties.length} properties`);

    let updated = 0;
    for (const prop of properties) {
      const slug = extractCleanName(prop.title || 'property', prop.propertyName);
      await db.collection('properties').updateOne(
        { _id: prop._id },
        { $set: { slug } }
      );
      console.log(`Updated property ${prop._id} with slug: ${slug}`);
      updated++;
    }

    console.log(`Finished updating ${updated} properties.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

backfillSlugs();
