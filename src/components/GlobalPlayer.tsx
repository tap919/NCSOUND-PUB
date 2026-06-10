import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ListMusic, Repeat } from 'lucide-react';
import { motion } from 'motion/react';
import WaveSurfer from 'wavesurfer.js';
import { usePlayerStore } from '../store/usePlayerStore';

export function GlobalPlayer() {
  const { currentTrack, isPlaying, volume, isMuted, pause, resume, setVolume, toggleMute } = usePlayerStore();
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  // Format time (seconds to M:SS)
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#525252',
      progressColor: '#f97316',
      cursorColor: '#f97316',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 24,
      normalize: true,
      url: currentTrack?.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    });

    let ignore = false;

    ws.on('ready', () => {
      if (ignore) return;
      setDuration(formatTime(ws.getDuration()));
      ws.setVolume(volume);
    });

    ws.on('timeupdate', () => {
      if (ignore) return;
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });
    
    ws.on('interaction', () => {
      if (ignore) return;
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on('play', () => { if (!ignore) resume(); });
    ws.on('pause', () => { if (!ignore) pause(); });
    ws.on('finish', () => { if (!ignore) pause(); });

    setWavesurfer(ws);

    return () => {
      ignore = true;
      ws.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (wavesurfer && currentTrack) {
      wavesurfer.load(currentTrack.url);
      let ignore = false;
      wavesurfer.once('ready', () => {
        if (!ignore) wavesurfer.play();
      });
      return () => { ignore = true; };
    }
  }, [currentTrack, wavesurfer]);

  useEffect(() => {
    if (wavesurfer) {
      if (isPlaying && !wavesurfer.isPlaying()) {
        wavesurfer.play();
      } else if (!isPlaying && wavesurfer.isPlaying()) {
        wavesurfer.pause();
      }
    }
  }, [isPlaying, wavesurfer]);

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted, wavesurfer]);

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 border-t-2 border-orange-500 px-4 py-2 sm:py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-1/3 sm:w-1/4">
          <div className="relative h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 rounded shadow-md overflow-hidden border border-orange-500/50">
            <img src={currentTrack?.coverImage || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop"} alt="Cover" className="object-cover w-full h-full grayscale contrast-125" />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="flex gap-0.5 items-end h-4">
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-orange-500" />
                  <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1 bg-orange-500" />
                  <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1 bg-orange-500" />
                </div>
              </div>
            )}
          </div>
          <div className="hidden sm:block truncate">
            <h4 className="text-white font-heading text-lg sm:text-xl tracking-wider truncate mb-0.5">{currentTrack?.title || 'THE TAKEOVER'}</h4>
            <p className="text-orange-500 text-xs font-sans uppercase font-bold tracking-widest truncate">{currentTrack?.artist || 'Apex Beats'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-4 sm:gap-6 mb-1">
            <button className="text-neutral-400 hover:text-orange-500 transition-colors">
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-black rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-1" />}
            </button>
            <button className="text-neutral-400 hover:text-orange-500 transition-colors">
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>
          </div>
          {/* Progress Bar (Wavesurfer) */}
          <div className="hidden sm:flex w-full items-center gap-3">
            <div className="text-[10px] text-neutral-400 font-mono w-8 text-right">{currentTime}</div>
            <div className="flex-1 overflow-hidden" ref={waveformRef}></div>
            <div className="text-[10px] text-neutral-400 font-mono w-8">{duration}</div>
          </div>
        </div>

        {/* Extra Controls */}
        <div className="hidden md:flex flex-row items-center justify-end gap-5 w-1/4">
          <button className="text-neutral-400 hover:text-orange-500 transition-colors">
            <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="text-neutral-400 hover:text-orange-500 transition-colors">
            <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex items-center gap-2 w-24">
            <button onClick={toggleMute} className="text-neutral-400 hover:text-orange-500 transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <div className="h-1.5 flex-1 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full" 
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
