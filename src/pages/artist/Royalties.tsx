import { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { RoyaltyStatement } from '../../types';
import { supabase } from '../../lib/supabase';

export default function Royalties() {
  const [statements, setStatements] = useState<RoyaltyStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistId, setArtistId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) { setLoading(false); return; }
      const { data: artistRow } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (ignore) return;
      const artist = artistRow as unknown as { id: string } | null;
      if (artist) { setArtistId(artist.id);
        const { data } = await supabase
          .from('royalty_statements')
          .select('*, deals(licensee_name)')
          .eq('artist_id', artist.id)
          .order('created_at', { ascending: false });
        if (!ignore && data) setStatements(data);
      }
      if (!ignore) setLoading(false);
    };
    load();
    return () => { ignore = true; };
  }, [user]);

  const totalEarned = statements.reduce((sum, s) => sum + Number(s.net_payout), 0);

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">Royalties</h1>
        <p className="text-neutral-400 font-sans mt-1">Track your sync licensing earnings and statements.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Net Payouts</span>
          <p className="text-3xl font-graffiti text-white mt-2">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Statements</span>
          <p className="text-4xl font-heading text-orange-500 mt-2">{statements.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-center">
          <button type="button" onClick={async () => {
            if (!artistId) return;
            try {
              const res = await fetch('/api/stripe/connect/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artistId }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            } catch { alert('Failed to connect Stripe'); }
          }} className="bg-neutral-950 border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" /> Connect Stripe
          </button>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800">
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <h2 className="text-lg font-heading uppercase tracking-wider text-white">Statement History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-neutral-500 font-sans">Loading statements...</div>
        ) : statements.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 font-sans">No royalty statements yet. Placements will appear here.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-normal">Deal</th>
                <th className="px-6 py-4 font-normal">Gross</th>
                <th className="px-6 py-4 font-normal">Net Payout</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50 font-sans text-sm">
              {statements.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 text-white font-bold uppercase tracking-wider">{s.deals?.licensee_name || 'Direct'}</td>
                  <td className="px-6 py-4 font-mono">${Number(s.gross_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 font-mono text-green-500">${Number(s.net_payout).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${s.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      {s.pdf_url && <a href={s.pdf_url} className="text-orange-500 hover:text-orange-400"><FileText className="w-4 h-4" /></a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
