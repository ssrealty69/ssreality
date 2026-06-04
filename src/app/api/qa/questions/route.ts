import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Question } from '@/models/Question';
import { Answer } from '@/models/Answer';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'latest';

    const query: any = { status: 'published' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { upvotes: -1 };
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'answers',
        match: { status: 'published' },
        options: { limit: 1, sort: { createdAt: -1 } }
      })
      .lean();

    return NextResponse.json({
      success: true,
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching public questions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    if (!data.title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const newQuestion = await Question.create({
      ...data,
      slug,
      authorName: data.authorName || 'Anonymous',
      status: 'published' // Auto-publish user questions
    });

    if (data.answerContent && data.answerContent.trim() !== '' && data.answerContent !== '<p><br></p>' && data.answerContent !== '<p></p>') {
      await Answer.create({
        questionId: newQuestion._id,
        content: data.answerContent,
        authorName: data.authorName || 'Anonymous',
        status: 'published'
      });
    }

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating public question:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
