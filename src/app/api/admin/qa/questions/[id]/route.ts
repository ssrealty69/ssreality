import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Question } from '@/models/Question';
import { Answer } from '@/models/Answer';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const question = await Question.findById(params.id).populate('answers').lean();

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    // Fetch official answer if it exists
    const officialAnswer = await Answer.findOne({ questionId: question._id, isAdmin: true }).lean();

    return NextResponse.json({ success: true, question, officialAnswer });
  } catch (error: any) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await req.json();

    const updatedQuestion = await Question.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuestion) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    // Handle Official Answer Update/Create
    if (data.answerContent !== undefined) {
      const isAnswerEmpty = !data.answerContent || data.answerContent.trim() === '' || data.answerContent === '<p><br></p>' || data.answerContent === '<p></p>';
      
      const existingAnswer = await Answer.findOne({ questionId: updatedQuestion._id, isAdmin: true });
      
      if (isAnswerEmpty) {
        // If empty and exists, delete it
        if (existingAnswer) {
          await Answer.deleteOne({ _id: existingAnswer._id });
        }
      } else {
        // Create or update
        if (existingAnswer) {
          existingAnswer.content = data.answerContent;
          await existingAnswer.save();
        } else {
          await Answer.create({
            questionId: updatedQuestion._id,
            content: data.answerContent,
            authorName: 'Admin',
            isAdmin: true,
            status: 'published'
          });
        }
      }
    }

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedQuestion = await Question.findByIdAndDelete(params.id);

    if (!deletedQuestion) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
