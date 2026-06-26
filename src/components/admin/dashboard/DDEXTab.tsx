import { useState } from 'react';
import { Send } from 'lucide-react';

export default function DDEXTab() {
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');

  const doGenerate = async () => {
    setGenerating(true);
    setMsg('Generating DDEX ERN 4.3 XML...');
    try {
      const res = await fetch('/api/ddex/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds: [] }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'ncsound-ddex-ern.xml'; a.click();
      URL.revokeObjectURL(url);
      setMsg('DDEX XML downloaded');
    } catch (err: any) { setMsg('Error: ' + err.message); }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Send className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-heading uppercase tracking-wider text-white">DDEX ERN 4.3 Delivery</h3>
        </div>
        <p className="text-sm font-sans text-neutral-400 mb-6 max-w-2xl">
          Generate ERN (Electronic Release Notification) XML for delivery to DSPs like Spotify, Apple Music, and Amazon.
          The generated file follows the DDEX ERN 4.3 standard for release metadata, track listings, and deal terms.
        </p>
        <div className="flex gap-4 items-center">
          <button type="button" onClick={doGenerate} disabled={generating} className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
            {generating ? 'Generating...' : 'Generate ERN 4.3 XML'}
          </button>
          <button type="button" onClick={() => fetch('/api/cwr/v2/generate').then(r => r.blob()).then(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ncsound-cwr-v2.txt'; a.click(); })} className="bg-neutral-950 border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs text-white hover:bg-neutral-800">
            Export CWR v2.2
          </button>
        </div>
        {msg && <p className="mt-3 text-xs font-mono text-green-500">{msg}</p>}
      </div>
    </div>
  );
}
