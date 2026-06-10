import { create } from 'zustand';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverImage?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  playTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  resume: () => set((state) => ({ isPlaying: !!state.currentTrack })),
  setVolume: (v) => set({ volume: v }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
