import { Play, ShieldCheck, Download, ChevronLeft, BrainCircuit, Radio, Zap, KeyRound, ShoppingCart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '../lib/supabase';
import { usePlayerStore } from '../store/usePlayerStore';

export default function TrackDetail() {
  const { id } = useParams();
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [licenseEmail, setLicenseEmail] = useState('');
  const [licenseOpen, setLicenseOpen] = useState(false);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    const load = async () => {
      const { data } = await supabase
        .from('tracks')
        .select('*, artists(stage_name, pro_affiliation), track_writers(*), track_files(*)')
        .eq('id', id)
        .single();
      if (!ignore) setTrack(data);
      if (!ignore) setLoading(false);
    };
    load();
    return () => { ignore = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-neutral-800" />
          <div className="h-16 w-96 bg-neutral-800" />
          <div className="h-32 bg-neutral-800" />
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-neutral-500 font-sans">Track not found.</p>
        <Link to="/catalog" className="text-orange-500 text-sm font-bold uppercase tracking-widest mt-4 inline-block">Back to Catalog</Link>
      </div>
    );
  }

  const metadataRows = [
    { label: 'BPM', value: track.bpm, icon: Zap },
    { label: 'Key', value: track.key_signature, icon: KeyRound },
    { label: 'Energy', value: track.energy_level, icon: BrainCircuit },
    { label: 'Genre', value: track.genre, icon: Radio },
  ];

  const handlePlay = () => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artists?.stage_name || 'NcSound Artist',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    });
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/catalog" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Catalog
      </Link>

      {/* Metadata Bar â€” visible at top, shows richness */}
      <div className="flex flex-wrap gap-2 mb-8 p-4 bg-neutral-900/50 border border-neutral-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mr-2 flex items-center"><BrainCircuit className="w-3 h-3 mr-1 text-orange-500" /> Metadata:</span>
        {track.mood_tags?.map((m: string) => (
          <span key={m} className="text-[10px] uppercase font-bold tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1">{m}</span>
        ))}
        {track.instrumentation?.map((i: string) => (
          <span key={i} className="text-[10px] uppercase font-bold tracking-widest bg-neutral-800 text-neutral-300 px-2 py-1">{i}</span>
        ))}
        {track.ai_contribution && (
          <span className="text-[10px] uppercase font-bold tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1">AI-Assisted</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-orange-500 text-black text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">{track.genre || 'Various'}</span>
                {track.isrc && <span className="text-neutral-500 text-[10px] font-mono tracking-widest">{track.isrc}</span>}
                <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">Pre-Cleared</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-heading font-bold uppercase tracking-wider text-white leading-none">{track.title}</h1>
              <p className="text-xl font-sans text-neutral-400 mt-2 font-medium">{track.artists?.stage_name || 'NcSound Artist'}</p>
            </div>
            <button type="button" onClick={handlePlay} className="h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(249,115,22,0.4)] flex-shrink-0">
              <Play className="w-8 h-8 ml-1" />
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metadataRows.map(row => row.value && (
              <div key={row.label} className="bg-neutral-900 p-4 border border-neutral-800">
                <row.icon className="w-4 h-4 text-orange-500 mb-1" />
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{row.label}</span>
                <span className="block text-xl font-mono text-white mt-1">{row.value}</span>
              </div>
            ))}
            {track.energy_level && (
              <div className="bg-neutral-900 p-4 border border-neutral-800">
                <BrainCircuit className="w-4 h-4 text-orange-500 mb-1" />
                <span className="block text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Energy</span>
                <span className="block text-xl font-heading text-white mt-1">{track.energy_level}</span>
              </div>
            )}
          </div>

          {/* Mood & Instrumentation Tags */}
          <div className="grid grid-cols-2 gap-6">
            {track.mood_tags?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Mood Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {track.mood_tags?.map((m: string) => (
                    <span key={m} className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-sm text-white font-sans">{m}</span>
                  ))}
                </div>
              </div>
            )}
            {track.instrumentation?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Instrumentation</h3>
                <div className="flex flex-wrap gap-2">
                  {track.instrumentation?.map((i: string) => (
                    <span key={i} className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-sm text-white font-sans">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Writer Splits */}
          {track.track_writers?.length > 0 && (
            <div>
              <h3 className="text-lg font-heading uppercase tracking-wider text-orange-500 mb-4 border-b border-neutral-800 pb-2">Writer Splits</h3>
              <div className="space-y-2">
                {track.track_writers.map((w: any) => (
                  <div key={w.id} className="flex justify-between items-center bg-neutral-900 border border-neutral-800 px-4 py-3">
                    <div>
                      <span className="text-white font-bold font-sans text-sm">{w.writer_name}</span>
                      {w.pro_affiliation && <span className="text-neutral-500 text-xs ml-3 font-sans">{w.pro_affiliation}</span>}
                    </div>
                    <div className="text-right font-mono text-sm">
                      <span className="text-orange-500">W: {w.writer_share ?? 0}%</span>
                      {(w.publisher_share ?? 0) > 0 && <span className="text-neutral-400 ml-3">P: {w.publisher_share ?? 0}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Versions */}
          {track.track_files?.length > 0 && (
            <div>
              <h3 className="text-lg font-heading uppercase tracking-wider text-orange-500 mb-4 border-b border-neutral-800 pb-2">Available Files</h3>
              <div className="flex flex-wrap gap-3">
                {track.track_files.map((f: any) => (
                  <div key={f.id} className="flex items-center bg-neutral-900 border border-neutral-800 px-4 py-2">
                    <Download className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-sm font-bold uppercase tracking-widest text-white">{f.file_type}</span>
                    {f.is_watermarked && <span className="text-[10px] text-neutral-500 ml-2">(watermarked)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ownership */}
          <div className="border-t border-neutral-800 pt-6">
            <div className="flex items-center gap-6 text-xs font-sans text-neutral-400">
              {track.owns_master && <span className="flex items-center"><ShieldCheck className="w-3 h-3 text-green-500 mr-1" /> Master Owned</span>}
              {track.owns_publishing && <span className="flex items-center"><ShieldCheck className="w-3 h-3 text-green-500 mr-1" /> Publishing Owned</span>}
              <span className="text-neutral-600">Status: {track.status}</span>
              <span className="text-neutral-600">Visibility: {track.visibility}</span>
            </div>
          </div>
        </div>

        {/* Right Column â€” Licensing */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-2xl font-heading uppercase tracking-wider text-white mb-6">License This Track</h3>
            <p className="text-sm font-sans text-neutral-400 mb-6">One-stop clearance. Master + publishing rights pre-cleared. 24-hour turnaround.</p>
            <Dialog.Root open={licenseOpen} onOpenChange={setLicenseOpen}>
              <Dialog.Trigger asChild>
                <button type="button" className="w-full bg-orange-500 text-black px-6 py-4 font-bold uppercase tracking-widest shadow-lg hover:bg-orange-400 transition-colors">
                  Request License
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-neutral-900 border border-neutral-800 p-8 w-full max-w-md shadow-2xl">
                  <Dialog.Title className="text-2xl font-heading uppercase tracking-wider text-white mb-2">License Request</Dialog.Title>
                  <Dialog.Description className="text-sm font-sans text-neutral-400 mb-6">Enter your email to receive a license quote for this track.</Dialog.Description>
                  <div className="space-y-4">
                    <input value={licenseEmail} onChange={e => setLicenseEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" />
                    <button type="button" onClick={async () => {
                      if (!licenseEmail) return toast.error('Enter your email');
                      await supabase.from('license_requests').insert({ track_id: track?.id, requester_email: licenseEmail, status: 'pending' } as any);
                      toast.success('License request submitted!');
                      setLicenseOpen(false);
                      setLicenseEmail('');
                    }} className="w-full bg-orange-500 text-black py-3 font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors">
                      Submit Request
                    </button>
                  </div>
                  <Dialog.Close className="absolute top-4 right-4 text-neutral-500 hover:text-white">
                    âœ•
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <p className="text-[10px] font-sans text-neutral-500 text-center uppercase tracking-widest mt-4">24-48hr turnaround average</p>
          </div>

          <div className="border border-neutral-800 p-6 bg-black">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-heading uppercase tracking-wider text-white">Rights Status</h3>
            </div>
            <div className="space-y-3 font-sans text-sm">
              <div className="flex justify-between items-center bg-neutral-900 p-3 border border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Master</span>
                <span className="text-green-500 text-xs font-bold">{track.owns_master ? 'Owned 100%' : 'Not Owned'}</span>
              </div>
              <div className="flex justify-between items-center bg-neutral-900 p-3 border border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Publishing</span>
                <span className="text-green-500 text-xs font-bold">{track.owns_publishing ? 'Owned 100%' : 'Not Owned'}</span>
              </div>
              <div className="flex justify-between items-center bg-neutral-900 p-3 border border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Clearance</span>
                <span className="text-green-500 text-xs font-bold">One-Stop</span>
              </div>
              <div className="flex justify-between items-center bg-neutral-900 p-3 border border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">PRO</span>
                <span className="text-neutral-300 text-xs">{track.artists?.pro_affiliation || 'â€”'}</span>
              </div>
            </div>
          </div>

          {/* Self-Serve Licensing */}
          <LiveLicensePurchase trackId={track?.id} trackTitle={track?.title} />
        </div>
        </div>
      </div>
  );
}

function LiveLicensePurchase({ trackId, trackTitle }: { trackId?: string; trackTitle?: string }) {
  const [selected, setSelected] = useState('Micro');
  const [buying, setBuying] = useState(false);
  const [email, setEmail] = useState('');

  const TIERS = [
    { name: 'Micro', desc: 'Podcast, YT <100k', price: 75 },
    { name: 'Creator', desc: 'YT 100k+, Social Ad', price: 200 },
    { name: 'Indie Film', desc: 'Short, Web Series', price: 350 },
    { name: 'Standard', desc: 'Indie Feature, Regional Ad', price: 750 },
  ];

  const handleBuy = async () => {
    if (!trackId) return;
    if (!email) { alert('Enter your email'); return; }
    setBuying(true);
    try {
      const res = await fetch('/api/license/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, licenseType: selected.toLowerCase(), price: TIERS.find(t => t.name === selected)?.price, buyerEmail: email, title: trackTitle }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Checkout failed');
    } catch { alert('Checkout failed'); }
    setBuying(false);
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-xl font-heading uppercase tracking-wider text-white flex items-center mb-4"><ShoppingCart className="w-5 h-5 mr-2 text-orange-500" /> Self-Serve Licenses</h3>
      <div className="space-y-2 mb-4">
        {TIERS.map(t => (
          <button type="button" key={t.name} onClick={() => setSelected(t.name)}
            className={'w-full flex justify-between items-center p-3 border transition-colors text-left ' + (selected === t.name ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800')}>
            <div>
              <span className="text-white font-bold text-sm block">{t.name}</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{t.desc}</span>
            </div>
            <span className="text-orange-500 font-mono font-bold">${t.price}</span>
          </button>
        ))}
      </div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
        className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-sm focus:border-orange-500 outline-none mb-3 font-sans" />
      <button type="button" onClick={handleBuy} disabled={buying}
        className="w-full bg-orange-500 text-black px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <ShoppingCart className="w-4 h-4" /> {buying ? 'Processing...' : 'Buy ' + selected + ' License â€” $' + TIERS.find(t => t.name === selected)?.price}
      </button>
    </div>
  );
}
