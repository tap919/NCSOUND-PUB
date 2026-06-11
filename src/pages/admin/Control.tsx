import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Database, Users, TrendingUp, Music, BarChart3, Radio, DollarSign, Globe, Clock, Cpu, HardDrive, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminControl() {
  const [health, setHealth] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/health').then(r => r.json()),
      fetch('/api/analytics/admin').then(r => r.json()).catch(() => null),
    ]).then(([h, a]) => { setHealth(h); setAdmin(a); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 p-6 md:p-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-10 border-b border-neutral-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">
            Control <span className="text-orange-500">Center</span>
          </h1>
          <p className="text-neutral-400 font-sans mt-2">System monitoring, site control, and personal catalog oversight.</p>
        </div>
        <Link to="/admin/dashboard" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
          ← Back to Admin
        </Link>
      </div>

      {/* Row 1: System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-heading uppercase tracking-wider text-white">API Status</h3>
          </div>
          <p className="text-sm font-mono text-green-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {health?.status === 'ok' ? 'Healthy' : 'Unreachable'}
          </p>
          <p className="text-xs text-neutral-500 mt-2 font-mono">Server running on port 3000</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-heading uppercase tracking-wider text-white">Database</h3>
          </div>
          <p className="text-sm font-mono text-green-500">Connected</p>
          <p className="text-xs text-neutral-500 mt-2 font-mono">Supabase PostgreSQL</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-heading uppercase tracking-wider text-white">Storage</h3>
          </div>
          <p className="text-sm font-mono text-neutral-300">5 buckets</p>
          <p className="text-xs text-neutral-500 mt-2 font-mono">track-audio, licenses, cover-art, analysis, cwr-exports</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-heading uppercase tracking-wider text-white">Cron Jobs</h3>
          </div>
          <p className="text-sm font-mono text-green-500">4 active</p>
          <p className="text-xs text-neutral-500 mt-2 font-mono">Daily, Weekly, 6hr cycles</p>
        </div>
      </div>

      {/* Row 2: Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-6">Platform Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard icon={Music} label="Total Catalog" value={admin?.total_catalog || 0} />
            <MetricCard icon={Users} label="Active Artists" value={admin?.active_artists || 0} />
            <MetricCard icon={Radio} label="Supervisors" value={admin?.supervisor_accounts || 0} />
            <MetricCard icon={BarChart3} label="MTD Placements" value={admin?.mtd_placements || 0} />
            <MetricCard icon={DollarSign} label="Total Income" value={`$${(admin?.total_income || 0).toLocaleString()}`} />
            <MetricCard icon={Activity} label="Cue Sheets" value={admin?.active_cue_sheets || 0} />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <h3 className="text-lg font-heading uppercase tracking-wider text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <ActionButton label="Run Batch Metadata Check" icon={Activity} onClick={() => fetch('/api/quality/scores').then(r => r.json()).then(d => alert(`Quality score: ${d.overall}%`))} />
            <ActionButton label="Generate CWR Export" icon={Database} onClick={() => fetch('/api/integrations/cwr/generate', { method: 'POST' }).then(r => r.json()).then(d => alert(`CWR generated: ${d.record_count} works`))} />
            <ActionButton label="Sync All Platform Integrations" icon={Globe} onClick={async () => {
              const platforms = ['spotify','soundcloud','bandcamp','ascap','bmi','sesac','soundexchange','hfa'];
              for (const p of platforms) {
                try { await fetch(`/api/integrations/${p}/sync`, { method: 'POST' }); } catch {}
              }
              alert('Sync initiated for all platforms');
            }} />
            <ActionButton label="Generate DDEX Feed" icon={ArrowUp} onClick={() => fetch('/api/ddex/generate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({trackIds:[]}) }).then(r => r.blob()).then(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ddex-ern.xml'; a.click(); })} />
          </div>
        </div>
      </div>

      {/* Row 3: My Music Section (admin-as-artist) */}
      <MyMusicPanel />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="bg-black/50 border border-neutral-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-orange-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{label}</span>
      </div>
      <p className="text-2xl font-mono text-white">{value}</p>
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick }: { label: string; icon: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 bg-black/50 border border-neutral-800 px-4 py-3 hover:bg-neutral-800 transition-colors text-left">
      <Icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
      <span className="text-sm font-bold uppercase tracking-widest text-white">{label}</span>
    </button>
  );
}

function MyMusicPanel() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      const { data } = await supabase.from('tracks').select('*, track_writers(*)').order('created_at', { ascending: false });
      if (data) setTracks(data as any);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-heading uppercase tracking-wider text-white">My Catalog</h3>
        </div>
        <div className="text-xs text-neutral-500 font-mono">{tracks.length} tracks</div>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-neutral-800" />)}
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 font-sans text-sm">No tracks in catalog.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal">Genre</th>
                <th className="px-4 py-3 font-normal">BPM</th>
                <th className="px-4 py-3 font-normal">ISRC</th>
                <th className="px-4 py-3 font-normal">Writers</th>
                <th className="px-4 py-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {tracks.map((t: any) => (
                <tr key={t.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-white uppercase tracking-wider text-xs">{t.title}</td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{t.genre || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{t.bpm || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-neutral-500">{t.isrc || '—'}</td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{(t.track_writers || []).map((w: any) => w.writer_name).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${t.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
