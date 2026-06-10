import { useState, useEffect } from 'react';
import { FileText, ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function LicenseRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { let ignore = false; (async () => { const { data } = await supabase.from('license_requests').select('*, tracks(title)').order('created_at', { ascending: false }); if (!ignore) { if (data) setRequests(data); setLoading(false); } })(); return () => { ignore = true; }; }, []);

  const updateStatus = async (id: string, status: string) => {
    await (supabase.from('license_requests') as any).update({ status }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <Link to="/admin/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>
      <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">License Requests</h1>
      <p className="text-neutral-400 font-sans text-sm mb-8">Track and process sync licensing requests.</p>

      {loading ? (
        <div className="text-neutral-500 font-sans">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-neutral-500 font-sans text-center py-12 border border-neutral-800 bg-neutral-900">
          <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-700" />
          <p>No license requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-neutral-900 border border-neutral-800 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-bold font-sans">{r.tracks?.title || 'Unknown Track'}</h3>
                  <p className="text-xs text-neutral-500 font-sans">{r.requester_email}{r.company ? ` · ${r.company}` : ''}</p>
                  {r.project_name && <p className="text-xs text-neutral-400 font-sans mt-1">Project: {r.project_name}</p>}
                  {r.use_type && <p className="text-xs text-neutral-400 font-sans">Use: {r.use_type}</p>}
                  {r.budget_range && <p className="text-xs text-neutral-400 font-sans">Budget: {r.budget_range}</p>}
                  {r.deadline && <p className="text-xs text-neutral-400 font-sans">Deadline: {r.deadline}</p>}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 border ${
                  r.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  r.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  r.status === 'licensed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}>{r.status}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-800">
                  <button onClick={() => updateStatus(r.id, 'approved')} className="flex items-center bg-green-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-green-500 transition-colors">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                  </button>
                  <button onClick={() => updateStatus(r.id, 'rejected')} className="flex items-center bg-red-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-500 transition-colors">
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </button>
                </div>
              )}
              <p className="text-[10px] text-neutral-600 font-mono mt-3">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
