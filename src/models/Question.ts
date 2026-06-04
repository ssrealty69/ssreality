import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  slug: string;
  description?: string;
  authorName: string;
  status: 'pending' | 'published' | 'rejected';
  category: string;
  views: number;
  tags: string[];
  isSeoOptimized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    authorName: { type: String, default: 'Anonymous' },
    status: { 
      type: String, 
      enum: ['pending', 'published', 'rejected'], 
      default: 'pending' 
    },
    category: { type: String, default: 'General' },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    isSeoOptimized: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

// Virtual for answering count
QuestionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'questionId',
  count: true // only get the count
});

QuestionSchema.set('toObject', { virtuals: true });
QuestionSchema.set('toJSON', { virtuals: true });

delete mongoose.models.Question;
export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
