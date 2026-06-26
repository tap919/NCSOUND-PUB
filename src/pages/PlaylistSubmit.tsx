import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, Loader2, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function PlaylistSubmit() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [credits, setCredits] = useState<{ remaining: number; monthly_limit: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    artistName: '', trackTitle: '', genre: '', bpm: '', mood_tags: '', description: '',
  });

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    fetch(`/api/playlist/credits/${user.id}`).then(r => r.json()).then(d => { if (!ignore) setCredits(d); }).catch(() => {});
    return () => { ignore = true; };
  }, [user]);

  const handleAnalyze = async () => {
    if (!form.trackTitle) return toast.error('Track title is required');
    setAnalyzing(true);
    try {
      const res = await fetch('/api/playlist/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.trackTitle, artist: form.artistName, genre: form.genre,
          bpm: form.bpm, mood_tags: form.mood_tags.split(',').map(s => s.trim()).filter(Boolean),
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
      setStep(2);
    } catch (err: any) { toast.error(err.message); }
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!user) return toast.error('Sign in to submit');
    if (!form.artistName || !form.trackTitle) return toast.error('Artist name and track title required');
    setSubmitting(true);
    try {
      const res = await fetch('/api/playlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, artistName: form.artistName, trackTitle: form.trackTitle,
          genre: form.genre, bpm: form.bpm, mood_tags: form.mood_tags.split(',').map(s => s.trim()).filter(Boolean),
          description: form.description, quality_score: analysis?.overall_score,
          quality_feedback: analysis?.feedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setCredits(prev => prev ? { ...prev, remaining: prev.remaining - 1 } : prev);
      toast.success('Track submitted!');
    } catch (err: any) { toast.error(err.message); }
    setSubmitting(false);
  };

  return (
    <div className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        ← Back
      </Link>

      <div className="border-b border-neutral-800 pb-8 mb-10">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-wider text-white">
          Submit to <span className="text-orange-500">Playlist</span>
        </h1>
        <p className="mt-2 text-neutral-400 font-sans">AI-powered quality analysis with constructive feedback.</p>
      </div>

      {/* Credits */}
      {credits && (
        <div className="bg-neutral-900 border border-neutral-800 p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Monthly Credits</span>
          </div>
          <span className="font-mono text-white">{credits.remaining}/{credits.monthly_limit} remaining</span>
        </div>
      )}

      {result ? (
        <div className="bg-neutral-900 border border-green-500/30 p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading uppercase tracking-wider text-white mb-2">Submission Received!</h2>
          <p className="text-neutral-400 font-sans mb-6">
            {result.status === 'approved'
              ? 'Your track passed quality analysis and has been added to the playlist queue.'
              : 'Your track is pending review by our team.'}
          </p>
          <Link to="/" className="text-orange-500 text-xs font-bold uppercase tracking-widest hover:text-orange-400">Back to Home</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Step 1: Track Info */}
          <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
            <h2 className="text-lg font-heading uppercase tracking-wider text-white">Track Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Artist Name *</label>
                <input value={form.artistName} onChange={e => setForm(f => ({ ...f, artistName: e.target.value }))} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Track Title *</label>
                <input value={form.trackTitle} onChange={e => setForm(f => ({ ...f, trackTitle: e.target.value }))} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Genre</label>
                <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none">
                  <option value="">Select...</option>
                  <option>Hip-Hop</option><option>R&B</option><option>Trap</option>
                  <option>Boom Bap</option><option>Pop</option><option>Rock</option>
                  <option>Electronic</option><option>Lo-Fi</option><option>Drill</option>
                  <option>House</option><option>Ambient</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">BPM</label>
                <input value={form.bpm} onChange={e => setForm(f => ({ ...f, bpm: e.target.value }))} type="number" className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Mood Tags (comma-separated)</label>
              <input value={form.mood_tags} onChange={e => setForm(f => ({ ...f, mood_tags: e.target.value }))} placeholder="dark, energetic, smooth..." className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans resize-none" placeholder="Tell us about your track..." />
            </div>
            <button type="button" onClick={handleAnalyze} disabled={analyzing} className="bg-orange-500 text-black px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center gap-2">
              {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyze Track'}
            </button>
          </div>

          {/* Step 2: Analysis Results */}
          {analysis && (
            <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
              <h2 className="text-lg font-heading uppercase tracking-wider text-white">AI Analysis Results</h2>
              <div className="grid grid-cols-5 gap-3">
                {['production_quality', 'originality', 'mixing', 'arrangement', 'commercial_potential'].map(cat => (
                  <div key={cat} className="bg-black/50 border border-neutral-800 p-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">{cat.replace(/_/g, ' ')}</div>
                    <div className={`text-2xl font-mono ${analysis[cat] >= 60 ? 'text-green-500' : analysis[cat] >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                      {analysis[cat]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-black/50 border border-neutral-800 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Overall Score</span>
                  <span className={`text-xl font-mono ${analysis.overall_score >= 60 ? 'text-green-500' : 'text-orange-500'}`}>{analysis.overall_score}/100</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${analysis.overall_score >= 60 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${analysis.overall_score}%` }} />
                </div>
              </div>
              {analysis.feedback && (
                <div className="bg-black/50 border border-neutral-800 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Feedback</p>
                  <p className="text-sm font-sans text-neutral-300">{analysis.feedback}</p>
                </div>
              )}
              {analysis.similar_artists?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Similar Artists</p>
                  <div className="flex gap-2 flex-wrap">
                    {analysis.similar_artists.map((a: string) => (
                      <span key={a} className="bg-neutral-800 border border-neutral-700 px-3 py-1 text-xs text-neutral-300">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              <button type="button" onClick={handleSubmit} disabled={submitting || !user} className="bg-orange-500 text-black px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Upload className="w-4 h-4" /> Submit to Playlist</>}
              </button>
              {!user && <p className="text-xs text-neutral-500 font-sans">Sign in to submit your track.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
