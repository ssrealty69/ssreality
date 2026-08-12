process.loadEnvFile('.env.local');
const mongoose = require('mongoose');
const crypto = require('crypto');

function hashPassword(password, salt) {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || 'super_admin';

  if (!email || !password) {
    console.error('Usage: node scripts/create_admin.js <email> <password> [role]');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const adminSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      salt: { type: String, required: true },
      role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
      isActive: { type: Boolean, default: true },
    }, { timestamps: true });

    const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin with this email already exists.');
      process.exit(0);
    }

    const newAdmin = new Admin({
      name: 'Admin User',
      email,
      passwordHash,
      salt,
      role
    });

    await newAdmin.save();
    console.log(`Successfully created ${role} with email ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
