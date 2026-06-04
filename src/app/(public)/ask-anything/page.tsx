import { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import { Question } from '@/models/Question';
import { Search, MessageSquare, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ask Anything - Real Estate Q&A | SS Realty',
  description: 'Ask your real estate questions about plots, flats, and villas. Get answers from the community and SS Realty experts.',
  openGraph: {
    title: 'Ask Anything - Real Estate Q&A | SS Realty',
    description: 'Ask your real estate questions and get answers from experts and the community.',
  }
};

const CATEGORIES = ['All', 'Plots', 'Flats', 'Apartments', 'Villas', 'Investment', 'Legal', 'Location', 'General'];

async function getQuestions(search = '', category = 'All', sort = 'latest') {
  await connectDB();
  const query: any = { status: 'published' };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category && category !== 'All') {
    query.category = category;
  }

  let sortOption: any = { createdAt: -1 };
  if (sort === 'popular') {
    sortOption = { upvotes: -1 };
  }

  const questions = await Question.find(query)
    .sort(sortOption)
    .limit(20)
    .populate({
      path: 'answers',
      match: { status: 'published' },
      select: '_id',
    })
    .lean();

  return questions;
}

export default async function AskAnythingPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.q || '';
  const category = resolvedParams.category || 'All';
  const sort = resolvedParams.sort || 'latest';

  const questions = await getQuestions(search, category, sort);

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
            Real Estate <span className="text-[#C9A227]">Q&A</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have a question about buying, selling, or investing in real estate? Ask the community and our experts.
          </p>
          <div className="mt-8">
            <Link 
              href="/ask-anything/ask"
              className="inline-flex items-center gap-2 bg-[#C9A227] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#B8860B] transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
            >
              <MessageSquare size={20} />
              Ask a Question
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* Search & Sort Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <form action="/ask-anything" className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  name="q"
                  defaultValue={search}
                  placeholder="Search questions..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none transition-all"
                />
                <input type="hidden" name="category" value={category} />
                <input type="hidden" name="sort" value={sort} />
              </form>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Sort by:</span>
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                  <Link 
                    href={`/ask-anything?q=${search}&category=${category}&sort=latest`}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${sort === 'latest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Latest
                  </Link>
                  <Link 
                    href={`/ask-anything?q=${search}&category=${category}&sort=popular`}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${sort === 'popular' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Popular
                  </Link>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Search size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-500">Try adjusting your search or category filter.</p>
                </div>
              ) : (
                questions.map((question: any) => (
                  <Link 
                    key={question._id} 
                    href={`/ask-anything/${question.slug}`}
                    className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#C9A227]/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex gap-4">
                      {/* Stats Column */}
                      <div className="flex flex-col items-center justify-start gap-2 pt-1 hidden sm:flex min-w-[60px]">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{question.upvotes || 0}</div>
                          <div className="text-xs font-medium text-gray-500">Votes</div>
                        </div>
                        <div className={`text-center px-2 py-1 rounded-lg ${question.answers?.length > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-500'}`}>
                          <div className="text-sm font-bold">{question.answers?.length || 0}</div>
                          <div className="text-[10px] uppercase font-bold tracking-wider">Answers</div>
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {question.category}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#C9A227] transition-colors mb-2">
                          {question.title}
                        </h2>
                        {question.description && (
                          <p className="text-gray-600 line-clamp-2 text-sm mb-4">
                            {question.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                              {question.authorName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{question.authorName}</span>
                          </div>
                          
                          {/* Mobile stats */}
                          <div className="flex items-center gap-4 sm:hidden text-sm text-gray-500">
                            <span className="flex items-center gap-1"><ArrowRight size={14} className="-rotate-90"/> {question.upvotes || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare size={14}/> {question.answers?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat}
                    href={`/ask-anything?q=${search}&category=${cat}&sort=${sort}`}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors ${
                      category === cat 
                        ? 'bg-[#C9A227]/10 text-[#C9A227]' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
