const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://ssrealtyteams:fG8dM6w4x1kO5v2X@cluster0.zpx6m.mongodb.net/ss-realty?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');
  const db = mongoose.connection.db;
  
  const questions = await db.collection('questions').find().sort({ createdAt: -1 }).limit(5).toArray();
  console.log('Latest Questions:');
  for (const q of questions) {
    console.log(`- ${q.title} (${q.status}) ID: ${q._id}`);
    const answers = await db.collection('answers').find({ questionId: q._id }).toArray();
    console.log(`  Answers found: ${answers.length}`);
    for (const a of answers) {
      console.log(`    - ${a.content} (${a.status})`);
    }
  }
  process.exit(0);
}
check();
