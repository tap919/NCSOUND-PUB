import { motion } from 'motion/react';
import { ArrowRight, Disc3, Flame, Zap, BrainCircuit, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [featuredTracks, setFeaturedTracks] = useState<any[]>([]);

  useEffect(() => { let ignore = false; (async () => { const { data } = await supabase.from('beat_store_products').select('title, genre, audio_url').eq('status', 'active').order('created_at', { ascending: false }).limit(6); if (!ignore && data) setFeaturedTracks(data.map(b => ({ title: b.title.toUpperCase(), artist: 'Tap919', genre: (b.genre || 'HIP-HOP').toUpperCase(), image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&fit=crop' }))); })(); return () => { ignore = true; }; }, []);

  return (
    <div>
      <SEO title="Home" description="The only beat store that pitches your tracks to music supervisors. Non-exclusive publishing admin for independent producers." />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-neutral-950">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=2600&auto=format&fit=crop" 
            alt="Graffiti Wall" 
            className="w-full h-full object-cover opacity-20 grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:pb-40">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left pt-12"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-none border border-orange-500/50 bg-orange-500/10 mb-6 backdrop-blur-sm">
                <Flame className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Smart Brief Matching + Sync Pipeline</span>
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-white uppercase leading-[0.9]">
                The Only Beat Store That<br />
                <span className="font-graffiti text-orange-500 text-6xl sm:text-7xl lg:text-8xl rotate-[-2deg] inline-block mt-2 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">Pitches Your Tracks to Music Supervisors</span>
              </h1>
              <p className="mt-8 text-lg sm:text-xl text-neutral-300 font-sans max-w-2xl font-medium">
                NcSound is the bridge between underground producers and elite music supervisors. 
                Upload your beats, sell leases, and every track gets automatically pitched for TV, film, and ad placements. 
                Non-exclusive. You keep 100% of your masters. We take 20% on sync placements we personally secure.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <Link
                  to="/submit"
                  className="inline-flex items-center justify-center rounded-none bg-orange-500 px-8 py-4 text-lg font-heading tracking-widest uppercase text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                >
                  Submit Your Catalog
                  <ArrowRight className="ml-3 h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  to="/supervisor"
                  className="inline-flex items-center justify-center rounded-none border-2 border-white/20 bg-black/50 backdrop-blur-sm px-8 py-4 text-lg font-heading tracking-widest uppercase text-white hover:bg-white/10 hover:border-white/40 transition-colors"
                >
                  <Play className="mr-3 h-4 w-4" />
                  Supervisor Access
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mt-16 lg:col-span-5 lg:mt-0"
            >
              <div className="absolute inset-0 bg-orange-500 blur-[100px] opacity-20 rounded-full mix-blend-screen" />
              <div className="relative mx-auto w-full max-w-md bg-neutral-900 border-2 border-neutral-800 p-8 transform rotate-1 shadow-2xl backdrop-blur-md">
                <div className="absolute -top-3 -right-3 bg-orange-500 text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rotate-6">Cutting Edge</div>
                <h3 className="font-graffiti text-2xl text-white mb-6 border-b-2 border-neutral-800 pb-4">How It Works</h3>
                <div className="flex flex-col space-y-6">
                  <div className="flex items-start space-x-5 group">
                    <div className="bg-neutral-950 border border-orange-500/30 p-3 transform -rotate-3 group-hover:rotate-0 transition-transform flex-shrink-0">
                      <Disc3 className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading tracking-wider text-white">Upload. Sell. Get Pitched.</h3>
                      <p className="mt-1 text-sm font-sans text-neutral-400">Upload your beats to our store and sync catalog simultaneously. Every track is auto-tagged with rich metadata — mood, BPM, instrumentation, energy.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-5 group">
                    <div className="bg-neutral-950 border border-orange-500/30 p-3 transform rotate-2 group-hover:rotate-0 transition-transform flex-shrink-0">
                      <Zap className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading tracking-wider text-white">AI Brief Matching</h3>
                      <p className="mt-1 text-sm font-sans text-neutral-400">Supervisors submit a brief → our engine matches mood, genre, and BPM against your catalog → we pitch the best tracks within 12 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-5 group">
                    <div className="bg-neutral-950 border border-orange-500/30 p-3 transform -rotate-1 group-hover:rotate-0 transition-transform flex-shrink-0">
                      <ShieldCheck className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading tracking-wider text-white">Pre-Cleared. One-Stop.</h3>
                      <p className="mt-1 text-sm font-sans text-neutral-400">Every track in our catalog is pre-cleared for master and publishing. Supervisors license in 24 hours — no drama, no delays.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Catalog */}
      <div className="bg-neutral-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="font-graffiti text-4xl sm:text-5xl text-orange-500 mb-2">Featured Sync Catalog</h2>
              <p className="font-sans text-neutral-400 max-w-xl">Pre-cleared tracks actively being pitched to music supervisors. Every track below is licensable in 24 hours.</p>
            </div>
            <Link to="/catalog" className="hidden sm:inline-flex items-center text-white hover:text-orange-500 font-bold uppercase tracking-wider text-sm transition-colors mt-4 sm:mt-0">
              View Full Catalog <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTracks.map((track, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="aspect-[1/1] overflow-hidden rounded-none border border-neutral-800 bg-neutral-900 relative">
                  <img src={track.image} alt={track.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-orange-500 text-black text-[10px] font-bold uppercase tracking-widest">{track.genre}</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest">Sync Ready</span>
                      </div>
                      <h4 className="text-2xl font-heading text-white">{track.title}</h4>
                      <p className="text-neutral-400 font-sans text-sm font-bold uppercase">{track.artist}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                    <span className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-black text-[10px] font-bold uppercase tracking-widest">Sync</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/80 border border-orange-500/30 px-2 py-1 text-[10px] font-mono text-orange-500">24h Clearance</div>
                </div>
              </motion.div>
            ))}
          </div>
          <Link to="/catalog" className="sm:hidden inline-flex w-full justify-center items-center font-bold uppercase tracking-wider text-sm transition-colors mt-12 bg-neutral-900 py-4 hover:bg-neutral-800">
            View Full Catalog
          </Link>
        </div>
      </div>

      {/* Stats / Social Proof */}
      <div className="bg-neutral-950 py-16 border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-heading text-orange-500">14</p>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">Tracks in Catalog</p>
            </div>
            <div>
              <p className="text-4xl font-heading text-orange-500">3</p>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">Artists Onboarded</p>
            </div>
            <div>
              <p className="text-4xl font-heading text-orange-500">24h</p>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">License Turnaround</p>
            </div>
            <div>
              <p className="text-4xl font-heading text-orange-500">20%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-2">Sync Commission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <div className="bg-neutral-950 py-16 sm:py-24 border-t border-neutral-900 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-neutral-900 border border-neutral-800 px-6 py-20 lg:py-24 shadow-2xl skew-y-1">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="-skew-y-1 relative z-10">
              <h2 className="mx-auto max-w-2xl text-center font-heading text-4xl sm:text-5xl uppercase tracking-wider text-white">
                Get Notified About Active Placement Briefs
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-center text-lg font-sans text-neutral-400">
                Sign up to receive alerts when music supervisors submit briefs looking for new tracks. Be the first to get your music pitched.
              </p>
              <form className="mx-auto mt-10 flex max-w-md gap-x-0 relative group" onSubmit={async (e) => { e.preventDefault(); if (!email || submitting) return; setSubmitting(true); await supabase.from('contact_submissions').insert({ type: 'newsletter', first_name: '', email, message: 'Newsletter signup' } as any); setSubscribed(true); }}>
                {subscribed ? (
                  <div className="w-full bg-green-900/50 border border-green-500/30 px-5 py-4 text-green-200 text-sm font-bold uppercase tracking-widest text-center">You're subscribed!</div>
                ) : (
                  <>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="min-w-0 flex-auto border-0 bg-black/50 px-5 py-4 text-white placeholder-neutral-500 shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 font-sans text-base outline-none transition-all"
                  placeholder="Enter your email"
                />
                <button
                  type="submit"
                  className="flex-none bg-orange-500 px-8 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-lg hover:bg-orange-400 transition-colors"
                >
                  Get Alerts
                </button>
                </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
