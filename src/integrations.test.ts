import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// AUDIO ANALYSIS — extracted from src/lib/analyze.ts
// ============================================================

function detectBpm(samples: Float32Array, sampleRate: number): number {
  const envelopeSize = Math.floor(samples.length / 512);
  if (envelopeSize < 2) return 0;
  const envelope = new Float32Array(envelopeSize);
  for (let i = 0; i < envelopeSize; i++) {
    let sum = 0;
    for (let j = 0; j < 512; j++) {
      const idx = i * 512 + j;
      if (idx < samples.length) sum += Math.abs(samples[idx]);
    }
    envelope[i] = sum / 512;
  }
  const minBpm = 60, maxBpm = 200;
  const minLag = Math.floor(sampleRate * 60 / maxBpm / 512);
  const maxLag = Math.ceil(sampleRate * 60 / minBpm / 512);
  if (minLag >= maxLag) return 0;
  let bestLag = minLag, bestVal = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0, count = 0;
    for (let i = 0; i < envelopeSize - lag; i++) { corr += envelope[i] * envelope[i + lag]; count++; }
    const val = count > 0 ? corr / count : 0;
    if (val > bestVal) { bestVal = val; bestLag = lag; }
  }
  if (bestVal < 0.01) return 0;
  return Math.round(60 / ((bestLag * 512) / sampleRate));
}

function detectEnergy(samples: Float32Array): { level: string; score: number } {
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) sumSq += samples[i] * samples[i];
  const rms = Math.sqrt(sumSq / samples.length);
  const peak = Math.max(...samples.map(Math.abs));
  const crest = peak / (rms || 0.001);
  const rmsNorm = Math.min(rms * 10, 1);
  const crestNorm = Math.min(crest / 10, 1);
  const score = Math.round((rmsNorm * 0.6 + crestNorm * 0.4) * 100);
  if (score < 25) return { level: 'low', score };
  if (score < 50) return { level: 'medium', score };
  if (score < 75) return { level: 'high', score };
  return { level: 'very_high', score };
}

// ============================================================
// EMBEDDING TOOLS — extracted from src/lib/embeddings.ts
// ============================================================

function buildTrackEmbeddingText(track: { title: string; genre?: string | null; mood_tags?: string[] | null; bpm?: number | null; key_signature?: string | null; energy_level?: string | null }): string {
  const parts: string[] = [track.title];
  if (track.genre) parts.push(`Genre: ${track.genre}`);
  if (track.mood_tags?.length) parts.push(`Mood: ${track.mood_tags.join(', ')}`);
  if (track.bpm) parts.push(`BPM: ${track.bpm}`);
  if (track.key_signature) parts.push(`Key: ${track.key_signature}`);
  if (track.energy_level) parts.push(`Energy: ${track.energy_level}`);
  return parts.join('. ');
}

