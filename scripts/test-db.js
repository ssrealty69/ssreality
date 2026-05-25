const mongoose = require('mongoose');

const uri = "mongodb://admin:ssrealty2026@ac-xfqrhbi-shard-00-00.kmrmgno.mongodb.net:27017,ac-xfqrhbi-shard-00-01.kmrmgno.mongodb.net:27017,ac-xfqrhbi-shard-00-02.kmrmgno.mongodb.net:27017/SSRealty?ssl=true&replicaSet=atlas-54lyq8-shard-0&authSource=admin&appName=SSRealty";

async function testConnection() {
  try {
    console.log("Attempting to connect with NEW CREDENTIALS...");
    await mongoose.connect(uri);
    console.log("Connection successful!");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:");
    console.error(err);
    process.exit(1);
  }
}

testConnection();
