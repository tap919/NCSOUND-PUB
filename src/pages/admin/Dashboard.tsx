import { useState, useEffect, type FC } from 'react';
import { 
  RefreshCw,
  Database,
  Activity,
  Send,
  Target,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AgentChat from '../../components/AgentChat';
import Sidebar from '../../components/admin/dashboard/Sidebar';
import ValidationTab from '../../components/admin/dashboard/ValidationTab';
import IntegrationsTab from '../../components/admin/dashboard/IntegrationsTab';
import AiPitchTab from '../../components/admin/dashboard/AiPitchTab';
import AnalyticsTab from '../../components/admin/dashboard/AnalyticsTab';

const TABS: Record<string, FC> = {
  Validation: ValidationTab,
  Integrations: IntegrationsTab,
  AIPitch: AiPitchTab,
  Analytics: AnalyticsTab,
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Validation');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const registryQueue = [
    { title: 'STREET ANTHEM VOL 1', target: 'The MLC (CWR)', status: 'Pending Upload', deduct: 'Dedupe Match: 0' },
    { title: 'MIDNIGHT COFFEE', target: 'ASCAP/BMI Bridge', status: 'Processing', deduct: 'API Connected' },
  ];

  const TabComponent = TABS[activeTab];

  return (
    <><div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row border-t border-neutral-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleSignOut={handleSignOut} />

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-10 bg-neutral-950 overflow-y-auto">
        <div className="mb-10 flex justify-between items-end border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">
              {activeTab === 'Validation' && 'Metadata Validation Engine'}
              {activeTab === 'MLC' && 'The MLC Integration'}
              {activeTab === 'PRO' && 'PRO Registration Bridge'}
              {activeTab === 'DDEX' && 'DDEX ERN 4.3 Delivery'}
              {activeTab === 'Deals' && 'Sync Deal & Cue Sheet Logs'}
              {activeTab === 'AIPitch' && 'AI Sync Pitch Automation'}
              {activeTab === 'Analytics' && 'System Analytics'}
              {activeTab === 'Records' && 'NcSound Records Roster'}
              {activeTab === 'Metrics' && 'Acquisition Metrics'}
              {activeTab === 'Integrations' && '3rd Party Integrations'}
            </h1>
            <p className="font-sans text-neutral-400 mt-2 text-sm max-w-2xl">
              {activeTab === 'Validation' && 'Automated split math, ownership declaration, and missing field checks before registry ingestion.'}
              {activeTab === 'MLC' && 'Deduplication API checks and CWR (Common Works Registration) bulk export generator.'}
              {activeTab === 'PRO' && 'Direct bridging to TuneRegistry for ASCAP/BMI work entity registrations.'}
              {activeTab === 'DDEX' && 'Automated XML packaging for direct-artist distributions via SonicTune.'}
              {activeTab === 'Deals' && 'Log sync placements, trigger 80/20 payouts via Stripe, and generate automated performance cue sheets.'}
              {activeTab === 'AIPitch' && 'Proactive outreach, brief-matching engine, and auto-generated DISCO pitches.'}
              {activeTab === 'Analytics' && 'Global platform metrics, revenue tracking, and catalog trend intelligence.'}
              {activeTab === 'Records' && 'Manage the exclusive label tier roster and track integrated releases.'}
              {activeTab === 'Integrations' && 'Configure API keys, sync catalogs, and manage connections to Spotify, SoundCloud, MLC, PROs, and more.'}
            </p>
          </div>
          {activeTab === 'Validation' && (
            <button type="button" className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors shadow-lg flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" /> Run Batch Check
            </button>
          )}
          {activeTab === 'MLC' && (
             <button type="button" className="bg-neutral-800 text-white border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-neutral-700 transition-colors whitespace-nowrap">
              Generate CWR Export
            </button>
          )}
          {activeTab === 'Deals' && (
             <button type="button" className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors whitespace-nowrap">
                Log New Placement
              </button>
          )}
        </div>

        {/* Inline Tab Contents */}
        {activeTab === 'MLC' && (
          <div className="space-y-6">
             <a href="/api/disco/export" download className="inline-flex items-center bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors shadow-lg mb-6">
               <Database className="w-4 h-4 mr-2" /> Export DISCO CSV
             </a>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="bg-neutral-900 border border-neutral-800 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-2">Deduplication Engine</h3>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="font-mono text-white">MLC Search API Connected</span>
                  </div>
                  <p className="mt-3 text-xs font-sans text-neutral-400 border-t border-neutral-800 pt-3">Scans public repertoire for Title + Writer matches prior to injection.</p>
               </div>
               <div className="bg-neutral-900 border border-neutral-800 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-2">Awaiting CWR Export</h3>
                  <div className="text-4xl font-heading text-white">12 <span className="text-base text-neutral-500 font-sans tracking-normal lowercase">works</span></div>
               </div>
             </div>

             <div className="bg-neutral-900 border border-neutral-800 border-b-0">
               <div className="px-6 py-4 border-b border-neutral-800 flex justify-between bg-neutral-950/50">
                 <h3 className="text-sm font-heading uppercase tracking-wider text-white">Registry Injection Queue</h3>
               </div>
               <table className="w-full text-left font-sans text-sm">
                 <thead className="bg-black/50 border-b border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-500">
                   <tr>
                     <th className="px-6 py-3 font-normal">Work Title</th>
                     <th className="px-6 py-3 font-normal">Pre-Check</th>
                     <th className="px-6 py-3 font-normal">Status</th>
                     <th className="px-6 py-3 font-normal text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-neutral-800/50">
                    {registryQueue.filter(q => q.target === 'The MLC (CWR)').map((item, i) => (
                      <tr key={i} className="hover:bg-neutral-800/50">
                        <td className="px-6 py-4 font-bold text-white uppercase">{item.title}</td>
                        <td className="px-6 py-4 text-green-500 font-mono text-xs">{item.deduct}</td>
                        <td className="px-6 py-4 text-orange-500 text-xs font-bold uppercase">{item.status}</td>
                        <td className="px-6 py-4 text-right">
                            <button type="button" className="text-neutral-400 hover:text-white transition-colors">Review</button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* Similar mockouts for the other tabs, showing high-level functionality */}
        {activeTab === 'PRO' && (
           <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-800 bg-neutral-900/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Active Link</span>
              </div>
              <Activity className="w-16 h-16 text-neutral-700 mb-6" />
              <h3 className="text-2xl font-heading uppercase tracking-wider text-white mb-2">TuneRegistry API Active</h3>
              <p className="font-sans text-neutral-400 max-w-md mx-auto mb-8">Works cleared from the Metadata Layer are automatically payloaded to TuneRegistry for processing at ASCAP & BMI.</p>
              
              <div className="w-full max-w-lg bg-black p-4 border border-neutral-800 text-left font-mono text-xs text-green-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none"></div>
                {`> POST /api/v1/works
> Authorization: Bearer TR_****
> Payload: 
{
  "title": "NEON NIGHTS",
  "writers": [...],
  "publisher": "NcSound Publishing",
  "pro_affiliation": "ASCAP"
}
> Response 202: Accepted for processing...`}
              </div>
           </div>
        )}

        {activeTab === 'Deals' && <LiveDealsPanel />}
        
        {activeTab === 'DDEX' && <LiveDdexPanel />}

        {activeTab === 'Records' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
                <h3 className="text-lg font-heading uppercase tracking-wider text-white">Label Roster (Net Profit Share)</h3>
                <button type="button" className="border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
                  Add Artist
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {['Raleigh Phantoms', 'Sarah Jenkins'].map((artist) => (
                 <div key={artist} className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
                   <div className="flex items-start justify-between mb-8">
                     <div>
                       <h4 className="text-xl font-heading font-bold uppercase tracking-wider text-white">{artist}</h4>
                       <p className="font-sans text-sm text-neutral-400">Exclusive Record Deal</p>
                     </div>
                     <span className="w-2 h-2 rounded-full bg-orange-500 mt-2"></span>
                   </div>
                   <div className="flex gap-4 border-t border-neutral-800 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Releases</p>
                        <p className="text-lg font-mono text-white">4</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Unrecouped</p>
                        <p className="text-lg font-mono text-red-400">$1,250</p>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
            </div>
         )}

        {activeTab === 'Metrics' && <LiveMetricsPanel />}

        {TabComponent && <TabComponent />}
      </div>
    </div>
      <AgentChat context={{ role: 'admin' }} />
    </>
  );
}

// === Live Deals Panel ===
function LiveDealsPanel() {
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

// === Live DDEX Panel ===
function LiveDdexPanel() {
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

// === Live Metrics Panel ===
function LiveMetricsPanel() {
  const [admin, setAdmin] = useState<any>(null);
  const [, setSupervisors] = useState<any>(null);
  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/admin').then(r => r.json()),
      fetch('/api/analytics/supervisors').then(r => r.json()),
    ]).then(([a, s]) => { setAdmin(a); setSupervisors(s); }).catch(() => {});
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

// === Live Metadata Quality Score (replaces hardcoded mock) ===
// NOTE: LiveMetadataQualityScore component removed — was defined but never rendered.
// To re-enable, fetch /api/quality/scores and render field completeness bars.
