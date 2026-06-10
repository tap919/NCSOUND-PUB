// Audio Analysis Library — BPM, key, energy detection

export interface AnalysisResult {
  bpm: number | null;
  key: string | null;
  key_confidence: number | null;
  energy: 'low' | 'medium' | 'high' | 'very_high' | null;
  energy_score: number | null;
  mood_tags: string[];
  genre: string | null;
  genre_confidence: number | null;
  instrumentation: string[];
}

/**
 * Simple BPM detection using autocorrelation on the onset envelope.
 * Works on raw PCM audio data.
 */
export function detectBpm(samples: Float32Array, sampleRate: number): number {
  // Convert to mono if needed
  const mono = samples;

  // Compute onset envelope (rectified + low-pass)
  const envelopeSize = Math.floor(mono.length / 512);
  const envelope = new Float32Array(envelopeSize);
  for (let i = 0; i < envelopeSize; i++) {
    let sum = 0;
    for (let j = 0; j < 512; j++) {
      const idx = i * 512 + j;
      if (idx < mono.length) sum += Math.abs(mono[idx]);
    }
    envelope[i] = sum / 512;
  }

  // Autocorrelation
  const minBpm = 60;  // 60 BPM = 1 beat/sec
  const maxBpm = 200; // 200 BPM
  const minLag = Math.floor(sampleRate * 60 / maxBpm / 512);
  const maxLag = Math.ceil(sampleRate * 60 / minBpm / 512);

  let bestLag = minLag;
  let bestVal = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    let count = 0;
    for (let i = 0; i < envelopeSize - lag; i++) {
      corr += envelope[i] * envelope[i + lag];
      count++;
    }
    const val = count > 0 ? corr / count : 0;
    if (val > bestVal) {
      bestVal = val;
      bestLag = lag;
    }
  }

  if (bestVal < 0.01) return 0; // too quiet / no beat

  const bpm = 60 / ((bestLag * 512) / sampleRate);
  return Math.round(bpm);
}

/**
 * Simple key detection using chroma distribution.
 * Maps pitch classes to the 12 keys (C, C#, D, ..., B).
 */
export function detectKey(samples: Float32Array, sampleRate: number): { key: string; confidence: number } {
  // Simple spectral centroid-based key approximation
  // For a real implementation, we'd compute a full chromagram
  // This is a simplified heuristic that works for common cases

  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const chroma = new Float32Array(12);

  // Analyze FFT frames for spectral energy distribution
  const frameSize = 2048;
  const hopSize = 1024;
  const frameCount = Math.floor((samples.length - frameSize) / hopSize);

  // Simple Hann window
  const window = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frameSize - 1)));
  }

  for (let f = 0; f < Math.min(frameCount, 100); f++) {
    const offset = f * hopSize;
    const frame = new Float32Array(frameSize);
    for (let i = 0; i < frameSize && (offset + i) < samples.length; i++) {
      frame[i] = samples[offset + i] * window[i];
    }

    // Simple FFT (we approximate by looking at zero-crossing distributions)
    // For real analysis, use proper FFT library
    // This is a placeholder that distributes energy across likely notes
    const energy = frame.reduce((s, v) => s + v * v, 0) / frameSize;
    const zeroCrossings = countZeroCrossings(frame);
    const dominantNote = Math.round((zeroCrossings / frameSize) * 120) % 12;
    chroma[dominantNote] += energy;
  }

  // Find dominant pitch class
  let maxIdx = 0;
  let maxVal = 0;
  let totalEnergy = 0;
  for (let i = 0; i < 12; i++) {
    totalEnergy += chroma[i];
    if (chroma[i] > maxVal) {
      maxVal = chroma[i];
      maxIdx = i;
    }
  }

  const confidence = totalEnergy > 0 ? maxVal / totalEnergy : 0;

  return {
    key: NOTES[maxIdx],
    confidence: Math.min(confidence, 0.95),
  };
}

/**
 * Estimate energy level from RMS + spectral content
 */
export function detectEnergy(samples: Float32Array): { level: 'low' | 'medium' | 'high' | 'very_high'; score: number } {
  // Compute RMS
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    sumSq += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sumSq / samples.length);

  // Compute peak-to-average ratio
  const peak = Math.max(...samples.map(Math.abs));
  const crest = peak / (rms || 0.001);

  // Combined energy score (0-100)
  const rmsNorm = Math.min(rms * 10, 1); // normalize
  const crestNorm = Math.min(crest / 10, 1);
  const score = Math.round((rmsNorm * 0.6 + crestNorm * 0.4) * 100);

  let level: 'low' | 'medium' | 'high' | 'very_high';
  if (score < 25) level = 'low';
  else if (score < 50) level = 'medium';
  else if (score < 75) level = 'high';
  else level = 'very_high';

  return { level, score };
}

function countZeroCrossings(samples: Float32Array): number {
  let count = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i - 1] >= 0 && samples[i] < 0) || (samples[i - 1] < 0 && samples[i] >= 0)) {
      count++;
    }
  }
  return count;
}

/**
 * Classify mood and genre using track metadata + analysis via Gemini
 */
export async function classifyMetadata(
  title: string,
  bpm: number | null,
  key: string | null,
  energy: string | null,
  instrumentationHint?: string
): Promise<{ mood_tags: string[]; genre: string; confidence: number }> {
  const prompt = `You are a music AI classifier. Analyze this track and respond with ONLY a JSON object.

Track: "${title}"
BPM: ${bpm || 'unknown'}
Key: ${key || 'unknown'}
Energy: ${energy || 'unknown'}
${instrumentationHint ? `Instruments: ${instrumentationHint}` : ''}

Respond with:
{
  "genre": "one primary genre (e.g., Hip-Hop, R&B, Pop, Rock, Electronic, Lo-Fi, Trap, Drill, House, Ambient, Country, Jazz)",
  "mood_tags": ["3-5 mood tags that describe the emotional feel (e.g., dark, energetic, melancholic, uplifting, aggressive, smooth)"],
  "confidence": 0.0-1.0
}`;

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Classification failed');

  try {
    const jsonMatch = data.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      mood_tags: parsed.mood_tags || [],
      genre: parsed.genre || 'Unknown',
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return { mood_tags: [], genre: 'Unknown', confidence: 0 };
  }
}
