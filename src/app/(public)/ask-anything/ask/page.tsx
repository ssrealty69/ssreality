'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { QAContentEditor } from '@/components/qa/QAContentEditor';
import Link from 'next/link';

export default function AskQuestionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authorName: '',
    category: 'General',
    answerContent: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/qa/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting question');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-4">Question Submitted!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for asking. Your question has been successfully published.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { setSuccess(false); setFormData({ title: '', description: '', authorName: '', category: 'General', answerContent: '' }); }}
              className="bg-[#C9A227] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B8860B] transition-colors"
            >
              Ask Another Question
            </button>
            <Link 
              href="/ask-anything"
              className="text-gray-500 font-medium hover:text-gray-900 transition-colors py-3"
            >
              Return to Q&A Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <Link 
          href="/ask-anything"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#C9A227] transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to all questions
        </Link>

        <div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mb-4">
            Ask the Community
          </h1>
          <p className="text-gray-600">
            Get advice and answers about plots, flats, investments, and more from our experts and community members.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Your Question <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. What is the process of buying a plot in Gurgaon?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none transition-all font-medium text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-2">Keep your question clear and concise.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none transition-all font-medium text-gray-900 appearance-none"
            >
              <option value="Plots">Plots</option>
              <option value="Flats">Flats</option>
              <option value="Apartments">Apartments</option>
              <option value="Villas">Villas</option>
              <option value="Investment">Investment</option>
              <option value="Legal">Legal</option>
              <option value="Location">Location</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Additional Details (Optional)
            </label>
            <textarea 
              rows={5}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Add more context or details to help people answer your question better..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none transition-all resize-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Your Answer / Comment (Optional)
            </label>
            <QAContentEditor 
              value={formData.answerContent}
              onChange={(val) => setFormData({...formData, answerContent: val})}
              placeholder="If you already know the answer or want to add a comment, you can do it here..."
              isAdmin={false}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Your Name (Optional)
            </label>
            <input 
              type="text" 
              value={formData.authorName}
              onChange={e => setFormData({...formData, authorName: e.target.value})}
              placeholder="How should we display your name?"
              className="w-full md:w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none transition-all text-gray-900"
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#C9A227] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#B8860B] transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Post Question'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
