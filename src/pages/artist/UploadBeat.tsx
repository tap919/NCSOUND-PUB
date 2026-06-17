import React, { useState } from 'react';
import { Upload as UploadIcon, Music, DollarSign, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function UploadBeat() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [leasePrice, setLeasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;
    setLoading(true);
    try {
      const { data: artist } = await supabase
        .from('artists').select('*').eq('user_id', user.id).single();
      const a = artist as unknown as { id: string } | null;
      if (!a) { toast.error('Artist profile not found.'); setLoading(false); return; }
      const price = leasePrice ? Math.max(0, parseFloat(leasePrice)) : null;
      if (leasePrice && (price === null || isNaN(price) || price <= 0)) {
        toast.error('Invalid lease price');
        setLoading(false);
        return;
      }
      await supabase.from('beat_store_products').insert({
        artist_id: a.id,
        title,
        genre: genre || null,
        lease_price: price,
        status: 'active'
      } as any);
      toast.success('Beat published to store!');
      setSuccess(true);
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto text-center">
        <CheckCircle2 className="w-20 h-20 text-orange-500 mx-auto mb-6" />
        <h2 className="text-3xl font-heading uppercase text-white mb-4">Beat Uploaded!</h2>
        <p className="text-neutral-400 font-sans mb-8">Your beat is now live in the Beat Store.</p>
        <div className="flex gap-4 justify-center">
          <button type="button" onClick={() => { setSuccess(false); setTitle(''); setGenre(''); setBpm(''); setLeasePrice(''); }} className="bg-orange-500 text-black px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors">
            Upload Another
          </button>
          <Link to="/artist/dashboard" className="border border-neutral-700 text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:border-orange-500 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <Link to="/artist/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>
      <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">Upload <span className="text-orange-500">Beat</span></h1>
      <p className="text-neutral-400 font-sans text-sm mb-10">List a new beat in the store. Audio file upload coming soon — for now, set your listing details.</p>

      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
        <div>
          <label className="flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            <Music className="w-3 h-3 mr-2 text-orange-500" /> Beat Title *
          </label>
          <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" placeholder="e.g. Midnight Drive" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Genre</label>
            <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans">
              <option value="">Select...</option>
              <option>Boom Bap</option>
              <option>Trap</option>
              <option>Drill</option>
              <option>R&B</option>
              <option>Synthwave</option>
              <option>Lo-Fi</option>
              <option>Pop</option>
              <option>Cinematic</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">BPM</label>
            <input type="number" value={bpm} onChange={e => setBpm(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-mono" placeholder="140" />
          </div>
        </div>
        <div>
          <label className="flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            <DollarSign className="w-3 h-3 mr-2 text-orange-500" /> Lease Price (USD)
          </label>
          <input type="number" step="0.01" value={leasePrice} onChange={e => setLeasePrice(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-mono" placeholder="29.99" />
        </div>
        <div className="border-t border-neutral-800 pt-6">
          <div className="border-2 border-dashed border-neutral-700 hover:border-orange-500 bg-neutral-950 p-8 text-center transition-colors cursor-pointer mb-6">
            <UploadIcon className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest text-white">Drag & Drop MP3/WAV</p>
            <p className="text-[10px] text-neutral-500 font-sans mt-1">Coming in Phase 2 — file upload via Supabase Storage</p>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-black py-4 text-sm font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors shadow-lg disabled:opacity-50">
          {loading ? 'Publishing...' : 'Publish Beat'}
        </button>
      </form>
    </div>
  );
}
