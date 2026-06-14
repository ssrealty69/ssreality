import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

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

async function checkNames() {
  const MONGODB_URI = process.env.MONGODB_URI;
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db;
  const properties = await db?.collection('properties').find({}).toArray();
  
  properties?.forEach(p => {
    console.log(`ID: ${p._id}, propertyName: "${p.propertyName}", title: "${p.title}"`);
  });
  
  process.exit(0);
}

checkNames();
