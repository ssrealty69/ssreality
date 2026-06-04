import { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare, MessageCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import { Question } from '@/models/Question';
import { Answer } from '@/models/Answer';

export const metadata: Metadata = {
  title: 'Ask Anything Management - Admin Dashboard',
};

export default async function AskAnythingAdminDashboard() {
  await connectDB();
  
  // Get Stats
  const totalQuestions = await Question.countDocuments();
  const pendingQuestions = await Question.countDocuments({ status: 'pending' });
  const totalAnswers = await Answer.countDocuments();
  const pendingAnswers = await Answer.countDocuments({ status: 'pending' });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900">Ask Anything Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage public questions and community answers.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HelpCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalQuestions}</h3>
            </div>
          </div>
          <Link href="/admin/ask-anything/questions" className="mt-auto text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
            View All Questions <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Questions</p>
              <h3 className="text-2xl font-bold text-gray-900">{pendingQuestions}</h3>
            </div>
          </div>
          <Link href="/admin/ask-anything/questions?status=pending" className="mt-auto text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1">
            Review Questions <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Answers</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalAnswers}</h3>
            </div>
          </div>
          <Link href="/admin/ask-anything/answers" className="mt-auto text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
            View All Answers <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Answers</p>
              <h3 className="text-2xl font-bold text-gray-900">{pendingAnswers}</h3>
            </div>
          </div>
          <Link href="/admin/ask-anything/answers?status=pending" className="mt-auto text-sm text-red-600 font-medium hover:text-red-700 flex items-center gap-1">
            Review Answers <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/ask-anything/questions/new" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#C9A227] hover:bg-amber-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#C9A227] flex items-center justify-center group-hover:bg-[#C9A227] group-hover:text-white transition-colors">
                <HelpCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Post New Question</h4>
                <p className="text-xs text-gray-500">Create an official FAQ or seed a community discussion.</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:text-[#C9A227]" />
          </Link>
          
          <Link href="/admin/ask-anything/answers/new" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#C9A227] hover:bg-amber-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#C9A227] flex items-center justify-center group-hover:bg-[#C9A227] group-hover:text-white transition-colors">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Post Official Answer</h4>
                <p className="text-xs text-gray-500">Provide an authoritative answer to an existing question.</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:text-[#C9A227]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
