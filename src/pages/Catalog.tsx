import { Play, Pause, Filter, Search, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePlayerStore } from '../store/usePlayerStore';
import { SEO } from '../components/SEO';

export default function Catalog() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { playTrack, currentTrack, isPlaying, pause, resume } = usePlayerStore();
  
  useEffect(() => {
    let ignore = false;
    const fetchTracks = async () => {
      setLoading(true);
      let query = supabase
        .from('tracks')
        .select('*, artists(stage_name)')
        .eq('status', 'active')
        .in('visibility', ['public', 'supervisors_only']);
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      if (selectedGenres.length > 0) {
        query = query.in('genre', selectedGenres);
      }

      const { data, error } = await query;
      if (!ignore && !error && data) setTracks(data);
      if (!ignore) setLoading(false);
    };
    fetchTracks();
    return () => { ignore = true; };
  }, [searchQuery, selectedGenres]);

  const handlePlay = (track: any) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) pause();
      else resume();
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artists?.stage_name || 'NcSound Artist',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      });
    }
  };

  return (
      <div className="py-24 sm:py-32 flex flex-col md:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8">
        <SEO title="Sync Catalog" description="Browse pre-cleared tracks available for TV, film, and advertising placements. One-stop licensing, 24-hour turnaround." />
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <h3 className="text-xl font-heading uppercase tracking-wider text-orange-500 mb-4 border-b border-neutral-800 pb-2">Search</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, artist, mood, or genre" 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-none py-2 pl-10 pr-4 text-white font-sans text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-heading uppercase tracking-wider text-orange-500 mb-4 border-b border-neutral-800 pb-2 flex items-center justify-between">
            Filters <Filter className="w-4 h-4" />
          </h3>
          <div className="space-y-6">
            {/* Genre */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Genre</h4>
                <div className="space-y-2 font-sans text-sm text-neutral-300">
                  {['Hip-Hop', 'R&B / Soul', 'Trap / Drill', 'Cinematic', 'Boom Bap'].map(genre => (
                    <label key={genre} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedGenres.includes(genre)} onChange={e => {
                        setSelectedGenres(prev => e.target.checked ? [...prev, genre] : prev.filter(g => g !== genre));
                      }} className="bg-neutral-900 border-neutral-700 text-orange-500 focus:ring-orange-500 rounded-none" />
                      {genre}
                    </label>
                  ))}
                </div>
            </div>
            {/* Mood */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Mood</h4>
              <div className="space-y-2 font-sans text-sm text-neutral-300">
                <label className="flex items-center gap-2"><input type="checkbox" className="bg-neutral-900 border-neutral-700 text-orange-500 focus:ring-orange-500 rounded-none" /> Tense</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="bg-neutral-900 border-neutral-700 text-orange-500 focus:ring-orange-500 rounded-none" /> Triumphant</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="bg-neutral-900 border-neutral-700 text-orange-500 focus:ring-orange-500 rounded-none" /> Dark</label>
              </div>
            </div>
            {/* BPM */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">BPM</h4>
              <input type="range" min="60" max="180" className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-neutral-500 mt-1 font-mono">
                <span>60</span>
                <span>180</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h1 className="text-5xl font-heading font-bold uppercase tracking-wider text-white">Licensed Sync <span className="text-orange-500 font-graffiti">Catalog</span></h1>
            <p className="text-neutral-400 font-sans mt-2">All tracks are pre-cleared for master and publishing. Search by genre, mood, or BPM.</p>
          </div>
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 border border-neutral-800">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">100% Pre-Cleared</span>
          </div>
        </div>

        {/* Tracks List */}
        <div className="bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-neutral-800 bg-neutral-950/50 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <div className="col-span-1 border-r border-neutral-800">Play</div>
            <div className="col-span-4 border-r border-neutral-800 pl-4">Title / Artist</div>
            <div className="col-span-2 border-r border-neutral-800 pl-4">Tags</div>
            <div className="col-span-3 border-r border-neutral-800 pl-4">Versions</div>
            <div className="col-span-2 pl-4">License</div>
          </div>

          <ul className="divide-y divide-neutral-800/50">
            {loading ? (
              <li className="px-6 py-10 text-center text-neutral-500 font-sans">Loading catalog...</li>
            ) : tracks.length === 0 ? (
              <li className="px-6 py-10 text-center text-neutral-500 font-sans">No matching tracks found.</li>
            ) : tracks.map((track) => (
              <li key={track.id} className="group hover:bg-black/40 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 px-4 lg:px-6 py-4">
                  <div className="col-span-1 flex items-center justify-between lg:justify-start">
                    <button 
                      onClick={() => handlePlay(track)}
                      className={`h-10 w-10 flex items-center justify-center transition-colors text-white hover:text-black hover:bg-orange-500 ${currentTrack?.id === track.id ? 'bg-orange-500 text-black' : 'bg-neutral-800'}`}
                    >
                      {currentTrack?.id === track.id && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-1 fill-current" />}
                    </button>
                    <div className="lg:hidden">
                      <Link to={`/catalog/${track.id}`} className="text-xs font-bold uppercase tracking-wider bg-orange-500 text-black px-3 py-1.5">View</Link>
                    </div>
                  </div>

                  <div className="col-span-4 lg:pl-4">
                    <Link to={`/catalog/${track.id}`} className="font-heading text-xl uppercase tracking-wider text-white hover:text-orange-500 transition-colors block">
                      {track.title}
                    </Link>
                    <span className="text-sm font-sans text-neutral-400 block">{track.artists?.stage_name || 'NcSound Artist'}</span>
                  </div>

                  <div className="col-span-2 lg:pl-4 flex flex-wrap gap-1.5">
                    {track.genre && <span className="text-[10px] uppercase font-bold tracking-widest bg-neutral-800 text-white px-2 py-0.5 border border-neutral-700">{track.genre}</span>}
                    {track.bpm && <span className="text-[10px] uppercase font-bold tracking-widest bg-neutral-800 text-neutral-400 px-2 py-0.5 border border-neutral-700">{track.bpm}</span>}
                  </div>

                  <div className="col-span-3 lg:pl-4 flex gap-2 font-mono text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    <span className="bg-black/50 px-2 py-0.5 border border-neutral-800">Main</span>
                  </div>

                  <div className="col-span-2 lg:pl-4 hidden lg:flex items-center justify-between">
                    <Link to={`/catalog/${track.id}`} className="text-xs font-bold uppercase tracking-widest text-black bg-orange-500 hover:bg-orange-400 px-4 py-2 transition-colors">
                      License
                    </Link>
                    <button className="text-neutral-500 hover:text-white transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
