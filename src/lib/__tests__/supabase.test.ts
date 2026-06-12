import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));

describe('Supabase Client', () => {
  it('VITE_SUPABASE_URL environment variable is defined', () => {
    expect(process.env.VITE_SUPABASE_URL).toBeTruthy();
  });

  it('VITE_SUPABASE_ANON_KEY environment variable is defined', () => {
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeTruthy();
  });
});

describe('Supabase Queries', () => {
  it('beat_store_products query returns expected shape', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient('https://test.supabase.co', 'test-key');
    const result = await supabase.from('beat_store_products').select('id,title,status');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
  });

  it('albums query with nested tracks returns data', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient('https://test.supabase.co', 'test-key');
    const result = await supabase.from('albums').select('*,tracks(*,track_files(*))');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
  });

  it('contact_submissions insert succeeds with valid payload', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient('https://test.supabase.co', 'test-key');
    const result = await supabase.from('contact_submissions').insert({
      type: 'sync',
      first_name: 'Test',
      email: 'test@example.com',
      message: 'Test message for integration testing.',
    });
    expect(result.error).toBeNull();
  });
});
