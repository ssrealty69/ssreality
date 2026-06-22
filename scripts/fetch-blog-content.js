const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty";

const BlogSchema = new mongoose.Schema({
  slug: String,
  content: String
}, { strict: false });

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

async function viewBlogTable() {
  try {
    await mongoose.connect(MONGODB_URI);
    const blog = await Blog.findOne({ slug: '4-bhk-3-bhk-flats-in-gwal-pahari-gurgaon-amaryllis-luxury-living-in-2026' });
    
    if (blog) {
      const fs = require('fs');
      fs.writeFileSync('scripts/blog-content.html', blog.content);
      console.log('Saved to scripts/blog-content.html');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

viewBlogTable();
