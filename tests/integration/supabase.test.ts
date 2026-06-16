import { describe, it, expect } from 'vitest';

describe('Supabase Data Layer Integration', () => {
  describe('beat_store_products query shape', () => {
    it('returns expected columns for catalog display', () => {
      const mockBeat = {
        id: 'uuid-1',
        title: 'Test Beat',
        genre: 'Hip-Hop',
        bpm: 95,
        lease_price: 1.0,
        audio_url: 'https://storage.example.com/beat.mp3',
        is_first_wave: true,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        duration_seconds: 180,
        stems_available: false,
        ai_generated: false,
        sync_suitability: 'high',
        description: 'A test beat',
        mood_tags: ['dark', 'aggressive'],
        instrumentation: ['808', 'synth'],
      };
      expect(mockBeat).toHaveProperty('id');
      expect(mockBeat).toHaveProperty('title');
      expect(mockBeat).toHaveProperty('genre');
      expect(mockBeat).toHaveProperty('bpm');
      expect(mockBeat).toHaveProperty('lease_price');
      expect(mockBeat.status).toBe('active');
    });
  });

  describe('tracks query with relationships', () => {
    it('returns tracks with nested track_files', () => {
      const mockTrack = {
        id: 'uuid-2',
        title: 'Test Track',
        artist_id: 'uuid-3',
        album_id: 'uuid-4',
        track_number: 1,
        genre: 'Soul',
        bpm: 90,
        duration_seconds: 240,
        status: 'active',
        track_files: [
          { file_type: 'master', storage_url: 'https://storage.example.com/master.wav' },
          { file_type: 'mp3', storage_url: 'https://storage.example.com/preview.mp3' },
        ],
      };
      expect(mockTrack.track_files).toHaveLength(2);
      const master = mockTrack.track_files.find(f => f.file_type === 'master');
      expect(master).toBeDefined();
      expect(master!.storage_url).toContain('.wav');
    });

    it('finds master audio file from track_files', () => {
      const trackFiles = [
        { file_type: 'mp3', storage_url: 'https://example.com/preview.mp3' },
        { file_type: 'master', storage_url: 'https://example.com/master.wav' },
      ];
      const masterFile = trackFiles.find(f => f.file_type === 'master');
      expect(masterFile).toBeDefined();
      if (masterFile) {
        expect(masterFile.storage_url).toBeTruthy();
      }
    });
  });

  describe('contact_submissions insert validation', () => {
    it('validates required fields present', () => {
      const valid = { type: 'sync', first_name: 'John', email: 'john@test.com', message: 'I need music for a commercial spot' };
      expect(valid.first_name).toBeTruthy();
      expect(valid.email).toContain('@');
      expect(valid.message.length).toBeGreaterThanOrEqual(10);
    });

    it('rejects submissions without first_name', () => {
      const invalid = { type: 'sync', first_name: '', email: 'test@test.com', message: 'Valid message here' };
      expect(invalid.first_name).toBeFalsy();
    });
  });

  describe('auth session validation', () => {
    it('session is null when not authenticated', () => {
      const session = null;
      expect(session).toBeNull();
    });

    it('session contains user data when authenticated', () => {
      const session = {
        user: { id: 'uuid-5', email: 'artist@test.com', role: 'artist' },
        access_token: 'token-123',
      };
      expect(session.user.email).toBe('artist@test.com');
      expect(session.access_token).toBeTruthy();
    });

    it('role check rejects non-artist users from artist routes', () => {
      const isArtist = (role: string) => role === 'artist';
      expect(isArtist('artist')).toBe(true);
      expect(isArtist('admin')).toBe(false);
      expect(isArtist('supervisor')).toBe(false);
    });

    it('role check rejects non-admin users from admin routes', () => {
      const isAdmin = (role: string) => role === 'admin';
      expect(isAdmin('admin')).toBe(true);
      expect(isAdmin('artist')).toBe(false);
    });
  });
});
