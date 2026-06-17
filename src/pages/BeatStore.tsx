import { ShoppingCart, Headphones, Zap, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { BeatStoreProduct } from '../types';

const GENRES = ['All', 'Soul', 'Funk', 'R&B', 'Hip-Hop', 'Trap', 'Drill', 'Jazz', 'Cinematic', 'Electronic'];

export default function BeatStore() {
  const [beats, setBeats] = useState<BeatStoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeGenre, setActiveGenre] = useState('All');

  useEffect(() => { let ignore = false; (async () => { const { data } = await supabase.from('beat_store_products').select('*').eq('status', 'active').order('created_at', { ascending: false }); if (!ignore && data) setBeats(data); if (!ignore) setLoading(false); })(); return () => { ignore = true; }; }, []);

  const filtered = activeGenre === 'All' ? beats : beats.filter(b => b.genre === activeGenre);

  const handleCheckout = async (beat: any) => {
    try {
      setLoadingId(beat.id);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId: beat.id, title: beat.title, priceStr: beat.lease_price?.toString() || '1.00' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl text-center mb-16 mx-auto">
          <div className="inline-flex items-center px-3 py-1 border border-orange-500/30 bg-orange-500/10 mb-4">
            <Zap className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Every Beat = Sync-Ready</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-wider text-white mb-2">Beat Store</h2>
          <p className="mt-4 text-lg font-sans text-neutral-400">
            Lease instrumentals for your projects. Every beat is also registered in our sync catalog — when you lease, your track gets pitched to music supervisors for TV, film, and ad placements automatically.
          </p>
        </div>

        {/* First Wave Banner */}
        <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/5 to-orange-500/20 border-2 border-orange-500/30 p-6 mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-3">
            <Sparkles className="w-3 h-3" /> First Wave
          </div>
          <h3 className="text-3xl font-graffiti text-orange-500 mb-2">$1 Leases — Limited Time</h3>
          <p className="text-sm font-sans text-neutral-300 max-w-2xl mx-auto">
            All first-wave beats are available for just $1 lease. 80/20 split agreement included — you keep 80% of sync revenue. 
            This special pricing helps artists and producers get started with professional instrumentals at zero risk.
          </p>
        </div>

        {/* Sync Pipeline Banner */}
        <div className="bg-gradient-to-r from-orange-500/10 via-neutral-900 to-orange-500/10 border border-orange-500/20 p-4 mb-8 flex items-center justify-center gap-4 flex-wrap text-center">
          <ShieldCheck className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">Sync Pipeline Active</span>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-xs font-sans text-neutral-400">Every beat you buy is automatically eligible for sync licensing placements. No extra steps.</span>
        </div>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Filter className="w-4 h-4 text-neutral-500 mr-1 self-center" />
          {GENRES.map(g => (
            <button type="button" key={g} onClick={() => setActiveGenre(g)}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                activeGenre === g ? 'bg-orange-500 text-black border-orange-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500 font-sans">Loading beats...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 font-sans border border-neutral-800 bg-neutral-900">
            <Headphones className="w-12 h-12 mx-auto mb-4 text-neutral-700" />
            <p>No beats in this category yet.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-11 gap-4 px-8 py-4 border-b border-neutral-800 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              <div className="col-span-3">Title</div>
              <div className="col-span-2 text-center">Genre</div>
              <div className="col-span-1 text-center">BPM</div>
              <div className="col-span-1 text-center">Time</div>
              <div className="col-span-1 text-center">Lease</div>
              <div className="col-span-1 text-center">Sync</div>
              <div className="col-span-2"></div>
            </div>
            <ul className="divide-y divide-neutral-800">
              {filtered.map((beat) => (
                <li key={beat.id} className="group hover:bg-white/5 transition-colors">
                  <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-4 px-4 sm:px-8 py-4">
                    <div className="col-span-3 text-center sm:text-left">
                      <h4 className="text-white font-heading tracking-wider text-lg">{beat.title}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500">Tap919</span>
                      {beat.is_first_wave && (
                        <span className="ml-2 text-[9px] uppercase font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5">
                          $1 Wave
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="inline-flex text-[10px] uppercase font-bold tracking-widest bg-neutral-800 text-neutral-300 px-2 py-1">
                        {beat.genre || '—'}
                      </span>
                    </div>
                    <div className="col-span-1 text-center font-mono text-sm text-neutral-400">
                      {beat.bpm || '—'}
                    </div>
                    <div className="col-span-1 text-center font-mono text-xs text-neutral-500">
                      {beat.duration_seconds ? `${Math.floor(beat.duration_seconds / 60)}:${String(beat.duration_seconds % 60).padStart(2, '0')}` : '—'}
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-white font-mono text-base font-bold">
                        {beat.is_first_wave ? '$1' : `$${beat.lease_price?.toFixed(0) || '—'}`}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30 px-1.5 py-1">
                        <Zap className="w-2.5 h-2.5 mr-1" /> 80/20
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleCheckout(beat)}
                        disabled={loadingId === beat.id}
                        className="flex items-center text-[10px] font-bold uppercase tracking-widest bg-neutral-800 hover:bg-orange-500 text-white hover:text-black px-4 py-2 border border-neutral-700 hover:border-orange-500 transition-colors disabled:opacity-50"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        {loadingId === beat.id ? '...' : 'Lease'}
                      </button>
                    </div>
                  </div>
                  {beat.description && (
                    <div className="px-4 sm:px-8 pb-3 -mt-1">
                      <p className="text-[11px] font-sans text-neutral-600 line-clamp-1">{beat.description}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing Tiers */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <h3 className="text-xl font-heading text-white mb-2 tracking-wider">First Wave Lease</h3>
            <p className="text-3xl font-graffiti text-orange-500 mb-4">$1.00</p>
            <ul className="text-sm font-sans text-neutral-400 space-y-2">
              <li>Full MP3 Instrumental</li>
              <li>20% sync split to NcSound</li>
              <li>Non-exclusive rights</li>
              <li className="text-green-400">Sync placement eligible</li>
              <li className="text-orange-400 font-bold">Limited time introductory pricing</li>
            </ul>
          </div>
          <div className="bg-neutral-900 border-2 border-orange-500 p-6 relative transform -translate-y-2 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
              <span className="bg-orange-500 text-black text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 shadow-md">Most Popular</span>
            </div>
            <h3 className="text-xl font-heading text-white mb-2 tracking-wider">Standard Lease</h3>
            <p className="text-3xl font-graffiti text-neutral-500 mb-4">$29.99</p>
            <ul className="text-sm font-sans text-neutral-400 space-y-2">
              <li>High Quality MP3</li>
              <li>Up to 100,000 streams</li>
              <li>Non-exclusive rights</li>
              <li className="text-green-400">Sync placement eligible</li>
              <li className="text-neutral-600 italic">Available after first wave</li>
            </ul>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <h3 className="text-xl font-heading text-white mb-2 tracking-wider">WAV + Stems</h3>
            <p className="text-3xl font-graffiti text-neutral-500 mb-4">$99.99</p>
            <ul className="text-sm font-sans text-neutral-400 space-y-2">
              <li>WAV + MP3 + Stems</li>
              <li>Up to 500,000 streams</li>
              <li>Non-exclusive rights</li>
              <li className="text-green-400">Sync placement eligible</li>
              <li className="text-neutral-600 italic">Available after first wave</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
