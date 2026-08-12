process.loadEnvFile('.env.local');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const url = "https://res.cloudinary.com/ddpahrqfk/image/upload/v1786518812/ss-realty/resumes/qfsv3v2zxcmajqaal3iy.pdf";
const publicId = "ss-realty/resumes/qfsv3v2zxcmajqaal3iy"; // Extracted

const signedUrl = cloudinary.url(publicId, {
  resource_type: 'image',
  type: 'upload',
  format: 'pdf',
  flags: 'attachment',
  sign_url: true,
});

console.log("Signed URL:", signedUrl);

// Test fetching the signed URL
fetch(signedUrl).then(res => {
  console.log("Fetch Signed URL Status:", res.status);
}).catch(console.error);

