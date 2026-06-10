import { useState, useEffect } from 'react';
import { BrainCircuit, Music, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface BriefInput {
  genre?: string;
  mood?: string;
  bpmMin?: number;
  bpmMax?: number;
  energy?: string;
}

export function BriefMatcher({ brief }: { brief: BriefInput }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchTracks();
  }, [brief]);

  const matchTracks = async () => {
    setLoading(true);
    let results: any[] = [];

    // Try Gemini API first for AI-powered matching
    try {
      const prompt = `Given a music supervisor brief looking for tracks with: genre=${brief.genre || 'any'}, mood=${brief.mood || 'any'}, bpm=${brief.bpmMin || 'any'}-${brief.bpmMax || 'any'}, energy=${brief.energy || 'any'}, return a JSON array of track IDs that would match. Only respond with valid JSON, no explanations.`;

      const geminiRes = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        if (geminiData.text) {
          try {
            const parsed = JSON.parse(geminiData.text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const { data } = await supabase
                .from('tracks')
                .select('*, artists(stage_name)')
                .in('id', parsed)
                .limit(10);
              if (data) results = data;
            }
          } catch {}
        }
      }
    } catch {}

    // Fallback: SQL-based matching
    if (results.length === 0) {
      let query = supabase
        .from('tracks')
        .select('*, artists(stage_name)')
        .eq('status', 'active')
        .in('visibility', ['public', 'supervisors_only']);

      if (brief.genre) query = query.ilike('genre', `%${brief.genre}%`);
      if (brief.bpmMin) query = query.gte('bpm', brief.bpmMin);
      if (brief.bpmMax) query = query.lte('bpm', brief.bpmMax);
      if (brief.energy) query = query.ilike('energy_level', `%${brief.energy}%`);

      const { data } = await query.limit(10);
      results = data || [];

      if (brief.mood && results.length > 0) {
        const moodLower = brief.mood.toLowerCase();
        results = results.filter((t: any) =>
          t.mood_tags?.some((m: string) => m.toLowerCase().includes(moodLower))
        );
      }
    }

    setMatches(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="animate-pulse h-16 bg-neutral-800 border border-neutral-800" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 border border-neutral-800 bg-neutral-900">
        <BrainCircuit className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
        <p className="text-sm font-sans text-neutral-500">No matching tracks found. Try broadening your criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">AI Match Results</span>
        </div>
        <span className="text-[10px] font-mono text-neutral-500">{matches.length} matches</span>
      </div>
      <div className="space-y-2">
        {matches.map((track) => (
          <Link
            key={track.id}
            to={`/catalog/${track.id}`}
            className="flex items-center justify-between bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition-colors p-4 group"
          >
            <div className="flex items-center gap-4">
              <Music className="w-5 h-5 text-neutral-600 group-hover:text-orange-500 transition-colors" />
              <div>
                <h4 className="text-sm font-heading uppercase tracking-wider text-white">{track.title}</h4>
                <p className="text-[10px] text-neutral-500 font-sans">{track.artists?.stage_name || 'NcSound Artist'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              {track.genre && <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 uppercase font-bold tracking-widest">{track.genre}</span>}
              {track.bpm && <span className="text-neutral-500 font-mono">{track.bpm} BPM</span>}
              {track.energy_level && <span className="text-neutral-500">{track.energy_level}</span>}
              <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
