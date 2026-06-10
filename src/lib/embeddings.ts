// Text embedding generation and cosine similarity

/**
 * Generate a text embedding via Gemini API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Generate a semantic embedding vector (384 dimensions) for the following text. Return ONLY a JSON array of numbers, no other text:\n\n${text}`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Embedding generation failed');

  try {
    const jsonMatch = data.text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) throw new Error('No embedding array in response');
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    throw new Error('Invalid embedding format');
  } catch {
    // Fallback: return zeros (non-functional but non-breaking)
    return new Array(384).fill(0);
  }
}

/**
 * Build a searchable text from track metadata for embedding
 */
export function buildTrackEmbeddingText(track: {
  title: string;
  genre?: string | null;
  mood_tags?: string[] | null;
  bpm?: number | null;
  key_signature?: string | null;
  energy_level?: string | null;
  instrumentation?: string[] | null;
}): string {
  const parts: string[] = [track.title];
  if (track.genre) parts.push(`Genre: ${track.genre}`);
  if (track.mood_tags?.length) parts.push(`Mood: ${track.mood_tags.join(', ')}`);
  if (track.bpm) parts.push(`BPM: ${track.bpm}`);
  if (track.key_signature) parts.push(`Key: ${track.key_signature}`);
  if (track.energy_level) parts.push(`Energy: ${track.energy_level}`);
  if (track.instrumentation?.length) parts.push(`Instruments: ${track.instrumentation.join(', ')}`);
  return parts.join('. ');
}

/**
 * Build searchable text from a brief for matching
 */
export function buildBriefEmbeddingText(brief: {
  project_name: string;
  use_type?: string | null;
  mood_tags?: string[] | null;
  bpm_min?: number | null;
  bpm_max?: number | null;
  details?: string | null;
}): string {
  const parts: string[] = [brief.project_name];
  if (brief.use_type) parts.push(`Use type: ${brief.use_type}`);
  if (brief.mood_tags?.length) parts.push(`Required mood: ${brief.mood_tags.join(', ')}`);
  if (brief.bpm_min || brief.bpm_max) {
    parts.push(`BPM range: ${brief.bpm_min || '—'} to ${brief.bpm_max || '—'}`);
  }
  if (brief.details) parts.push(`Details: ${brief.details}`);
  return parts.join('. ');
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

/**
 * Rank tracks by similarity to a query embedding
 */
export function rankBySimilarity(
  queryEmbedding: number[],
  tracks: { id: string; title: string; embedding: number[]; metadata?: Record<string, any> }[]
): { track_id: string; title: string; score: number; metadata?: Record<string, any> }[] {
  return tracks
    .map(t => ({
      track_id: t.id,
      title: t.title,
      score: cosineSimilarity(queryEmbedding, t.embedding),
      metadata: t.metadata,
    }))
    .sort((a, b) => b.score - a.score)
    .filter(t => t.score > 0.1);
}
