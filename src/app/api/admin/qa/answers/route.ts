import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Answer } from '@/models/Answer';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Answer.countDocuments(query);
    const answers = await Answer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'questionId', select: 'title slug' })
      .lean();

    return NextResponse.json({
      success: true,
      answers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const newAnswer = await Answer.create({
      ...data,
      authorName: data.authorName || 'Admin',
      isAdmin: true, // If created from admin panel, it's an admin answer
      status: 'published' // Admin answers are automatically published
    });

    return NextResponse.json({ success: true, answer: newAnswer }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
