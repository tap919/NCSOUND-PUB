/// <reference types="vite/client" />

// ============================================================
// Integration Service Library
// Handles API communication with all 3rd party music platforms
// ============================================================

// === TYPES ===

export interface IntegrationConfig {
  id: string;
  platform: IntegrationPlatform;
  config_key: string;
  config_value: string;
  artist_id: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type IntegrationPlatform =
  | 'mlc' | 'bandcamp' | 'spotify' | 'soundcloud'
  | 'ascap' | 'bmi' | 'sesac' | 'soundexchange'
  | 'songtrust' | 'hfa' | 'tuneregistry' | 'apple_music';

export interface PlatformIncomeRecord {
  id?: string;
  track_id: string;
  artist_id: string;
  platform: string;
  period_start: string;
  period_end: string;
  stream_count?: number;
  download_count?: number;
  gross_revenue?: number;
  net_revenue?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface RoyaltyCollectionRecord {
  id?: string;
  artist_id: string;
  collection_entity: string;
  period_start: string;
  period_end: string;
  source_type?: string;
  gross_amount?: number;
  net_amount?: number;
  fee_amount?: number;
  currency?: string;
  statement_url?: string;
  notes?: string;
}

export interface IncomeSummary {
  artist_id: string;
  source: string;
  source_type: 'platform' | 'royalty';
  period_start: string;
  period_end: string;
  gross_amount: number | null;
  net_amount: number | null;
  stream_count: number | null;
  download_count: number | null;
  track_id: string | null;
}

export interface TrackSplitCalculation {
  track_id: string;
  track_title: string;
  total_income: number;
  splits: {
    writer_name: string;
    pro_affiliation: string | null;
    ipi_number: string | null;
    writer_share: number;
    publisher_share: number;
    writer_payout: number;
    publisher_payout: number;
  }[];
}

// === API CLIENT ===

const BASE = '/api/integrations';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

// === CONFIG MANAGEMENT ===

export async function saveConfig(
  platform: IntegrationPlatform,
  configKey: string,
  configValue: string,
  artistId?: string
): Promise<IntegrationConfig> {
  return apiFetch<IntegrationConfig>('/config', {
    method: 'POST',
    body: JSON.stringify({ platform, config_key: configKey, config_value: configValue, artist_id: artistId }),
  });
}

export async function getConfigs(platform?: IntegrationPlatform): Promise<IntegrationConfig[]> {
  const qs = platform ? `?platform=${platform}` : '';
  return apiFetch<IntegrationConfig[]>(`/configs${qs}`);
}

export async function deleteConfig(id: string): Promise<void> {
  await apiFetch<void>(`/config/${id}`, { method: 'DELETE' });
}

// === INCOME & ROYALTIES ===

export async function getIncomeSummary(
  artistId?: string,
  periodStart?: string,
  periodEnd?: string
): Promise<IncomeSummary[]> {
  const qs = new URLSearchParams();
  if (artistId) qs.set('artist_id', artistId);
  if (periodStart) qs.set('period_start', periodStart);
  if (periodEnd) qs.set('period_end', periodEnd);
  return apiFetch<IncomeSummary[]>(`/summary?${qs}`);
}

export async function getTrackIncome(trackId: string): Promise<PlatformIncomeRecord[]> {
  return apiFetch<PlatformIncomeRecord[]>(`/track/${trackId}`);
}

export async function addPlatformIncome(record: PlatformIncomeRecord): Promise<PlatformIncomeRecord> {
  return apiFetch<PlatformIncomeRecord>('/platform-income', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export async function addRoyaltyCollection(record: RoyaltyCollectionRecord): Promise<RoyaltyCollectionRecord> {
  return apiFetch<RoyaltyCollectionRecord>('/royalty-collection', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

// === SPLIT CALCULATION ===

export async function calculateTrackSplits(trackId: string, incomeAmount?: number): Promise<TrackSplitCalculation> {
  const qs = incomeAmount ? `?income=${incomeAmount}` : '';
  return apiFetch<TrackSplitCalculation>(`/splits/${trackId}${qs}`);
}

// === PLATFORM SYNC ===

export async function syncPlatform(platform: IntegrationPlatform): Promise<{ message: string; records: number }> {
  return apiFetch(`/${platform}/sync`, { method: 'POST' });
}

// === CWR ===

export async function generateCwr(): Promise<{ id: string; file_name: string; record_count: number }> {
  return apiFetch('/cwr/generate', { method: 'POST' });
}

export async function getCwrExports() {
  return apiFetch('/cwr/exports');
}

// === OCR: Royalty Statement Processing ===

export interface OcrResult {
  line_items: {
    period_start: string;
    period_end: string;
    source_type: string;
    gross_amount: number;
    net_amount: number;
    fee_amount: number;
    currency: string;
    notes?: string;
  }[];
  total_gross?: number;
  total_net?: number;
  period_start?: string;
  period_end?: string;
}

export async function processStatementOcr(
  imageBase64: string,
  mimeType: string,
  entity: string
): Promise<OcrResult> {
  const res = await fetch('/api/ocr/statement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, entity }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function ocrAndRecordRoyalty(
  imageBase64: string,
  mimeType: string,
  entity: string,
  artistId: string
): Promise<{ recorded: number }> {
  const result = await processStatementOcr(imageBase64, mimeType, entity);
  let recorded = 0;
  for (const item of result.line_items) {
    try {
      await addRoyaltyCollection({
        artist_id: artistId,
        collection_entity: entity,
        period_start: item.period_start || result.period_start || '',
        period_end: item.period_end || result.period_end || '',
        source_type: item.source_type || 'performance',
        gross_amount: item.gross_amount || 0,
        net_amount: item.net_amount || 0,
        fee_amount: item.fee_amount || 0,
        currency: item.currency || 'USD',
        notes: item.notes || `OCR import from ${entity}`,
      });
      recorded++;
    } catch { /* skip duplicates */ }
  }
  return { recorded };
}

// === SPOTIFY HELPERS ===

export function getSpotifyAuthUrl(redirectUri: string): string {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
  const scopes = ['user-library-read', 'user-top-read'];
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    response_type: 'code',
    show_dialog: 'true',
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}
