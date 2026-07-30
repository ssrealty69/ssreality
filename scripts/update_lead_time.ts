import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.log('Error reading .env.local:', e);
}

import { connectDB } from '../src/lib/mongodb';
import PropertyEnquiry from '../src/models/PropertyEnquiry';

async function fixTimeNative() {
  await connectDB();

  // Target: 02:02 PM IST on 24 Jul 2026 -> 08:32:00.000Z UTC
  const targetDate = new Date('2026-07-24T08:32:00.000Z');

  // Direct MongoDB Collection update (bypassing Mongoose Schema validations/hooks)
  const collection = PropertyEnquiry.collection;
  const objId = new mongoose.Types.ObjectId('6a63312a2a23c130a82f107b');

  const res = await collection.updateOne(
    { _id: objId },
    { $set: { createdAt: targetDate } }
  );

  console.log('Native update result:', res);

  const updatedDoc = await collection.findOne({ _id: objId });
  console.log('Native updated document in DB:', updatedDoc?.createdAt);
  if (updatedDoc?.createdAt) {
    console.log('Formatted in IST:', new Date(updatedDoc.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  }

  process.exit(0);
}

fixTimeNative();
