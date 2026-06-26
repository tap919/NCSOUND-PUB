import { useState, useEffect } from 'react';

export default function DealsTab() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/analytics/admin').then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, []);

  if (!data) return <div className="text-neutral-500 p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 p-6 border border-neutral-800">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Total Managed Fees</h4>
          <p className="text-3xl font-graffiti text-white">${(data.total_managed_fees || 0).toFixed(2)}</p>
        </div>
        <div className="bg-neutral-900 p-6 border border-neutral-800">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Active Cue Sheets</h4>
          <p className="text-3xl font-heading text-orange-500">{data.active_cue_sheets}</p>
        </div>
        <div className="bg-neutral-900 p-6 border border-neutral-800">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Pending Payouts</h4>
          <p className="text-3xl font-mono text-white">{data.pending_payouts}</p>
        </div>
      </div>
    </div>
  );
}