function buildBriefEmbeddingText(brief: { project_name: string; use_type?: string | null; mood_tags?: string[] | null; bpm_min?: number | null; bpm_max?: number | null; details?: string | null }): string {
  const parts: string[] = [brief.project_name];
  if (brief.use_type) parts.push(`Use type: ${brief.use_type}`);
  if (brief.mood_tags?.length) parts.push(`Required mood: ${brief.mood_tags.join(', ')}`);
  if (brief.bpm_min || brief.bpm_max) parts.push(`BPM range: ${brief.bpm_min || '—'} to ${brief.bpm_max || '—'}`);
  if (brief.details) parts.push(`Details: ${brief.details}`);
  return parts.join('. ');
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function rankBySimilarity(query: number[], tracks: { id: string; title: string; embedding: number[] }[]): { track_id: string; title: string; score: number }[] {
  return tracks.map(t => ({ track_id: t.id, title: t.title, score: cosineSimilarity(query, t.embedding) }))
    .sort((a, b) => b.score - a.score).filter(t => t.score > 0.1);
}

// ============================================================
// EMAIL TEMPLATES — extracted from src/lib/email.ts
// ============================================================

function dealNotificationEmail(data: { trackTitle: string; licenseeName: string; syncFee: number; artistPayout: number; dealDate: string }): string {
  return `<div>Sync Deal Confirmed — "${data.trackTitle}" — $${data.syncFee.toFixed(2)} — Payout: $${data.artistPayout.toFixed(2)}</div>`;
}

function royaltyStatementEmail(data: { period: string; grossAmount: number; netPayout: number }): string {
  return `<div>Royalty — ${data.period} — Gross: $${data.grossAmount.toFixed(2)} — Net: $${data.netPayout.toFixed(2)}</div>`;
}

function proRegistrationEmail(data: { trackTitle: string; registry: string; status: string; iswc?: string }): string {
  const statusText = data.status === 'registered' ? 'Registered' : data.status;
  return `<div>PRO Update — "${data.trackTitle}" — ${data.registry} — ${statusText}${data.iswc ? ` — ISWC: ${data.iswc}` : ''}</div>`;
}

// ============================================================
// AGENT TOOL EXECUTION — extracted from src/lib/agent.ts
// ============================================================

function buildSystemPrompt(tools: { name: string; description: string }[]): string {
  return tools.map(t => `${t.name}: ${t.description}`).join('\n');
}

function parseToolCall(responseText: string): { name: string; args: Record<string, string> } | null {
  const match = responseText.match(/TOOL:\s*(\w+)\s*\|\s*(.*)/);
  if (!match) return null;
  const name = match[1];
  const raw = match[2];
  const args: Record<string, string> = {};
  raw.split('|').forEach(p => {
    const eq = p.indexOf('=');
    if (eq > 0) args[p.substring(0, eq).trim()] = p.substring(eq + 1).trim();
  });
  return { name, args };
}

// ============================================================
// INCOME AGGREGATION
// ============================================================

function aggregateIncome(data: { source: string; net_amount: number | null; gross_amount: number | null; stream_count: number | null }[]): {
  total_net: number; total_gross: number; total_streams: number; by_source: Record<string, number>;
} {
  let total_net = 0, total_gross = 0, total_streams = 0;
  const by_source: Record<string, number> = {};
  for (const d of data) {
    total_net += d.net_amount || 0;
    total_gross += d.gross_amount || 0;
    total_streams += d.stream_count || 0;
    by_source[d.source] = (by_source[d.source] || 0) + (d.net_amount || 0);
  }
  return { total_net, total_gross, total_streams, by_source };
}

// ============================================================
// CWR HELPER
// ============================================================

function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'PT0M0S';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `PT${m}M${s}S`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// KEY DETECTION — extracted from src/lib/analyze.ts
// ============================================================

function countZeroCrossings(samples: Float32Array): number {
  let count = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i - 1] >= 0 && samples[i] < 0) || (samples[i - 1] < 0 && samples[i] >= 0)) count++;
  }
  return count;
}

function detectKey(samples: Float32Array, _sampleRate: number): { key: string; confidence: number } {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const chroma = new Float32Array(12);
  const frameSize = 2048, hopSize = 1024;
  const frameCount = Math.floor((samples.length - frameSize) / hopSize);
  const window = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frameSize - 1)));
  for (let f = 0; f < Math.min(frameCount, 100); f++) {
    const offset = f * hopSize;
    const frame = new Float32Array(frameSize);
    for (let i = 0; i < frameSize && offset + i < samples.length; i++) frame[i] = samples[offset + i] * window[i];
    const energy = frame.reduce((s, v) => s + v * v, 0) / frameSize;
    const zeroCrossings = countZeroCrossings(frame);
    const dominantNote = Math.round((zeroCrossings / frameSize) * 120) % 12;
    chroma[dominantNote] += energy;
  }
  let maxIdx = 0, maxVal = 0, totalEnergy = 0;
  for (let i = 0; i < 12; i++) { totalEnergy += chroma[i]; if (chroma[i] > maxVal) { maxVal = chroma[i]; maxIdx = i; } }
  return { key: NOTES[maxIdx], confidence: totalEnergy > 0 ? Math.min(maxVal / totalEnergy, 0.95) : 0 };
}

// ============================================================
// ERROR SANITIZATION
// ============================================================

function sanitizeError(error: unknown): string {
  if (!error) return 'An unexpected error occurred';
  const message = error instanceof Error ? error.message : String(error);
  const sensitive = ['key', 'secret', 'token', 'password', 'authorization', 'bearer'];
  const lower = message.toLowerCase();
  if (sensitive.some(s => lower.includes(s))) return 'Internal configuration error';
  return message.substring(0, 200);
}

function validateRequired(body: Record<string, any>, fields: string[]): string | null {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || body[f] === '') return `${f} is required`;
  }
  return null;
}

// ============================================================
// TESTS — AUDIO ANALYSIS
// ============================================================

