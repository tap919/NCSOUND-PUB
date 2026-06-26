import { useState, useEffect, useRef } from 'react';
import { BrainCircuit, ChevronLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Brief } from '../../types';

export default function Briefs() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [matches, setMatches] = useState<{ track_id: string; title: string; score: number }[]>([]);
  const [matching, setMatching] = useState(false);
  const matchRequestId = useRef(0);

  useEffect(() => { let ignore = false; (async () => { const { data } = await supabase.from('briefs').select('*').order('created_at', { ascending: false }); if (!ignore) { if (data) setBriefs(data); setLoading(false); } })(); return () => { ignore = true; }; }, []);

  const matchBrief = async (brief: any) => {
    setSelectedBrief(brief);
    setMatching(true);
    const reqId = ++matchRequestId.current;
    let query = supabase.from('tracks').select('*, artists(stage_name)').eq('status', 'active');

    if (brief.use_type) query = query.ilike('genre', `%${brief.use_type}%`);
    if (brief.bpm_min) query = query.gte('bpm', brief.bpm_min);
    if (brief.bpm_max) query = query.lte('bpm', brief.bpm_max);
    if (brief.mood_tags?.length > 0) query = query.contains('mood_tags', brief.mood_tags);

    const { data } = await query.limit(10);
    if (reqId === matchRequestId.current) {
      setMatches(data || []);
      setMatching(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await (supabase.from('briefs') as any).update({ status }).eq('id', id);
    setBriefs(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <Link to="/admin/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>
      <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">Briefs & Matching</h1>
      <p className="text-neutral-400 font-sans text-sm mb-8">Review supervisor briefs and match tracks from the catalog.</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Briefs List */}
        <div>
          <h2 className="text-lg font-heading uppercase tracking-wider text-white mb-4 border-b border-neutral-800 pb-2">Open Briefs</h2>
          {loading ? (
            <div className="text-neutral-500 font-sans">Loading...</div>
          ) : briefs.length === 0 ? (
            <div className="text-neutral-500 font-sans text-center py-8 border border-neutral-800 bg-neutral-900">
              <BrainCircuit className="w-8 h-8 mx-auto mb-3 text-neutral-700" />
              <p className="text-sm">No briefs yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {briefs.map(b => (
                <div key={b.id} className={`bg-neutral-900 border p-4 cursor-pointer transition-colors ${
                  selectedBrief?.id === b.id ? 'border-orange-500' : 'border-neutral-800 hover:border-neutral-600'
                }`} onClick={() => matchBrief(b)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold font-sans text-sm">{b.project_name}</h3>
                      <p className="text-xs text-neutral-500 font-sans">{b.use_type || 'No genre specified'}{b.requester_email ? ` · ${b.requester_email}` : ''}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border ${
                      b.status === 'matched' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>{b.status}</span>
                  </div>
                  {(b.bpm_min || b.bpm_max) && (
                    <p className="text-[10px] text-neutral-600 font-mono mt-2">
                      BPM: {b.bpm_min || '—'}–{b.bpm_max || '—'} · {b.mood_tags?.join(', ') || 'No mood tags'}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); updateStatus(b.id, b.status === 'matched' ? 'open' : 'matched'); }} className="flex items-center text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-black px-2 py-1 hover:bg-orange-400 transition-colors">
                      <ArrowRight className="w-3 h-3 mr-1" /> {b.status === 'matched' ? 'Reopen' : 'Mark Matched'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Match Results */}
        <div>
          <h2 className="text-lg font-heading uppercase tracking-wider text-white mb-4 border-b border-neutral-800 pb-2">
            {selectedBrief ? `Matches for: ${selectedBrief.project_name}` : 'Select a brief to match'}
          </h2>
          {matching ? (
            <div className="text-neutral-500 font-sans animate-pulse">Matching tracks...</div>
          ) : !selectedBrief ? (
            <div className="text-neutral-500 font-sans text-center py-8 border border-neutral-800 bg-neutral-900">
              <BrainCircuit className="w-8 h-8 mx-auto mb-3 text-neutral-700" />
              <p className="text-sm">Click a brief to generate matches</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-neutral-500 font-sans text-center py-8 border border-neutral-800 bg-neutral-900">
              <p className="text-sm">No matching tracks found. Broaden the brief criteria.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map(t => (
                <Link key={t.id} to={`/catalog/${t.id}`} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition-colors p-4 group">
                  <div>
                    <h4 className="text-sm font-heading uppercase tracking-wider text-white">{t.title}</h4>
                    <p className="text-[10px] text-neutral-500 font-sans">{t.artists?.stage_name || 'NcSound'}</p>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    {t.genre && <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 uppercase font-bold">{t.genre}</span>}
                    {t.bpm && <span className="text-neutral-500 font-mono">{t.bpm}BPM</span>}
                    <ArrowRight className="w-3 h-3 text-neutral-600" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
