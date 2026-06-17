import { useState, useEffect } from 'react';
import { Mail, ChevronLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ContactSubmission } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Inbox() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => { let ignore = false; (async () => { const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1); if (!ignore) { if (error) toast.error('Failed to load inbox'); else if (data) setSubmissions(data); setLoading(false); } })(); return () => { ignore = true; }; }, [page]);

  const remove = async (id: string) => {
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <Link to="/admin/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>
      <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">Inbox</h1>
      <p className="text-neutral-400 font-sans text-sm mb-8">Contact form submissions from the public site.</p>

      {loading ? (
        <div className="text-neutral-500 font-sans">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-neutral-500 font-sans text-center py-12 border border-neutral-800 bg-neutral-900">
          <Mail className="w-12 h-12 mx-auto mb-4 text-neutral-700" />
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(s => (
            <div key={s.id} className="bg-neutral-900 border border-neutral-800 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-bold font-sans">{s.first_name} {s.last_name}</h3>
                  <p className="text-xs text-neutral-500 font-sans">{s.email}{s.company ? ` · ${s.company}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-neutral-800 text-neutral-400 px-2 py-1">{s.type}</span>
                  <button type="button" onClick={() => remove(s.id)} className="text-neutral-600 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-sans text-neutral-300 whitespace-pre-wrap">{s.message}</p>
              <p className="text-[10px] text-neutral-600 font-mono mt-3">{new Date(s.created_at).toLocaleString()}</p>
            </div>
          ))}
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="text-xs font-bold uppercase tracking-widest px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Previous</button>
          <span className="text-xs font-mono text-neutral-600">Page {page + 1}</span>
          <button type="button" disabled={submissions.length < pageSize} onClick={() => setPage(p => p + 1)} className="text-xs font-bold uppercase tracking-widest px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next</button>
        </div>
      </div>
  );
}