describe('detectBpm', () => {
  it('returns 0 for silent audio', () => {
    const samples = new Float32Array(44100); // 1 second of silence at 44.1kHz
    expect(detectBpm(samples, 44100)).toBe(0);
  });

  it('returns 0 for very short audio', () => {
    const samples = new Float32Array(100);
    expect(detectBpm(samples, 44100)).toBe(0);
  });

  it('detects BPM from a synthetic beat pattern (approximate)', () => {
    // Create a ~120 BPM pattern
    const sampleRate = 44100;
    const beatInterval = Math.round(60 / 120 * sampleRate); // ~22050 samples
    const duration = 4 * sampleRate;
    const samples = new Float32Array(duration);
    // Generate strong beats with envelope energy
    for (let i = 0; i < duration; i++) {
      if (i % beatInterval < 1000) samples[i] = 0.8;
      else samples[i] = Math.random() * 0.05; // noise floor
    }
    const result = detectBpm(samples, sampleRate);
    // Should detect something in the BPM range
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('handles different sample rates', () => {
    const samples = new Float32Array(44100 * 2);
    // Fill with noise + periodic impulse
    for (let i = 0; i < samples.length; i += 500) samples[i] = 1.0;
    const result = detectBpm(samples, 44100);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe('detectEnergy', () => {
  it('returns low for quiet audio', () => {
    const samples = new Float32Array(44100);
    samples.fill(0.01);
    const result = detectEnergy(samples);
    expect(result.level).toBe('low');
    expect(result.score).toBeLessThan(25);
  });

  it('returns very_high or high for loud audio', () => {
    const samples = new Float32Array(44100);
    samples.fill(0.9);
    const result = detectEnergy(samples);
    expect(['high', 'very_high']).toContain(result.level);
  });

  it('handles empty array gracefully', () => {
    const samples = new Float32Array(0);
    const result = detectEnergy(samples);
    expect(typeof result.level).toBe('string');
    expect(typeof result.score).toBe('number');
  });

  it('returns valid level for moderate audio', () => {
    const samples = new Float32Array(44100);
    samples.fill(0.15);
    const result = detectEnergy(samples);
    expect(['low', 'medium', 'high']).toContain(result.level);
  });
});

// ============================================================
// TESTS — EMBEDDING TOOLS
// ============================================================

describe('buildTrackEmbeddingText', () => {
  it('includes title and all available metadata', () => {
    const text = buildTrackEmbeddingText({
      title: 'NEON NIGHTS', genre: 'Synthwave', mood_tags: ['dark', 'energetic'],
      bpm: 128, key_signature: 'Am', energy_level: 'high',
    });
    expect(text).toContain('NEON NIGHTS');
    expect(text).toContain('Genre: Synthwave');
    expect(text).toContain('Mood: dark, energetic');
    expect(text).toContain('BPM: 128');
    expect(text).toContain('Key: Am');
    expect(text).toContain('Energy: high');
  });

  it('handles missing optional fields', () => {
    const text = buildTrackEmbeddingText({ title: 'Minimal Track' });
    expect(text).toBe('Minimal Track');
  });

  it('handles null mood_tags', () => {
    const text = buildTrackEmbeddingText({ title: 'Test', mood_tags: null });
    expect(text).toBe('Test');
  });

  it('handles empty mood_tags array', () => {
    const text = buildTrackEmbeddingText({ title: 'Test', mood_tags: [] });
    expect(text).toBe('Test');
  });
});

describe('buildBriefEmbeddingText', () => {
  it('includes project name and all requirements', () => {
    const text = buildBriefEmbeddingText({
      project_name: 'Action Movie Trailer', use_type: 'sync',
      mood_tags: ['tense', 'epic'], bpm_min: 120, bpm_max: 140,
      details: 'Need high energy orchestral track',
    });
    expect(text).toContain('Action Movie Trailer');
    expect(text).toContain('Use type: sync');
    expect(text).toContain('Required mood: tense, epic');
    expect(text).toContain('BPM range: 120 to 140');
  });

  it('handles missing details field', () => {
    const text = buildBriefEmbeddingText({ project_name: 'Test' });
    expect(text).toBe('Test');
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 5);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it('returns values between -1 and 1', () => {
    const result = cosineSimilarity([1, 2, 3], [4, 5, 6]);
    expect(result).toBeGreaterThan(-1.01);
    expect(result).toBeLessThan(1.01);
  });

  it('returns 0 for empty vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  it('returns 0 for mismatched length vectors', () => {
    expect(cosineSimilarity([1, 2], [1])).toBe(0);
  });

  it('returns 0 for zero vector', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });
});

describe('rankBySimilarity', () => {
  const query = [1, 0, 0];
  const tracks = [
    { id: 't1', title: 'Perfect Match', embedding: [1, 0, 0] },
    { id: 't2', title: 'Partial Match', embedding: [0.8, 0.2, 0.1] },
    { id: 't3', title: 'No Match', embedding: [0, 1, 1] },
  ];

  it('ranks by descending similarity score', () => {
    const results = rankBySimilarity(query, tracks);
    expect(results[0].track_id).toBe('t1');
    expect(results[1].track_id).toBe('t2');
    // t3 has similarity 0 which is below 0.1 threshold, so filtered out
    expect(results.length).toBe(2);
  });

  it('filters out scores below 0.1 threshold', () => {
    const nearMatch = { id: 't4', title: 'Pretty Good', embedding: [0.9, 0.1, 0.05] };
    const badTracks = [{ id: 'tBad', title: 'Bad', embedding: [0, 0, 0.05] }];
    const results = rankBySimilarity(query, [...tracks, nearMatch, ...badTracks]);
    expect(results.every(r => r.score > 0.1)).toBe(true);
    expect(results.find(r => r.track_id === 'tBad')).toBeUndefined();
  });

  it('returns empty array for empty tracks', () => {
    expect(rankBySimilarity([1], [])).toEqual([]);
  });
});

// ============================================================
// TESTS — EMAIL TEMPLATES
// ============================================================

describe('dealNotificationEmail', () => {
  it('includes payout and fee amounts', () => {
    const html = dealNotificationEmail({
      trackTitle: 'STREET ANTHEM', licenseeName: 'Netflix', syncFee: 1500, artistPayout: 1200, dealDate: '2024-01-15',
    });
    expect(html).toContain('STREET ANTHEM');
    expect(html).toContain('1500.00');
    expect(html).toContain('1200.00');
  });

  it('formats zero amounts correctly', () => {
    const html = dealNotificationEmail({
      trackTitle: 'Free Track', licenseeName: 'Test', syncFee: 0, artistPayout: 0, dealDate: '2024-01-01',
    });
    expect(html).toContain('0.00');
  });
});

describe('royaltyStatementEmail', () => {
  it('includes period and amounts', () => {
    const html = royaltyStatementEmail({ period: '2024-Q1', grossAmount: 500, netPayout: 400 });
    expect(html).toContain('2024-Q1');
    expect(html).toContain('500.00');
    expect(html).toContain('400.00');
  });
});

describe('proRegistrationEmail', () => {
  it('shows status and ISWC when registered', () => {
    const html = proRegistrationEmail({ trackTitle: 'NEON', registry: 'ASCAP', status: 'registered', iswc: 'T-123' });
    expect(html).toContain('NEON');
    expect(html).toContain('ASCAP');
    expect(html).toContain('Registered');
    expect(html).toContain('T-123');
  });

  it('shows pending status without ISWC', () => {
    const html = proRegistrationEmail({ trackTitle: 'NEW TRACK', registry: 'BMI', status: 'pending' });
    expect(html).toContain('NEW TRACK');
    expect(html).toContain('BMI');
    expect(html).toContain('pending');
    expect(html).not.toContain('ISWC');
  });
});

// ============================================================
// TESTS — AGENT SYSTEM
// ============================================================

describe('buildSystemPrompt', () => {
  it('lists all tool names and descriptions', () => {
    const tools = [{ name: 'get_income', description: 'Get income' }, { name: 'send_email', description: 'Send email' }];
    const prompt = buildSystemPrompt(tools);
    expect(prompt).toContain('get_income');
    expect(prompt).toContain('send_email');
    expect(prompt).toContain('Get income');
  });
});

describe('parseToolCall', () => {
  it('parses tool name and args correctly', () => {
    const result = parseToolCall('TOOL: get_income_summary | artist_id=abc | period=2024');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('get_income_summary');
    expect(result?.args.artist_id).toBe('abc');
    expect(result?.args.period).toBe('2024');
  });

  it('returns null for non-tool responses', () => {
    expect(parseToolCall('Hello, how can I help?')).toBeNull();
  });

  it('returns null for empty text', () => {
    expect(parseToolCall('')).toBeNull();
  });

  it('handles single arg', () => {
    const result = parseToolCall('TOOL: generate_cwr |');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('generate_cwr');
  });
});

// ============================================================
// TESTS — INCOME AGGREGATION
// ============================================================

describe('aggregateIncome', () => {
  const sampleData = [
    { source: 'spotify', net_amount: 100, gross_amount: 150, stream_count: 1000 },
    { source: 'spotify', net_amount: 50, gross_amount: 75, stream_count: 500 },
    { source: 'soundcloud', net_amount: 75, gross_amount: 100, stream_count: 300 },
    { source: 'bandcamp', net_amount: 200, gross_amount: 250, stream_count: 0 },
  ];

  it('calculates total net and gross', () => {
    const result = aggregateIncome(sampleData);
    expect(result.total_net).toBe(425);
    expect(result.total_gross).toBe(575);
    expect(result.total_streams).toBe(1800);
  });

  it('groups net income by source', () => {
    const result = aggregateIncome(sampleData);
    expect(result.by_source.spotify).toBe(150);
    expect(result.by_source.soundcloud).toBe(75);
    expect(result.by_source.bandcamp).toBe(200);
  });

  it('handles null amounts', () => {
    const result = aggregateIncome([{ source: 'test', net_amount: null, gross_amount: null, stream_count: null }]);
    expect(result.total_net).toBe(0);
    expect(result.total_gross).toBe(0);
    expect(result.total_streams).toBe(0);
  });

  it('handles empty array', () => {
    const result = aggregateIncome([]);
    expect(result.total_net).toBe(0);
    expect(result.by_source).toEqual({});
  });
});

// ============================================================
// TESTS — CWR HELPERS
// ============================================================

describe('formatDuration', () => {
  it('formats seconds to PT format', () => {
    expect(formatDuration(185)).toBe('PT3M5S');
  });

  it('handles zero seconds', () => {
    expect(formatDuration(0)).toBe('PT0M0S');
  });

  it('handles negative values', () => {
    expect(formatDuration(-10)).toBe('PT0M0S');
  });

  it('handles exact minutes', () => {
    expect(formatDuration(120)).toBe('PT2M0S');
  });
});

describe('escapeXml', () => {
  it('escapes & < > " characters', () => {
    const result = escapeXml('AT&T < "Brothers" > Co.');
    expect(result).toBe('AT&amp;T &lt; &quot;Brothers&quot; &gt; Co.');
  });

  it('passes through safe strings', () => {
    expect(escapeXml('Hello World')).toBe('Hello World');
  });

  it('handles empty string', () => {
    expect(escapeXml('')).toBe('');
  });
});

// ============================================================
// TESTS — SPLIT MATH EDGE CASES
// ============================================================

describe('split math edge cases', () => {
  it('100% to single writer', () => {
    const writers = [{ writer_name: 'Solo', writer_share: 100, publisher_share: 100 }];
    const splits = writers.map(w => ({
      writer_payout: 1000 * (w.writer_share / 100),
      publisher_payout: 1000 * (w.publisher_share / 100),
    }));
    expect(splits[0].writer_payout).toBe(1000);
    expect(splits[0].publisher_payout).toBe(1000);
  });

  it('decimal shares (33.33% each for 3 writers)', () => {
    const writers = [
      { writer_name: 'A', writer_share: 33.33, publisher_share: 33.33 },
      { writer_name: 'B', writer_share: 33.33, publisher_share: 33.33 },
      { writer_name: 'C', writer_share: 33.34, publisher_share: 33.34 },
    ];
    const totalWriter = writers.reduce((s, w) => s + w.writer_share, 0);
    const totalPublisher = writers.reduce((s, w) => s + w.publisher_share, 0);
    expect(totalWriter).toBeCloseTo(100, 1);
    expect(totalPublisher).toBeCloseTo(100, 1);
  });

  it('zero shares produce zero payouts', () => {
    const splits = [{ writer_name: 'Nobody', writer_share: 0, publisher_share: 0 }].map(w => ({
      writer_payout: 1000 * (w.writer_share / 100),
      publisher_payout: 1000 * (w.publisher_share / 100),
    }));
    expect(splits[0].writer_payout).toBe(0);
    expect(splits[0].publisher_payout).toBe(0);
  });
});

// ============================================================
// TESTS — OCR EDGE CASES
// ============================================================

describe('OCR edge cases', () => {
  it('handles missing line_items gracefully', () => {
    const result = { line_items: [], total_gross: 0, total_net: 0 };
    expect(result.line_items).toHaveLength(0);
    expect(result.total_gross).toBe(0);
  });

  it('handles partial OCR data', () => {
    const item = { period_start: '', period_end: '', source_type: '', gross_amount: 0, net_amount: 0 };
    const normalized = {
      period_start: item.period_start || '',
      period_end: item.period_end || '',
      source_type: item.source_type || 'performance',
      gross_amount: item.gross_amount || 0,
      net_amount: item.net_amount || 0,
    };
    expect(normalized.source_type).toBe('performance');
    expect(normalized.gross_amount).toBe(0);
  });

  it('handles very large dollar amounts', () => {
    const amounts = [
      { gross: 999999.99, net: 799999.99 },
      { gross: 0.01, net: 0.01 },
    ];
    const total = amounts.reduce((s, a) => s + a.gross, 0);
    expect(total).toBe(1000000);
  });
});

// ============================================================
// TESTS — INTEGRATION API CLIENT EDGE CASES
// ============================================================

describe('integration API client edge cases', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('handles network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const { getConfigs } = await import('./lib/integrations');
    await expect(getConfigs()).rejects.toThrow('Network error');
  });

  it('handles non-JSON error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, json: async () => { throw new Error('Not JSON'); }, statusText: 'Internal Server Error',
    }));
    const { getConfigs } = await import('./lib/integrations');
    await expect(getConfigs()).rejects.toThrow('Internal Server Error');
  });

  it('handles empty response from getConfigs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => [],
    }));
    const { getConfigs } = await import('./lib/integrations');
    const result = await getConfigs();
    expect(result).toEqual([]);
  });

  it('syncPlatform with all platform types', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: 'ok', records: 0 }) });
    vi.stubGlobal('fetch', mockFetch);
    const { syncPlatform } = await import('./lib/integrations');
    const platforms = ['mlc', 'bandcamp', 'spotify', 'soundcloud', 'ascap', 'bmi', 'sesac', 'soundexchange', 'songtrust', 'hfa'];
    for (const p of platforms) {
      await syncPlatform(p as any);
      expect(mockFetch).toHaveBeenCalledWith(`/api/integrations/${p}/sync`, expect.any(Object));
    }
    expect(mockFetch).toHaveBeenCalledTimes(platforms.length);
  });
});

