import { useState, useEffect } from 'react';
import { Music, Headphones, Globe, Radio, DollarSign, Database, ScanText, Upload } from 'lucide-react';

export default function IntegrationsTab() {
  return <IntegrationsPanel />;
}

function IntegrationsPanel() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [syncMsg, setSyncMsg] = useState('');
  const [cwrResult, setCwrResult] = useState('');

  useEffect(() => { loadConfigs(); }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations/configs');
      const data = await res.json();
      setConfigs(Array.isArray(data) ? data : []);
    } catch { setConfigs([]); }
    finally { setLoading(false); }
  };

  const saveConfig = async (platform: string, key: string, value: string) => {
    await fetch('/api/integrations/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, config_key: key, config_value: value }),
    });
    await loadConfigs();
  };

  const syncPlatform = async (platform: string) => {
    setSyncMsg(`Syncing ${platform}...`);
    try {
      const res = await fetch(`/api/integrations/${platform}/sync`, { method: 'POST' });
      const data = await res.json();
      setSyncMsg(data.message || `${platform} sync complete`);
    } catch (err: any) {
      setSyncMsg(`Sync failed: ${err.message}`);
    }
  };

  const generateCwr = async () => {
    setCwrResult('Generating CWR...');
    try {
      const res = await fetch('/api/integrations/cwr/generate', { method: 'POST' });
      const data = await res.json();
      setCwrResult(`CWR generated: ${data.file_name} (${data.record_count} works)`);
    } catch (err: any) {
      setCwrResult(`CWR failed: ${err.message}`);
    }
  };

  const getConfig = (platform: string, key: string) => {
    const c = configs.find((x: any) => x.platform === platform && x.config_key === key);
    return c?.config_value || '';
  };

  const PLATFORMS = [
    { id: 'spotify', label: 'Spotify', icon: Music, configs: [
      { key: 'client_id', label: 'Client ID' },
      { key: 'client_secret', label: 'Client Secret' },
    ]},
    { id: 'soundcloud', label: 'SoundCloud', icon: Headphones, configs: [
      { key: 'client_id', label: 'Client ID' },
      { key: 'client_secret', label: 'Client Secret' },
    ]},
    { id: 'bandcamp', label: 'Bandcamp', icon: Globe, configs: [
      { key: 'bandcamp_url', label: 'Bandcamp URL' },
    ]},
    { id: 'apple_music', label: 'Apple Music', icon: Music, configs: [
      { key: 'team_id', label: 'Team ID' },
      { key: 'key_id', label: 'Key ID' },
    ]},
    { id: 'ascap', label: 'ASCAP', icon: Radio, configs: [
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password' },
    ]},
    { id: 'bmi', label: 'BMI', icon: Radio, configs: [
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password' },
    ]},
    { id: 'sesac', label: 'SESAC', icon: Radio, configs: [
      { key: 'account_id', label: 'Account ID' },
    ]},
    { id: 'soundexchange', label: 'SoundExchange', icon: DollarSign, configs: [
      { key: 'account_id', label: 'Account ID' },
    ]},
    { id: 'songtrust', label: 'SongTrust', icon: DollarSign, configs: [
      { key: 'account_id', label: 'Account ID' },
    ]},
    { id: 'hfa', label: 'Harry Fox Agency', icon: DollarSign, configs: [
      { key: 'account_id', label: 'Account ID' },
    ]},
    { id: 'mlc', label: 'The MLC', icon: Database, configs: [
      { key: 'account_id', label: 'Account ID' },
    ]},
    { id: 'tuneregistry', label: 'TuneRegistry', icon: Radio, configs: [
      { key: 'api_key', label: 'API Key' },
    ]},
  ];

  return (
    <div className="space-y-8">
      {syncMsg && (
        <div className="bg-neutral-800 border border-neutral-700 p-4 text-sm font-sans text-white">
          {syncMsg}
          <button type="button" onClick={() => setSyncMsg('')} className="ml-4 text-neutral-400 hover:text-white">x</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {PLATFORMS.filter(p => p.id !== 'mlc').map((platform) => (
          <div key={platform.id} className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <platform.icon className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-heading uppercase tracking-wider text-white">{platform.label}</h3>
              </div>
              <span className={`w-2 h-2 rounded-full ${getConfig(platform.id, platform.configs[0]?.key) ? 'bg-green-500' : 'bg-neutral-600'}`} />
            </div>
            <div className="space-y-3">
              {platform.configs.map(cfg => (
                <div key={cfg.key}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">{cfg.label}</label>
                  <input
                    defaultValue={getConfig(platform.id, cfg.key)}
                    onBlur={(e) => saveConfig(platform.id, cfg.key, e.target.value)}
                    placeholder={cfg.label}
                    className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-sm font-mono focus:border-orange-500 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800 flex gap-2">
              <button type="button" onClick={() => syncPlatform(platform.id)} className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
                Test & Sync
              </button>
              <a href={`/api/integrations/${platform.id}/sync`} className="text-[10px] text-neutral-500 hover:text-white self-center px-2">
                Docs
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-heading uppercase tracking-wider text-white">The MLC — CWR Export</h3>
        </div>
        <p className="text-xs font-sans text-neutral-400 mb-4 max-w-2xl">
          Generate a Common Works Registration (CWR) file for bulk submission to The MLC.
          After generation, download the file and upload it via The MLC portal.
        </p>
        <div className="flex gap-4 items-center">
          <button type="button" onClick={generateCwr} className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors">
            Generate CWR Export
          </button>
          <button type="button" onClick={loadConfigs} className="bg-neutral-950 border border-neutral-700 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800">
            Refresh
          </button>
        </div>
        {cwrResult && <p className="mt-3 text-xs font-mono text-green-500">{cwrResult}</p>}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-heading uppercase tracking-wider text-white">Manual Data Entry</h3>
        </div>
        <p className="text-xs font-sans text-neutral-400 mb-4 max-w-2xl">
          Manually add platform income or royalty collection data for platforms without API access
          (ASCAP, BMI, SESAC, SoundExchange, SongTrust, HFA). Download statements from each portal
          and enter the amounts here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ManualIncomeForm onSaved={loadConfigs} />
          <ManualRoyaltyForm onSaved={loadConfigs} />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ScanText className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-heading uppercase tracking-wider text-white">AI Statement OCR</h3>
        </div>
        <p className="text-xs font-sans text-neutral-400 mb-4 max-w-2xl">
          Upload screenshot images of royalty statements from ASCAP, BMI, SESAC, SoundExchange, HFA, or SongTrust.
          Gemini AI reads the statement and extracts line-item data automatically.
        </p>
        <StatementOcrUpload onSaved={loadConfigs} />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <h3 className="text-sm font-heading uppercase tracking-wider text-white mb-4">Connection Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORMS.map(p => {
            const hasKey = getConfig(p.id, p.configs[0]?.key);
            return (
              <div key={p.id} className={`flex items-center gap-2 p-3 border ${hasKey ? 'border-green-500/30 bg-green-500/5' : 'border-neutral-800 bg-black/30'}`}>
                <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-neutral-600'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">{p.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ManualIncomeForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    track_id: '', artist_id: '', platform: 'spotify',
    period_start: '', period_end: '',
    stream_count: '0', gross_revenue: '0', net_revenue: '0',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/integrations/platform-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          stream_count: parseInt(form.stream_count) || 0,
          gross_revenue: parseFloat(form.gross_revenue) || 0,
          net_revenue: parseFloat(form.net_revenue) || 0,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg('Income recorded');
      setForm(f => ({ ...f, stream_count: '0', gross_revenue: '0', net_revenue: '0' }));
      onSaved();
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black/50 border border-neutral-800 p-4 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Add Platform Income</h4>
      <input name="track_id" value={form.track_id} onChange={e => setForm(f => ({ ...f, track_id: e.target.value }))} placeholder="Track ID (UUID)" className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs font-mono focus:border-orange-500 outline-none" required />
      <input name="artist_id" value={form.artist_id} onChange={e => setForm(f => ({ ...f, artist_id: e.target.value }))} placeholder="Artist ID (UUID)" className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs font-mono focus:border-orange-500 outline-none" required />
      <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none">
        {['spotify','soundcloud','bandcamp','apple_music','youtube','tiktok','amazon','deezer','pandora','other'].map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" required />
        <input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" required />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input value={form.stream_count} onChange={e => setForm(f => ({ ...f, stream_count: e.target.value }))} placeholder="Streams" type="number" className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" />
        <input value={form.gross_revenue} onChange={e => setForm(f => ({ ...f, gross_revenue: e.target.value }))} placeholder="Gross $" type="number" step="0.01" className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" />
        <input value={form.net_revenue} onChange={e => setForm(f => ({ ...f, net_revenue: e.target.value }))} placeholder="Net $" type="number" step="0.01" className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" />
      </div>
      <button type="submit" disabled={saving} className="w-full bg-orange-500 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-orange-400 disabled:opacity-50">
        {saving ? 'Saving...' : 'Record Income'}
      </button>
      {msg && <p className="text-xs font-mono text-neutral-400">{msg}</p>}
    </form>
  );
}

function ManualRoyaltyForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    artist_id: '', collection_entity: 'ascap',
    period_start: '', period_end: '',
    source_type: 'performance', gross_amount: '0', net_amount: '0',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/integrations/royalty-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          gross_amount: parseFloat(form.gross_amount) || 0,
          net_amount: parseFloat(form.net_amount) || 0,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg('Royalty recorded');
      setForm(f => ({ ...f, gross_amount: '0', net_amount: '0' }));
      onSaved();
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black/50 border border-neutral-800 p-4 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Add Royalty Collection</h4>
      <input value={form.artist_id} onChange={e => setForm(f => ({ ...f, artist_id: e.target.value }))} placeholder="Artist ID (UUID)" className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs font-mono focus:border-orange-500 outline-none" required />
      <select value={form.collection_entity} onChange={e => setForm(f => ({ ...f, collection_entity: e.target.value }))} className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none">
        {['ascap','bmi','sesac','soundexchange','hfa','mlc','songtrust','other'].map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" required />
        <input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" required />
      </div>
      <select value={form.source_type} onChange={e => setForm(f => ({ ...f, source_type: e.target.value }))} className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none">
        {['performance','mechanical','sync','broadcast','digital','neighboring','other'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.gross_amount} onChange={e => setForm(f => ({ ...f, gross_amount: e.target.value }))} placeholder="Gross $" type="number" step="0.01" className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" />
        <input value={form.net_amount} onChange={e => setForm(f => ({ ...f, net_amount: e.target.value }))} placeholder="Net $" type="number" step="0.01" className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" />
      </div>
      <button type="submit" disabled={saving} className="w-full bg-orange-500 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-orange-400 disabled:opacity-50">
        {saving ? 'Saving...' : 'Record Royalty'}
      </button>
      {msg && <p className="text-xs font-mono text-neutral-400">{msg}</p>}
    </form>
  );
}

function StatementOcrUpload({ onSaved }: { onSaved: () => void }) {
  const [entity, setEntity] = useState('ascap');
  const [artistId, setArtistId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const str = r.result as string;
        resolve(str.split(',')[1]);
        setPreview(str);
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  };

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setResult(null);
    setProcessing(true);

    try {
      const b64 = await toBase64(file);
      const mimeType = file.type || 'image/png';
      const ocrRes = await fetch('/api/ocr/statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mimeType, entity }),
      });
      const data = await ocrRes.json();
      if (!ocrRes.ok) throw new Error(data.error);
      setResult(data);

      if (data.line_items?.length > 0 && artistId) {
        let saved = 0;
        for (const item of data.line_items) {
          try {
            await fetch('/api/integrations/royalty-collection', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                artist_id: artistId,
                collection_entity: entity,
                period_start: item.period_start || data.period_start || '',
                period_end: item.period_end || data.period_end || '',
                source_type: item.source_type || 'performance',
                gross_amount: item.gross_amount || 0,
                net_amount: item.net_amount || 0,
                fee_amount: item.fee_amount || 0,
                currency: item.currency || 'USD',
                notes: item.notes || `OCR import from ${entity.toUpperCase()}`,
              }),
            });
            saved++;
          } catch { /* skip dupes */ }
        }
        setResult((prev: any) => ({ ...prev, auto_saved: saved }));
        onSaved();
      }
    } catch (err: any) {
      setError(err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-black/50 border border-neutral-800 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">1. Select Entity & Artist</h4>
        <select value={entity} onChange={e => setEntity(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none">
          {['ascap','bmi','sesac','soundexchange','hfa','mlc','songtrust'].map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
        </select>
        <input value={artistId} onChange={e => setArtistId(e.target.value)} placeholder="Artist ID (optional, for auto-save)" className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs font-mono focus:border-orange-500 outline-none" />
      </div>
      <div className="bg-black/50 border border-neutral-800 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">2. Upload Screenshot</h4>
        <label className={`flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 p-6 cursor-pointer hover:border-orange-500 transition-colors ${processing ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-8 h-8 text-neutral-500 mb-2" />
          <span className="text-xs text-neutral-400 font-sans">{processing ? 'Processing...' : 'Click to upload screenshot'}</span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={processing} />
        </label>
        {error && <p className="text-xs font-mono text-red-500">{error}</p>}
      </div>
      {preview && (
        <div className="md:col-span-2 bg-black/30 border border-neutral-800 p-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Screenshot Preview</h4>
          <img src={preview} alt="statement" className="max-h-64 object-contain border border-neutral-800" />
        </div>
      )}
      {result && (
        <div className="md:col-span-2 bg-black/30 border border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-green-500">OCR Result</h4>
            {result.auto_saved && <span className="text-[10px] font-mono text-green-500">{result.auto_saved} items auto-saved</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-2 py-1">Period</th>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">Gross</th>
                  <th className="px-2 py-1">Net</th>
                  <th className="px-2 py-1">Notes</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                {result.line_items?.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-neutral-800/50">
                    <td className="px-2 py-1">{item.period_start?.substring(0,7) || '—'}</td>
                    <td className="px-2 py-1 uppercase">{item.source_type || '—'}</td>
                    <td className="px-2 py-1">${(item.gross_amount || 0).toFixed(2)}</td>
                    <td className="px-2 py-1 text-green-500">${(item.net_amount || 0).toFixed(2)}</td>
                    <td className="px-2 py-1 text-neutral-500 max-w-[200px] truncate">{item.notes || ''}</td>
                  </tr>
                ))}
              </tbody>
              {result.total_gross != null && (
                <tfoot className="text-white border-t border-neutral-700">
                  <tr>
                    <td className="px-2 py-1 font-bold" colSpan={2}>Total</td>
                    <td className="px-2 py-1">${result.total_gross.toFixed(2)}</td>
                    <td className="px-2 py-1 text-green-500">${(result.total_net || 0).toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {result.raw && <details className="mt-2"><summary className="text-[10px] text-neutral-500 cursor-pointer">Raw AI Response</summary><pre className="text-[10px] text-neutral-600 mt-1 max-h-32 overflow-auto">{result.raw}</pre></details>}
        </div>
      )}
    </div>
  );
}
