'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QAContentEditor } from '@/components/qa/QAContentEditor';

export default function SubmitAnswerForm({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content === '<p><br></p>') {
      alert('Please write an answer before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/qa/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          content,
          authorName: authorName.trim() || 'Anonymous User',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setContent('');
        setAuthorName('');
        router.refresh();
      } else {
        alert(data.error || 'Failed to submit answer.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <h4 className="text-green-800 font-bold text-lg mb-2">Thank you for your comment!</h4>
        <p className="text-green-700">Your comment has been successfully published.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-4 px-6 py-2 bg-green-100 text-green-800 font-medium rounded-lg hover:bg-green-200 transition-colors"
        >
          Submit another answer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name (Optional)
        </label>
        <input 
          type="text" 
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="How should we display your name?"
          className="w-full max-w-md px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer
        </label>
        <QAContentEditor 
          value={content}
          onChange={setContent}
          placeholder="Share your knowledge and help the community..."
          isAdmin={false} // Public users get limited toolbar
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#C9A227] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#B8860B] transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:transform-none"
        >
          {loading ? 'Submitting...' : 'Post Your Answer'}
        </button>
      </div>
    </form>
  );
}
