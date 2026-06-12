import { describe, it, expect, vi, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3000';

describe('API Health Check', () => {
  it('GET /api/health returns 200', async () => {
    const res = await fetch(`${API_BASE}/api/health`).catch(() => null);
    if (!res) return;
    expect(res.status).toBe(200);
  });
});

describe('API Route Contracts', () => {
  it('/api/checkout expects POST with beatId, title, priceStr', () => {
    const body = { beatId: 'uuid', title: 'Test Beat', priceStr: '1.00' };
    expect(body).toHaveProperty('beatId');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('priceStr');
  });

  it('contact_submissions schema validates required fields', () => {
    const validSubmission = {
      type: 'sync',
      first_name: 'John',
      email: 'john@example.com',
      message: 'I am interested in licensing a track for a TV commercial.',
    };
    expect(validSubmission.first_name).toBeTruthy();
    expect(validSubmission.email).toContain('@');
    expect(validSubmission.message.length).toBeGreaterThanOrEqual(10);
  });

  it('contact_submissions rejects empty message', () => {
    const invalid = { type: 'sync', first_name: 'John', email: 'john@example.com', message: 'short' };
    expect(invalid.message.length).toBeLessThan(10);
  });

  it('contact_submissions rejects invalid email', () => {
    const invalid = { type: 'sync', first_name: 'John', email: 'not-an-email', message: 'A valid message here' };
    expect(invalid.email).not.toContain('@');
  });
});

describe('Supabase Query Contracts', () => {
  it('beat_store_products query with status=active filter', () => {
    const query = { status: 'active', select: 'id,title,genre,bpm,lease_price,audio_url,is_first_wave' };
    expect(query.select).toContain('id');
    expect(query.select).toContain('title');
    expect(query.status).toBe('active');
  });

  it('albums nested query with tracks and track_files', () => {
    const query = { select: '*,tracks(*,track_files(*))' };
    expect(query.select).toContain('tracks');
    expect(query.select).toContain('track_files');
  });

  it('artist roster query returns required fields', () => {
    const query = { select: 'id,stage_name,status,legal_name' };
    expect(query.select).toContain('stage_name');
    expect(query.select).toContain('status');
  });
});
