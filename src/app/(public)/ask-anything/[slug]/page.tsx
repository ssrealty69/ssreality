export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Question } from '@/models/Question';
import { Answer } from '@/models/Answer';
import { ArrowLeft, MessageSquare, Clock, User, Share2 } from 'lucide-react';
import SubmitAnswerForm from './SubmitAnswerForm';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connectDB();
  const resolvedParams = await params;
  const question = await Question.findOne({ slug: resolvedParams.slug, status: 'published' }).lean();
  
  if (!question) {
    return { title: 'Question Not Found' };
  }

  return {
    title: `${question.title} | Ask Anything - SS Realty`,
    description: question.description?.substring(0, 160) || `Read answers to "${question.title}" on SS Realty Q&A.`,
    openGraph: {
      title: question.title,
      description: question.description?.substring(0, 160),
    }
  };
}

async function getQuestionDetails(slug: string) {
  await connectDB();
  const question = await Question.findOne({ slug, status: 'published' }).lean();
  if (!question) return null;

  const answers = await Answer.find({ questionId: question._id, status: 'published' })
    .sort({ isAdmin: -1, upvotes: -1, createdAt: -1 })
    .lean();

  return { question, answers };
}

export default async function QuestionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getQuestionDetails(resolvedParams.slug);
  
  if (!data) {
    notFound();
  }

  const { question, answers } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question.title,
      text: question.description || question.title,
      answerCount: answers.length,
      upvoteCount: question.upvotes || 0,
      dateCreated: new Date(question.createdAt).toISOString(),
      author: {
        '@type': 'Person',
        name: question.authorName,
      },
      acceptedAnswer: answers.length > 0 ? {
        '@type': 'Answer',
        text: answers[0].content,
        dateCreated: new Date(answers[0].createdAt).toISOString(),
        upvoteCount: answers[0].upvotes || 0,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/ask-anything/${question.slug}`,
        author: {
          '@type': 'Person',
          name: answers[0].authorName,
        },
      } : undefined,
      suggestedAnswer: answers.slice(1).map((ans: any) => ({
        '@type': 'Answer',
        text: ans.content,
        dateCreated: new Date(ans.createdAt).toISOString(),
        upvoteCount: ans.upvotes || 0,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/ask-anything/${question.slug}`,
        author: {
          '@type': 'Person',
          name: ans.authorName,
        },
      })),
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link 
          href="/ask-anything"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#C9A227] transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to all questions
        </Link>

        {/* Question Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9A227] to-[#B8860B]"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#C9A227]/10 text-[#C9A227] text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              {question.category}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1.5 font-medium">
              <Clock size={14} />
              {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
            {question.title}
          </h1>

          {question.description && (
            <div className="prose prose-lg text-gray-700 max-w-none mb-8 whitespace-pre-wrap">
              {question.description}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{question.authorName}</p>
                <p className="text-xs text-gray-500 font-medium">Community Member</p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm border border-transparent hover:border-gray-200">
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          {answers.filter((a: any) => a.isAdmin).length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 font-playfair mb-6">
                Official Answer
              </h2>
              <div className="space-y-6">
                {answers.filter((a: any) => a.isAdmin).map((answer: any) => (
                  <div 
                    key={answer._id} 
                    className="bg-amber-50 rounded-2xl p-6 md:p-8 shadow-sm border border-[#C9A227] ring-1 ring-[#C9A227]/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-[#C9A227] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                      Official Answer
                    </div>
                    
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-amber-100 border-amber-300 text-[#C9A227]">
                        <span className="font-bold">SS</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-gray-900">{answer.authorName}</p>
                          <span className="bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Expert</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div 
                      className="prose prose-gray max-w-none prose-p:leading-relaxed prose-a:text-[#C9A227] hover:prose-a:text-[#B8860B] prose-headings:font-playfair custom-qa-content"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-playfair">
              Community Comments ({answers.filter((a: any) => !a.isAdmin).length})
            </h2>
          </div>

          <div className="space-y-6">
            {answers.filter((a: any) => !a.isAdmin).map((answer: any) => (
              <div 
                key={answer._id} 
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-gray-100 border-gray-200 text-gray-600">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-gray-900">{answer.authorName}</p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {new Date(answer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div 
                  className="prose prose-gray max-w-none prose-p:leading-relaxed prose-a:text-[#C9A227] hover:prose-a:text-[#B8860B] prose-headings:font-playfair custom-qa-content"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />
              </div>
            ))}

            {answers.length === 0 && (
              <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-500">Be the first to share your thoughts on this topic.</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Answer Form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 font-playfair mb-6">Leave a Comment</h3>
          <SubmitAnswerForm questionId={question._id.toString()} />
        </div>

      </div>
    </div>
  );
}
