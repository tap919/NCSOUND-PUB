import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('wavesurfer.js', () => ({
  default: {
    create: () => ({
      on: vi.fn(),
      once: vi.fn(),
      load: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      destroy: vi.fn(),
      setVolume: vi.fn(),
      getDuration: () => 120,
      getCurrentTime: () => 45,
      isPlaying: () => false,
    }),
  },
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../../store/usePlayerStore', () => ({
  usePlayerStore: () => ({
    currentTrack: null,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    playTrack: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
  }),
}));

import { GlobalPlayer } from '../../components/GlobalPlayer';

describe('GlobalPlayer (Regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no track is loaded (regression: mock data when no track)', () => {
    const { container } = render(<GlobalPlayer />);
    expect(container.innerHTML).toBe('');
  });
});
