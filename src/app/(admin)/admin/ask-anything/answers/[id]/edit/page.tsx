'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { QAContentEditor } from '@/components/qa/QAContentEditor';

export default function EditAnswerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [questions, setQuestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    questionId: '',
    content: '',
    authorName: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch all questions for the dropdown
    fetch('/api/admin/qa/questions?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
        }
      });
    
    // Fetch the answer being edited
    fetch(`/api/admin/qa/answers/${unwrappedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFormData({
            questionId: data.answer.questionId?._id || data.answer.questionId || '',
            content: data.answer.content,
            authorName: data.answer.authorName,
            status: data.answer.status
          });
        }
      })
      .finally(() => setLoading(false));
  }, [unwrappedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      alert('Answer content cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/qa/answers/${unwrappedParams.id}`, {
        method: 'PUT',
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
      alert('Error updating answer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ask-anything/answers" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900">Edit Answer</h1>
          <p className="text-gray-500 mt-1">Update community or official answer.</p>
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
            placeholder="Write your answer here..."
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
            disabled={saving}
            className="bg-[#C9A227] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#B8860B] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
