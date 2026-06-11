'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Search } from 'lucide-react';

interface Answer {
  _id: string;
  content: string;
  authorName: string;
  isAdmin?: boolean;
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
  questionId?: { _id: string; slug: string; title: string } | null;
}

export default function AdminAnswersPage() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAnswers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/qa/answers?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setAnswers(data.answers);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  const deleteAnswer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this answer?')) return;
    try {
      const res = await fetch(`/api/admin/qa/answers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAnswers(answers.filter(a => a._id !== id));
      } else {
        alert('Failed to delete answer');
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900">Manage Answers</h1>
          <p className="text-gray-500 mt-1">View, edit, or delete community answers.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search answers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Answer Snippet</th>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading answers...</td>
                </tr>
              ) : answers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No answers found.</td>
                </tr>
              ) : (
                answers.map((answer) => (
                  <tr key={answer._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 line-clamp-1" dangerouslySetInnerHTML={{ __html: answer.content.substring(0, 100) + '...' }}></div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(answer.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 line-clamp-2">
                      {answer.questionId ? (
                         <Link href={`/ask-anything/${answer.questionId.slug}`} className="hover:text-blue-600 hover:underline">
                           {answer.questionId.title}
                         </Link>
                      ) : 'Deleted Question'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {answer.authorName} {answer.isAdmin && <span className="text-xs bg-[#C9A227] text-white px-1.5 py-0.5 rounded ml-1">Admin</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        answer.status === 'published' ? 'bg-green-100 text-green-800' :
                        answer.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {answer.status.charAt(0).toUpperCase() + answer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/ask-anything/answers/${answer._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => deleteAnswer(answer._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
