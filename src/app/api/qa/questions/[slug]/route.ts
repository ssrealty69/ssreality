import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Question } from '@/models/Question';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const question = await Question.findOne({ slug: params.slug, status: 'published' })
      .populate({
        path: 'answers',
        match: { status: 'published' },
        sort: { upvotes: -1, createdAt: -1 }
      })
      .lean();

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    console.error('Error fetching question by slug:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
