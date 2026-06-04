import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Answer } from '@/models/Answer';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const answer = await Answer.findById(params.id).populate('questionId', 'title slug').lean();

    if (!answer) {
      return NextResponse.json({ success: false, error: 'Answer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    console.error('Error fetching answer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await req.json();

    const updatedAnswer = await Answer.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedAnswer) {
      return NextResponse.json({ success: false, error: 'Answer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, answer: updatedAnswer });
  } catch (error: any) {
    console.error('Error updating answer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedAnswer = await Answer.findByIdAndDelete(params.id);

    if (!deletedAnswer) {
      return NextResponse.json({ success: false, error: 'Answer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Answer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting answer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
