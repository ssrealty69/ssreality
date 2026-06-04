'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { QAContentEditor } from '@/components/qa/QAContentEditor';

export default function NewAnswerPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    questionId: '',
    content: '',
    authorName: 'Admin',
    status: 'published'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all questions to populate dropdown
    fetch('/api/admin/qa/questions?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
          if (data.questions.length > 0) {
            setFormData(prev => ({ ...prev, questionId: data.questions[0]._id }));
          }
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      alert('Answer content cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/qa/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/ask-anything/answers');
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ask-anything/answers" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900">Post Official Answer</h1>
          <p className="text-gray-500 mt-1">Provide an authoritative answer to a community question.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Question</label>
          <select
            required
            value={formData.questionId}
            onChange={e => setFormData({...formData, questionId: e.target.value})}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
          >
            {questions.map(q => (
              <option key={q._id} value={q._id}>{q.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Answer Content</label>
          <QAContentEditor 
            value={formData.content}
            onChange={(val) => setFormData({...formData, content: val})}
            placeholder="Write your official answer here..."
            isAdmin={true}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
            <input 
              type="text" 
              value={formData.authorName}
              onChange={e => setFormData({...formData, authorName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
            >
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#C9A227] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#B8860B] transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      </form>
    </div>
  );
}
