import { ShieldCheck, Music, Zap, ArrowRight, Mail, UserCheck, Headphones, BrainCircuit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SupervisorPortal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    supabase.from('tracks').select('*, artists(stage_name)').eq('status', 'active').limit(4).order('created_at', { ascending: false }).then(({ data }) => {
      if (!ignore && data) setRecentTracks(data);
    });
    return () => { ignore = true; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/catalog');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 border border-orange-500/30 bg-orange-500/10 mb-4">
            <ShieldCheck className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-orange-500 text-[10px] font-bold tracking-widest uppercase">Verified Access</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-heading font-bold uppercase tracking-wider text-white">
            Music Supervisor <span className="text-orange-500 font-graffiti">Hub</span>
          </h1>
          <p className="mt-4 text-lg font-sans text-neutral-400 max-w-2xl mx-auto">
            Browse pre-cleared tracks. Submit briefs. Get AI-matched catalog shortlists within 12 hours. 
            Every track is one-stop licensed — master + publishing, no delays.
          </p>
        </div>

        {/* Key Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-neutral-900 border border-neutral-800 p-6 text-center">
            <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-2">24-Hour Clearance</h3>
            <p className="text-sm font-sans text-neutral-400">Every track is pre-cleared for master + sync rights. License in one click.</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 text-center">
            <Headphones className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-2">Smart Brief Matching</h3>
            <p className="text-sm font-sans text-neutral-400">Submit a brief → our engine matches mood, genre, BPM, and energy against the catalog. Receive a shortlist in hours.</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 text-center">
            <Music className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-2">Rich Metadata</h3>
            <p className="text-sm font-sans text-neutral-400">Every track tagged with mood, instrumentation, energy level, key, BPM, and genre. Search by feel, not just name.</p>
          </div>
        </div>

        {/* Catalog Preview */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-2xl font-heading uppercase tracking-wider text-white">Recently Added to Catalog</h2>
            <Link to="/catalog" className="text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors flex items-center">
              Browse All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentTracks.map((track) => (
              <Link key={track.id} to={`/catalog/${track.id}`} className="group block bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition-all">
                <div className="aspect-square bg-neutral-800 flex items-center justify-center">
                  <Music className="w-8 h-8 text-neutral-700" />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-heading uppercase tracking-wider text-white truncate">{track.title}</h4>
                  <p className="text-[10px] text-neutral-500 font-sans truncate">{track.artists?.stage_name || 'NcSound Artist'}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {track.genre && <span className="text-[10px] uppercase font-bold tracking-widest bg-neutral-800 text-neutral-400 px-1.5 py-0.5">{track.genre}</span>}
                    {track.bpm && <span className="text-[10px] font-mono text-neutral-500">{track.bpm} BPM</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Login / CTA Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Verified Login */}
          <div className="bg-neutral-900 border border-neutral-800 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <UserCheck className="w-8 h-8 text-neutral-800" />
            </div>
            <h2 className="text-2xl font-heading uppercase tracking-wider text-white mb-2">Verified Login</h2>
            <p className="font-sans text-sm text-neutral-400 mb-8">Access the full catalog, save tracks, and download assets.</p>
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 text-sm">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-sans" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Access Key</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-sans" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-orange-500 px-4 py-4 text-sm font-bold uppercase tracking-widest text-black hover:bg-orange-400 transition-colors shadow-lg disabled:opacity-50">
                {loading ? 'Verifying...' : 'Enter Catalog'}
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 p-8">
              <h3 className="text-xl font-heading uppercase tracking-wider text-white mb-2">Submit a Brief</h3>
              <p className="font-sans text-sm text-neutral-400 mb-6">Need a specific sound? Describe what you're looking for — mood, genre, BPM, reference tracks. Our AI engine returns a ranked shortlist within 12 hours.</p>
              <Link to="/submit-brief" className="inline-flex items-center gap-2 bg-neutral-900 px-6 py-3 border border-neutral-800 text-sm font-bold uppercase tracking-widest text-white hover:border-orange-500 transition-colors">
                <Mail className="w-4 h-4" /> Submit a Brief
              </Link>
            </div>
            
            <div className="bg-black border border-orange-500/30 p-8 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-heading uppercase tracking-wider text-white">Need Access?</h3>
              </div>
              <p className="font-sans text-sm text-neutral-400 mb-6">Are you a music supervisor, ad agency producer, or content creator looking for direct catalog access? Apply for a verified account.</p>
              <Link to="/supervisor/register" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">
                Apply for Access <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metadata Badge */}
        <div className="mt-20 p-8 bg-neutral-900/50 border border-neutral-800 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-white">Every Track Tagged With:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            {['Mood', 'Genre', 'BPM', 'Key Signature', 'Energy Level', 'Instrumentation', 'Vocal Type', 'AI Contribution'].map(tag => (
              <span key={tag} className="bg-neutral-800 border border-neutral-700 px-3 py-1.5 text-neutral-300">{tag}</span>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-500 font-sans">17 data points per track — find what you need, fast.</p>
        </div>
      </div>
    </div>
  );
}
