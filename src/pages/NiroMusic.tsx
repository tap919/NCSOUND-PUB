import { useState, useRef, useEffect } from 'react';
import { SkipBack, SkipForward, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SpotifyEmbed from '../components/SpotifyEmbed';

type TrackFile = { id: string; file_type: string; storage_url: string };
type Track = { id: string; title: string; track_number: number; track_files: TrackFile[] };
type Album = { id: string; title: string; cover_art_url: string | null; tracks: Track[] };

export default function NiroMusic() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('albums')
        .select('*, tracks(*, track_files(*))')
        .order('created_at', { ascending: true });
      if (data) {
        const mapped: Album[] = (data as any[]).map((a) => ({
          ...a,
          tracks: (a.tracks || []).sort((a: any, b: any) => (a.track_number || 0) - (b.track_number || 0)),
        }));
        setAlbums(mapped);
        if (mapped.length > 0) { setCurrentAlbum(mapped[0]); }
      }
      setLoading(false);
    })();
  }, []);

  const track = currentAlbum?.tracks[currentTrackIdx];
  const audioUrl = track?.track_files?.find((f) => f.file_type === 'master')?.storage_url;

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      if (playing) audioRef.current.play();
    }
  }, [currentTrackIdx, currentAlbum, audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const next = () => {
    if (!currentAlbum) return;
    if (currentTrackIdx < currentAlbum.tracks.length - 1) setCurrentTrackIdx(i => i + 1);
    else {
      const idx = albums.indexOf(currentAlbum);
      if (idx < albums.length - 1) { setCurrentAlbum(albums[idx + 1]); setCurrentTrackIdx(0); }
    }
  };

  const prev = () => {
    if (!currentAlbum) return;
    if (currentTrackIdx > 0) setCurrentTrackIdx(i => i - 1);
    else {
      const idx = albums.indexOf(currentAlbum);
      if (idx > 0) { setCurrentAlbum(albums[idx - 1]); setCurrentTrackIdx(albums[idx - 1].tracks.length - 1); }
    }
  };

  if (loading) return (
    <div className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-neutral-500 font-sans text-center">Loading music...</p>
    </div>
  );

  if (albums.length === 0) return (
    <div className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/roster/niro" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">← Back to Niro</Link>
      <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">Niro <span className="text-orange-500">Music</span></h1>
      <p className="text-neutral-400 font-sans">No albums available yet.</p>
    </div>
  );

  return (
    <div className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/roster/niro" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">← Back to Niro</Link>
      <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">Niro <span className="text-orange-500">Music</span></h1>
      <p className="text-neutral-400 font-sans mb-10">Stream the full catalog. {albums.reduce((s, a) => s + a.tracks.length, 0)} tracks.</p>

      {track && (
        <div className="bg-neutral-900 border border-neutral-800 p-6 mb-10 sticky top-0 z-10">
          <audio ref={audioRef} onTimeUpdate={() => { if (audioRef.current) { setProgress(audioRef.current.currentTime); setDuration(audioRef.current.duration || 0); } }} onEnded={next} />
          <div className="flex items-center gap-4 mb-4">
            <button onClick={prev} className="text-neutral-400 hover:text-white"><SkipBack className="w-5 h-5" /></button>
            <button onClick={togglePlay} className="bg-orange-500 text-black p-3 rounded-full hover:bg-orange-400"><Music className="w-5 h-5" /></button>
            <button onClick={next} className="text-neutral-400 hover:text-white"><SkipForward className="w-5 h-5" /></button>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{track.title}</p>
              <p className="text-xs text-neutral-500">{currentAlbum?.title}</p>
            </div>
            <div className="text-xs font-mono text-neutral-400">{Math.floor(progress / 60)}:{String(Math.floor(progress % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</div>
          </div>
          <div className="w-full h-1 bg-neutral-800 cursor-pointer" onClick={(e) => { if (audioRef.current) { const rect = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * (audioRef.current.duration || 0); }}}>
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-16">
        {albums.map((album) => (
          <div key={album.id}>
            <h2 className="text-2xl font-heading uppercase tracking-wider text-white mb-6">{album.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {album.tracks.map((t, i) => (
                <button key={t.id} onClick={() => { setCurrentAlbum(album); setCurrentTrackIdx(i); setPlaying(true); if (audioRef.current) audioRef.current.play(); }}
                  className={`flex items-center gap-3 p-3 border transition-colors text-left ${currentAlbum?.id === album.id && currentTrackIdx === i ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'}`}>
                  <span className={`text-xs font-mono w-6 ${currentAlbum?.id === album.id && currentTrackIdx === i ? 'text-orange-500' : 'text-neutral-600'}`}>{t.track_number || i + 1}</span>
                  <span className={`text-sm font-bold uppercase tracking-wider flex-1 ${currentAlbum?.id === album.id && currentTrackIdx === i ? 'text-orange-500' : 'text-white'}`}>{t.title}</span>
                  {currentAlbum?.id === album.id && currentTrackIdx === i && playing && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-neutral-800 pt-10">
        <h2 className="text-lg font-heading uppercase tracking-wider text-white mb-4">Also on Spotify</h2>
        <SpotifyEmbed type="artist" id="5M3vgLWv05thJEkMv6JRRw" height="352" />
      </div>
    </div>
  );
}
