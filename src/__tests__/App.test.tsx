import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, role: null, session: null, signOut: vi.fn() }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              then: (cb: (val: any) => void) => cb({ data: [], error: null }),
            }),
          }),
        }),
        limit: () => ({
          single: () => ({
            then: (cb: (val: any) => void) => cb({ data: null, error: null }),
          }),
        }),
      }),
    }),
  },
}));

vi.mock('../store/usePlayerStore', () => ({
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

vi.mock('../components/GlobalPlayer', () => ({
  GlobalPlayer: () => <div>Player</div>,
}));

vi.mock('../components/SEO', () => ({
  SEO: ({ title }: { title: string }) => <title>{title}</title>,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../pages/Home', () => ({ default: () => <div>Home</div> }));
vi.mock('../pages/About', () => ({ default: () => <div>About</div> }));
vi.mock('../pages/Catalog', () => ({ default: () => <div>Catalog</div> }));
vi.mock('../pages/CatalogSubmit', () => ({ default: () => <div>CatalogSubmit</div> }));
vi.mock('../pages/BeatStore', () => ({ default: () => <div>BeatStore</div> }));
vi.mock('../pages/Blog', () => ({ default: () => <div>Blog</div> }));
vi.mock('../pages/Agreement', () => ({ default: () => <div>Agreement</div> }));
vi.mock('../pages/TrackDetail', () => ({ default: () => <div>TrackDetail</div> }));
vi.mock('../pages/artist/Login', () => ({ default: () => <div>ArtistLogin</div> }));
vi.mock('../pages/admin/Login', () => ({ default: () => <div>AdminLogin</div> }));
vi.mock('../pages/NotFound', () => ({ default: () => <div>NotFound</div> }));
vi.mock('../pages/artist/Dashboard', () => ({ default: () => <div>ArtistDashboard</div> }));
vi.mock('../pages/artist/Upload', () => ({ default: () => <div>ArtistUpload</div> }));
vi.mock('../pages/artist/Royalties', () => ({ default: () => <div>Royalties</div> }));
vi.mock('../pages/artist/RegistrationStatus', () => ({ default: () => <div>RegistrationStatus</div> }));
vi.mock('../pages/admin/Dashboard', () => ({ default: () => <div>AdminDashboard</div> }));
vi.mock('../pages/SupervisorPortal', () => ({ default: () => <div>SupervisorPortal</div> }));
vi.mock('../pages/SupervisorRegister', () => ({ default: () => <div>SupervisorRegister</div> }));
vi.mock('../pages/SubmitBrief', () => ({ default: () => <div>SubmitBrief</div> }));
vi.mock('../pages/roster/Niro', () => ({ default: () => <div>Niro</div> }));
vi.mock('../pages/roster/Tap919', () => ({ default: () => <div>Tap919</div> }));
vi.mock('../pages/roster/ARTProductions', () => ({ default: () => <div>ARTProductions</div> }));
vi.mock('../pages/roster/Soulyghost', () => ({ default: () => <div>Soulyghost</div> }));
vi.mock('../pages/Terms', () => ({ default: () => <div>Terms</div> }));
vi.mock('../pages/Privacy', () => ({ default: () => <div>Privacy</div> }));
vi.mock('../pages/artist/UploadBeat', () => ({ default: () => <div>UploadBeat</div> }));
vi.mock('../pages/artist/Profile', () => ({ default: () => <div>ArtistProfile</div> }));
vi.mock('../pages/admin/Inbox', () => ({ default: () => <div>AdminInbox</div> }));
vi.mock('../pages/admin/SupervisorRequests', () => ({ default: () => <div>AdminSupervisorRequests</div> }));
vi.mock('../pages/admin/LicenseRequests', () => ({ default: () => <div>AdminLicenseRequests</div> }));
vi.mock('../pages/admin/Briefs', () => ({ default: () => <div>AdminBriefs</div> }));
vi.mock('../pages/artist/ProGuide', () => ({ default: () => <div>ProGuide</div> }));
vi.mock('../pages/admin/Control', () => ({ default: () => <div>AdminControl</div> }));
vi.mock('../pages/Story', () => ({ default: () => <div>Story</div> }));
vi.mock('../pages/NiroMusic', () => ({ default: () => <div>NiroMusic</div> }));
vi.mock('../pages/PlaylistSubmit', () => ({ default: () => <div>PlaylistSubmit</div> }));

import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );
    expect(container).toBeTruthy();
  });
});
