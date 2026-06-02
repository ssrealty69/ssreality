import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: { name: string; image?: string };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: Date;
  published: boolean;
  views: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    author: {
      name: { type: String, required: true },
      image: { type: String },
    },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft', index: true },
    publishDate: { type: Date },
    published: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: String },
      focusKeyword: { type: String },
      canonicalUrl: { type: String },
    },
  },
  { timestamps: true }
);

BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
