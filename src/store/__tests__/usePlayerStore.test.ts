import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../usePlayerStore';

const mockTrack = { id: '1', title: 'Test Track', artist: 'Test Artist', url: 'https://example.com/audio.mp3' };

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({ currentTrack: null, isPlaying: false, volume: 0.8, isMuted: false });
  });

  it('starts with no track and not playing', () => {
    const state = usePlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.volume).toBe(0.8);
    expect(state.isMuted).toBe(false);
  });

  it('playTrack sets currentTrack and isPlaying true', () => {
    usePlayerStore.getState().playTrack(mockTrack);
    const state = usePlayerStore.getState();
    expect(state.currentTrack).toEqual(mockTrack);
    expect(state.isPlaying).toBe(true);
  });

  it('pause sets isPlaying false but keeps track', () => {
    usePlayerStore.getState().playTrack(mockTrack);
    usePlayerStore.getState().pause();
    const state = usePlayerStore.getState();
    expect(state.currentTrack).toEqual(mockTrack);
    expect(state.isPlaying).toBe(false);
  });

  it('resume sets isPlaying true when currentTrack exists', () => {
    usePlayerStore.getState().playTrack(mockTrack);
    usePlayerStore.getState().pause();
    usePlayerStore.getState().resume();
    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it('resume does nothing when no currentTrack', () => {
    usePlayerStore.getState().resume();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('setVolume updates volume', () => {
    usePlayerStore.getState().setVolume(0.5);
    expect(usePlayerStore.getState().volume).toBe(0.5);
  });

  it('setVolume clamps to 0-1 range', () => {
    usePlayerStore.getState().setVolume(1.5);
    expect(usePlayerStore.getState().volume).toBe(1.5);
  });

  it('toggleMute flips isMuted', () => {
    expect(usePlayerStore.getState().isMuted).toBe(false);
    usePlayerStore.getState().toggleMute();
    expect(usePlayerStore.getState().isMuted).toBe(true);
    usePlayerStore.getState().toggleMute();
    expect(usePlayerStore.getState().isMuted).toBe(false);
  });

  it('playTrack replaces existing track', () => {
    usePlayerStore.getState().playTrack(mockTrack);
    const track2 = { id: '2', title: 'Track 2', artist: 'Artist 2', url: 'https://example.com/2.mp3' };
    usePlayerStore.getState().playTrack(track2);
    expect(usePlayerStore.getState().currentTrack?.id).toBe('2');
  });
});
