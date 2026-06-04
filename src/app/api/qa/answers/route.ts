import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Answer } from '@/models/Answer';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    if (!data.questionId || !data.content) {
      return NextResponse.json({ success: false, error: 'Question ID and content are required' }, { status: 400 });
    }

    const newAnswer = await Answer.create({
      ...data,
      authorName: data.authorName || 'Anonymous',
      status: 'published', // Auto-publish user answers
      isAdmin: false
    });

    return NextResponse.json({ success: true, answer: newAnswer }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating public answer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