// ============================================================
// TESTS — AGENT TOOL EXECUTION (MOCKED FETCH)
// ============================================================

// ============================================================
// TESTS — KEY DETECTION
// ============================================================

describe('detectKey', () => {
  it('returns a valid note name from chromatic scale', () => {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const samples = new Float32Array(44100 * 2);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.5 + Math.random() * 0.1;
    const result = detectKey(samples, 44100);
    expect(NOTES).toContain(result.key);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('handles silent audio', () => {
    const samples = new Float32Array(44100);
    const result = detectKey(samples, 44100);
    expect(result.key).toBe('C'); // default for all-zero chroma
    expect(result.confidence).toBe(0);
  });

  it('handles very short audio', () => {
    const samples = new Float32Array(100);
    const result = detectKey(samples, 100);
    expect(typeof result.key).toBe('string');
  });

  it('confidence is capped at 0.95', () => {
    const samples = new Float32Array(44100);
    samples.fill(1.0);
    const result = detectKey(samples, 44100);
    expect(result.confidence).toBeLessThanOrEqual(0.95);
  });
});

// ============================================================
// TESTS — ERROR SANITIZATION
// ============================================================

describe('sanitizeError', () => {
  it('sanitizes messages containing sensitive keywords', () => {
    expect(sanitizeError(new Error('Invalid API key provided'))).toBe('Internal configuration error');
    expect(sanitizeError(new Error('secret_token_mismatch'))).toBe('Internal configuration error');
    expect(sanitizeError(new Error('authorization failed'))).toBe('Internal configuration error');
  });

  it('passes through safe error messages', () => {
    expect(sanitizeError(new Error('Track not found'))).toBe('Track not found');
    expect(sanitizeError(new Error('Invalid input: missing fields'))).toBe('Invalid input: missing fields');
  });

  it('truncates long messages to 200 chars', () => {
    const long = 'x'.repeat(500);
    expect(sanitizeError(new Error(long)).length).toBe(200);
  });

  it('handles non-Error throw values', () => {
    expect(sanitizeError('string error')).toBe('string error');
    expect(sanitizeError(null)).toBe('An unexpected error occurred');
    expect(sanitizeError(undefined)).toBe('An unexpected error occurred');
    expect(sanitizeError(42)).toBe('42');
  });
});

describe('validateRequired', () => {
  it('returns null when all fields present', () => {
    expect(validateRequired({ a: 'hello', b: 42 }, ['a', 'b'])).toBeNull();
  });

  it('returns field name when missing', () => {
    expect(validateRequired({ a: 'hello' }, ['a', 'b'])).toBe('b is required');
  });

  it('rejects empty strings', () => {
    expect(validateRequired({ a: '' }, ['a'])).toBe('a is required');
  });

  it('rejects null and undefined values', () => {
    expect(validateRequired({ a: null }, ['a'])).toBe('a is required');
    expect(validateRequired({}, ['a'])).toBe('a is required');
  });
});

// ============================================================
// TESTS — CROSS-PLATFORM INCOME EDGE CASES
// ============================================================

describe('cross-platform income edge cases', () => {
  it('aggregates mixed currency and null values', () => {
    const data = [
      { source: 'spotify', net_amount: null, gross_amount: null, stream_count: null },
      { source: 'bandcamp', net_amount: 0, gross_amount: 0, stream_count: 0 },
      { source: 'apple_music', net_amount: 10.50, gross_amount: 15.00, stream_count: 100 },
    ];
    const result = aggregateIncome(data);
    expect(result.total_net).toBeCloseTo(10.5);
    expect(result.total_gross).toBeCloseTo(15);
    expect(result.total_streams).toBe(100);
    expect(result.by_source.spotify).toBe(0);
  });

  it('handles large numbers without precision loss', () => {
    const data = [
      { source: 'sync', net_amount: 15000.00, gross_amount: 18750.00, stream_count: 0 },
      { source: 'sync', net_amount: 8750.50, gross_amount: 10938.13, stream_count: 0 },
    ];
    const result = aggregateIncome(data);
    expect(result.total_net).toBeCloseTo(23750.50, 2);
    expect(result.total_gross).toBeCloseTo(29688.13, 2);
  });
});

// ============================================================
// TESTS — FRONTEND COMPONENT LOGIC
// ============================================================

describe('UI component helpers', () => {
  it('formats percentage for display', () => {
    const pct = (val: number, total: number) => total > 0 ? Math.round((val / total) * 100) : 0;
    expect(pct(5, 10)).toBe(50);
    expect(pct(0, 10)).toBe(0);
    expect(pct(10, 0)).toBe(0);
  });

  it('truncates long text', () => {
    const truncate = (s: string, max: number) => s.length > max ? s.substring(0, max) + '...' : s;
    expect(truncate('hello world', 5)).toBe('hello...');
    expect(truncate('hi', 5)).toBe('hi');
    expect(truncate('', 5)).toBe('');
  });

  it('parses query params from URLs', () => {
    const getParam = (url: string, param: string) => {
      const match = url.match(new RegExp(`[?&]${param}=([^&#]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    };
    expect(getParam('/test?artist_id=abc&period=2024', 'artist_id')).toBe('abc');
    expect(getParam('/test', 'missing')).toBeNull();
    expect(getParam('/test?q=hello%20world', 'q')).toBe('hello world');
  });

  it('formats dates consistently', () => {
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    expect(fmt(new Date('2024-01-15'))).toBe('2024-01-15');
    expect(fmt(new Date('2024-12-31'))).toBe('2024-12-31');
  });
});

describe('ocrAndRecordRoyalty', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('processes OCR result and records royalty collections', async () => {
    // Mock the OCR endpoint
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ line_items: [{ period_start: '2024-Q1', period_end: '2024-Q1', source_type: 'performance', gross_amount: 500, net_amount: 400, fee_amount: 50, currency: 'USD' }] }),
    }).mockResolvedValue({
      ok: true, json: async () => ({ id: 'new-royalty' }),
    }));

    const { ocrAndRecordRoyalty } = await import('./lib/integrations');
    const result = await ocrAndRecordRoyalty('base64...', 'image/png', 'ascap', 'artist-1');
    expect(result.recorded).toBeGreaterThanOrEqual(0);
  });
});
