import { useState, useEffect } from 'react';
import { Database, Target, Users as UsersIcon, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';

export default function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/analytics/admin').then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, []);

  if (!data) return <div className="text-neutral-500 p-8 text-center">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading uppercase tracking-wider text-neutral-300">Global Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Catalog" value={data.total_catalog} />
        <StatCard label="Active Artists" value={data.active_artists} />
        <StatCard label="Supervisor Accts" value={data.supervisor_accounts} valueClassName="text-3xl font-heading text-orange-500" />
        <StatCard label="MTD Placements" value={data.mtd_placements} valueClassName="text-3xl font-mono text-white" />
      </div>

      <h3 className="text-lg font-heading uppercase tracking-wider text-neutral-300">Acquisition Dashboard</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Catalog Size" value={data.total_catalog} icon={<Database className="w-3 h-3 text-orange-500" />} />
        <StatCard label="Artists" value={data.active_artists} icon={<Target className="w-3 h-3 text-orange-500" />} />
        <StatCard label="Supervisors" value={data.supervisor_accounts} icon={<UsersIcon className="w-3 h-3 text-orange-500" />} />
        <StatCard label="Sync Revenue" value={`${(data.total_income || 0).toFixed(0)}`} icon={<TrendingUp className="w-3 h-3 text-orange-500" />} />
      </div>
    </div>
  );
}
