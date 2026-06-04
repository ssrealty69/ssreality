import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  questionId: mongoose.Types.ObjectId;
  content: string;
  authorName: string;
  isAdmin: boolean;
  status: 'pending' | 'published' | 'rejected';
  upvotes: number;
  isBestAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    content: { type: String, required: true },
    authorName: { type: String, default: 'Anonymous' },
    isAdmin: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['pending', 'published', 'rejected'], 
      default: 'pending' 
    },
    upvotes: { type: Number, default: 0 },
    isBestAnswer: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

export const Answer = mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);
