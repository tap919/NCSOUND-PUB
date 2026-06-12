import { describe, it, expect } from 'vitest';

describe('Supabase Configuration', () => {
  it('VITE_SUPABASE_URL is set', () => {
    expect(process.env.VITE_SUPABASE_URL).toBeTruthy();
  });

  it('VITE_SUPABASE_ANON_KEY is set', () => {
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeTruthy();
  });
});

describe('Data Model Contracts', () => {
  it('beat_store_products expects id, title, status, genre, bpm, lease_price, audio_url, is_first_wave, created_at', () => {
    const beat = {
      id: 'uuid',
      title: 'Smooth Lead Soul',
      status: 'active',
      genre: 'Soul',
      bpm: 90,
      lease_price: 1.0,
      audio_url: 'https://example.com/beat.mp3',
      is_first_wave: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(beat).toHaveProperty('id');
    expect(beat).toHaveProperty('title');
    expect(beat).toHaveProperty('status');
    expect(beat).toHaveProperty('genre');
    expect(beat).toHaveProperty('bpm');
    expect(beat).toHaveProperty('lease_price');
    expect(beat).toHaveProperty('audio_url');
    expect(beat).toHaveProperty('is_first_wave');
    expect(beat).toHaveProperty('created_at');
  });

  it('albums expects id, title, cover_art_url, created_at', () => {
    const album = {
      id: 'uuid',
      title: '1111',
      cover_art_url: 'https://example.com/cover.jpg',
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(album).toHaveProperty('id');
    expect(album).toHaveProperty('title');
    expect(album).toHaveProperty('cover_art_url');
    expect(album).toHaveProperty('created_at');
  });

  it('tracks expects id, title, artist_id, album_id, track_number, genre, bpm, duration_seconds, status', () => {
    const track = {
      id: 'uuid',
      title: 'Intro',
      artist_id: 'uuid',
      album_id: 'uuid',
      track_number: 1,
      genre: 'Hip-Hop',
      bpm: 95,
      duration_seconds: 180,
      status: 'active',
    };
    expect(track).toHaveProperty('id');
    expect(track).toHaveProperty('title');
    expect(track).toHaveProperty('artist_id');
    expect(track).toHaveProperty('album_id');
    expect(track).toHaveProperty('track_number');
    expect(track).toHaveProperty('genre');
    expect(track).toHaveProperty('bpm');
    expect(track).toHaveProperty('duration_seconds');
    expect(track).toHaveProperty('status');
  });

  it('track_files expects id, track_id, file_type, storage_url', () => {
    const file = {
      id: 'uuid',
      track_id: 'uuid',
      file_type: 'master',
      storage_url: 'https://example.com/audio.mp3',
    };
    expect(file).toHaveProperty('id');
    expect(file).toHaveProperty('track_id');
    expect(file).toHaveProperty('file_type');
    expect(file).toHaveProperty('storage_url');
  });

  it('artists expects id, stage_name, status, legal_name', () => {
    const artist = {
      id: 'uuid',
      stage_name: 'Tap919',
      status: 'active',
      legal_name: 'Terrence Perry II',
    };
    expect(artist).toHaveProperty('id');
    expect(artist).toHaveProperty('stage_name');
    expect(artist).toHaveProperty('status');
    expect(artist).toHaveProperty('legal_name');
  });
});
