import { useState, useEffect } from 'react';

export default function AiPitchTab() {
  const [briefId, setBriefId] = useState('');
  const [briefText, setBriefText] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [pitch, setPitch] = useState<any>(null);
  const [outreachStats, setOutreachStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/outreach/stats').then(r => r.json()).then(d => { if (Array.isArray(d)) setOutreachStats(d); }).catch(() => {});
  }, []);

  const doMatch = async () => {
    setLoading(true);
    setMsg('Generating embeddings and matching...');
    try {
      await fetch('/api/embeddings/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const res = await fetch('/api/match/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId: briefId || undefined, briefText: briefText || undefined, limit: 20 }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
        setMsg(`Found ${data.matches.length} matching tracks`);
      } else {
        setMsg(data.message || 'No matches found');
      }
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
    setLoading(false);
  };

  const doGeneratePitch = async () => {
    const trackIds = matches.slice(0, 10).map(m => m.track_id);
    if (!trackIds.length) { setMsg('No tracks to pitch'); return; }
    setLoading(true);
    setMsg('Generating pitch...');
    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId: briefId || 'manual', trackIds }),
      });
      const data = await res.json();
      setPitch(data);
      setMsg('Pitch generated');
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
    setLoading(false);
  };

  const doCreateCampaign = async () => {
    if (!pitch) { setMsg('Generate a pitch first'); return; }
    setLoading(true);
    try {
      await fetch('/api/outreach/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pitch.subject?.substring(0, 100) || 'AI Pitch Campaign',
          subject: pitch.subject,
          body: pitch.email_body,
          brief_id: briefId || null,
        }),
      });
      setMsg('Campaign created! Go to Outreach tab to send.');
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div className="bg-neutral-800 border border-neutral-700 p-4 text-sm font-sans text-white flex justify-between">
          <span>{msg}</span>
          <button type="button" onClick={() => setMsg('')} className="text-neutral-400 hover:text-white">x</button>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-4">1. Enter Brief</h3>
        <textarea
          value={briefText}
          onChange={e => setBriefText(e.target.value)}
          placeholder="Paste a supervisor brief here, or enter a brief ID..."
          rows={4}
          className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white text-sm focus:border-orange-500 outline-none font-sans resize-none"
        />
        <div className="flex gap-3 mt-3">
          <input
            value={briefId}
            onChange={e => setBriefId(e.target.value)}
            placeholder="Or Brief ID (UUID)"
            className="flex-1 bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs font-mono focus:border-orange-500 outline-none"
          />
          <button type="button" onClick={doMatch} disabled={loading || (!briefText && !briefId)} className="bg-orange-500 text-black px-6 py-2 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
            {loading ? 'Matching...' : 'Match Catalog'}
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading uppercase tracking-wider text-white">2. Matched Tracks ({matches.length})</h3>
            <button type="button" onClick={doGeneratePitch} disabled={loading} className="bg-orange-500 text-black px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
              Generate Pitch
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-3 py-2 font-normal">Track</th>
                  <th className="px-3 py-2 font-normal">Genre</th>
                  <th className="px-3 py-2 font-normal">Mood</th>
                  <th className="px-3 py-2 font-normal">BPM</th>
                  <th className="px-3 py-2 font-normal text-right">Match Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {matches.map((m, i) => (
                  <tr key={i} className="hover:bg-neutral-800/50">
                    <td className="px-3 py-2 font-bold text-white uppercase tracking-wider text-xs">{m.title}</td>
                    <td className="px-3 py-2 text-xs text-neutral-400">{m.genre || '—'}</td>
                    <td className="px-3 py-2 text-xs text-neutral-400">{m.mood_tags?.slice(0, 2).join(', ') || '—'}</td>
                    <td className="px-3 py-2 text-xs font-mono">{m.bpm || '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-mono ${m.score > 0.6 ? 'text-green-500' : m.score > 0.3 ? 'text-orange-500' : 'text-neutral-500'}`}>
                        {Math.round(m.score * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pitch && (
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading uppercase tracking-wider text-white">3. Generated Pitch</h3>
            <div className="flex gap-2">
              <button type="button" onClick={doCreateCampaign} disabled={loading} className="bg-orange-500 text-black px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
                Create Campaign
              </button>
              <a
                href={`/api/disco/playlist`}
                onClick={async (e) => {
                  e.preventDefault();
                  const trackIds = matches.slice(0, 10).map(m => m.track_id);
                  const res = await fetch('/api/disco/playlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trackIds, playlistName: `AI Match - ${briefText?.substring(0, 30) || 'Curated'}` }),
                  });
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'disco-playlist.csv'; a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-neutral-950 border border-neutral-700 px-4 py-2 font-bold uppercase tracking-widest text-xs text-white hover:bg-neutral-800"
              >
                Export DISCO CSV
              </a>
            </div>
          </div>
          <div className="bg-black/50 border border-neutral-800 p-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Subject</p>
            <p className="text-sm text-white">{pitch.subject}</p>
          </div>
          <div className="bg-black/50 border border-neutral-800 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Email Body</p>
            <pre className="text-sm text-neutral-300 font-sans whitespace-pre-wrap">{pitch.email_body}</pre>
          </div>
          {pitch.disco_description && (
            <div className="bg-black/50 border border-neutral-800 p-4 mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">DISCO Playlist Description</p>
              <p className="text-sm text-neutral-300">{pitch.disco_description}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-4">Outreach Campaigns</h3>
        {outreachStats.length === 0 ? (
          <p className="text-sm text-neutral-500 font-sans">No campaigns yet. Generate a pitch and create a campaign.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-3 py-2 font-normal">Campaign</th>
                  <th className="px-3 py-2 font-normal">Status</th>
                  <th className="px-3 py-2 font-normal">Sent</th>
                  <th className="px-3 py-2 font-normal">Opened</th>
                  <th className="px-3 py-2 font-normal">Replied</th>
                  <th className="px-3 py-2 font-normal text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {outreachStats.map((c: any) => (
                  <tr key={c.id} className="hover:bg-neutral-800/50">
                    <td className="px-3 py-2 text-xs font-bold text-white">{c.title}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${c.status === 'sent' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-2 text-xs font-mono">{c.sent}</td>
                    <td className="px-3 py-2 text-xs font-mono text-orange-500">{c.opened}</td>
                    <td className="px-3 py-2 text-xs font-mono text-green-500">{c.replied}</td>
                    <td className="px-3 py-2 text-right text-xs font-mono">{c.sent > 0 ? `${Math.round(c.opened / c.sent * 100)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
