'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitProjectModal({ isOpen, onClose, onSuccess }: SubmitProjectModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Marketing');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jaugkkpkmlzfeklnakil.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
      setErrorMsg('Supabase API key is missing. Please check your .env configuration.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase.from('projects').insert([
        {
          title,
          url,
          description,
          category,
          current_bid: 0,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setTitle('');
      setUrl('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error adding project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upload Your Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My Super SaaS"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Website URL
            </label>
            <input
              type="url"
              required
              placeholder="https://mysaas.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="Marketing">Marketing</option>
              <option value="SEO & AI Visibility">SEO & AI Visibility</option>
              <option value="Productivity">Productivity</option>
              <option value="Agents">Agents</option>
              <option value="Crypto">Crypto</option>
              <option value="Developer">Developer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Short Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Brief summary of what your project does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'List Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}