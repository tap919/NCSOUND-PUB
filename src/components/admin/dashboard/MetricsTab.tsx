import { useState, useEffect } from 'react';
import { Database, Target, Users as UsersIcon, TrendingUp } from 'lucide-react';

export default function MetricsTab() {
  const [admin, setAdmin] = useState<any>(null);
  useEffect(() => {
    fetch('/api/analytics/admin').then(r => r.json()).then(a => setAdmin(a)).catch(() => {});
  }, []);

  if (!admin) return <div className="text-neutral-500 p-8 text-center">Loading metrics...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading uppercase tracking-wider text-neutral-300">Acquisition Dashboard</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><Database className="w-3 h-3 text-orange-500" /> Catalog Size</p>
          <p className="text-3xl font-heading text-white">{admin.total_catalog}</p>
        </div>
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><Target className="w-3 h-3 text-orange-500" /> Artists</p>
          <p className="text-3xl font-heading text-white">{admin.active_artists}</p>
        </div>
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><UsersIcon className="w-3 h-3 text-orange-500" /> Supervisors</p>
          <p className="text-3xl font-heading text-white">{admin.supervisor_accounts}</p>
        </div>
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-orange-500" /> Sync Revenue</p>
          <p className="text-3xl font-heading text-white">${(admin.total_income || 0).toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}
