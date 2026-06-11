import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Send, 
  ClipboardCheck, 
  Activity,
  FileText,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ChevronRight,
  BrainCircuit,
  BarChart3,
  DiscAlbum,
  TrendingUp,
  Users as UsersIcon,
  Target,
  Mail,
  Plug,
  Music,
  Headphones,
  Globe,
  Radio,
  DollarSign,
  ScanText,
  Upload,
  Cpu
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AgentChat from '../../components/AgentChat';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Validation');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const pendingValidations = [
    { title: 'THE TAKEOVER', artist: 'Apex Beats', issues: ['Missing IPI for Co-writer', 'Split math = 95%'], status: 'Failed' },
    { title: 'LATE NIGHT DRIVE', artist: 'DJ Sol', issues: [], status: 'Passed' },
  ];

  const registryQueue = [
    { title: 'STREET ANTHEM VOL 1', target: 'The MLC (CWR)', status: 'Pending Upload', deduct: 'Dedupe Match: 0' },
    { title: 'MIDNIGHT COFFEE', target: 'ASCAP/BMI Bridge', status: 'Processing', deduct: 'API Connected' },
  ];

  return (
    <><div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row border-t border-neutral-800">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-shrink-0 z-10 shadow-2xl">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
            <h2 className="text-xl font-heading font-bold uppercase tracking-wider text-white">System</h2>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Publishing Agent</p>
        </div>
        
        <div className="py-4 flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('Validation')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Validation' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <ClipboardCheck className="w-4 h-4 mr-3" /> Metadata Layer
          </button>
          <button 
            onClick={() => setActiveTab('MLC')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'MLC' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Database className="w-4 h-4 mr-3" /> MLC Registry Sync
          </button>
          <button 
            onClick={() => setActiveTab('PRO')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'PRO' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Activity className="w-4 h-4 mr-3" /> PRO / TuneRegistry
          </button>
          <button 
            onClick={() => setActiveTab('DDEX')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'DDEX' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Send className="w-4 h-4 mr-3" /> DDEX ERN Deliv.
          </button>
          <button 
            onClick={() => setActiveTab('Integrations')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Integrations' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Plug className="w-4 h-4 mr-3" /> Integrations
          </button>
          <button 
            onClick={() => setActiveTab('Deals')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Deals' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <FileText className="w-4 h-4 mr-3" /> Deals & Cue Sheets
           </button>

           <div className="pt-2 mt-2 border-t border-neutral-800/50">
             <p className="px-6 text-[10px] uppercase font-bold tracking-widest text-neutral-600 mb-2">Admin Pages</p>
             <Link to="/admin/inbox" className="w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800">
               <Mail className="w-4 h-4 mr-3" /> Inbox
             </Link>
             <Link to="/admin/supervisor-requests" className="w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800">
               <UsersIcon className="w-4 h-4 mr-3" /> Supervisor Requests
             </Link>
             <Link to="/admin/license-requests" className="w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800">
               <FileText className="w-4 h-4 mr-3" /> License Requests
             </Link>
              <Link to="/admin/briefs" className="w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800">
                <BrainCircuit className="w-4 h-4 mr-3" /> Briefs & Matching
              </Link>
              <Link to="/admin/control" className="w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800">
                <Cpu className="w-4 h-4 mr-3" /> Control Center
              </Link>
           </div>

           <div className="pt-4 mt-2 border-t border-neutral-800/50">
             <p className="px-6 text-[10px] uppercase font-bold tracking-widest text-neutral-600 mb-2">Phase 4 Modules</p>
            <button 
              onClick={() => setActiveTab('AIPitch')}
              className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'AIPitch' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
            >
              <BrainCircuit className="w-4 h-4 mr-3" /> AI Pitch Engine
            </button>
            <button 
              onClick={() => setActiveTab('Analytics')}
              className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Analytics' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
            >
              <BarChart3 className="w-4 h-4 mr-3" /> System Analytics
            </button>
            <button 
              onClick={() => setActiveTab('Records')}
              className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Records' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
            >
              <DiscAlbum className="w-4 h-4 mr-3" /> NcSound Records
            </button>
            <button
              onClick={() => setActiveTab('Metrics')}
              className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Metrics' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
            >
              <TrendingUp className="w-4 h-4 mr-3" /> Acquisition Metrics
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-800">
          <button onClick={handleSignOut} className="w-full flex items-center px-2 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 mr-3" /> Exit Terminal
          </button>
        </div>
      </div>

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
            <button className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors shadow-lg flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" /> Run Batch Check
            </button>
          )}
          {activeTab === 'MLC' && (
             <button className="bg-neutral-800 text-white border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-neutral-700 transition-colors whitespace-nowrap">
              Generate CWR Export
            </button>
          )}
          {activeTab === 'Deals' && (
             <button className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors whitespace-nowrap">
               Log New Placement
             </button>
          )}
        </div>

        {/* Tab Contents */}
        {activeTab === 'Validation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading uppercase tracking-wider text-neutral-300">New Submissions Queue</h3>
            
            <div className="space-y-4">
              {pendingValidations.map((track, i) => (
                <div key={i} className={`border p-6 bg-neutral-900 ${track.status === 'Failed' ? 'border-red-500/30' : 'border-green-500/30'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-heading uppercase tracking-wider text-white">{track.title}</h4>
                      <p className="font-sans text-sm text-neutral-400">{track.artist}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${track.status === 'Failed' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
                      {track.status === 'Failed' ? 'Verification Failed' : 'Ready for Registry'}
                    </span>
                  </div>
                  
                  {track.status === 'Failed' && (
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Flagged Errors:</p>
                      <ul className="list-disc pl-5 font-sans text-sm text-neutral-300 space-y-1">
                        {track.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                      <button className="mt-4 bg-neutral-950 border border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
                        Ping Artist for Revision
                      </button>
                    </div>
                  )}
                  {track.status === 'Passed' && (
                    <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                       <span className="text-xs font-mono text-neutral-500">All required fields present. Math verified.</span>
                       <button className="bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-orange-400 transition-colors flex items-center">
                         Send to Queues <ChevronRight className="w-4 h-4 ml-1" />
                       </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                           <button className="text-neutral-400 hover:text-white transition-colors">Review</button>
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

        {activeTab === 'AIPitch' && <AIPipelinePanel />}

        {activeTab === 'Analytics' && <LiveAdminAnalytics />}

        {activeTab === 'Records' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
                <h3 className="text-lg font-heading uppercase tracking-wider text-white">Label Roster (Net Profit Share)</h3>
                <button className="border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
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

        {activeTab === 'Integrations' && <IntegrationsPanel />}

        </div>
    </div>
      <AgentChat context={{ role: 'admin' }} />
    </>
  );
}

// ============================================================
// INTEGRATIONS PANEL COMPONENT
// ============================================================
function IntegrationsPanel() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
          <button onClick={() => setSyncMsg('')} className="ml-4 text-neutral-400 hover:text-white">x</button>
        </div>
      )}

      {/* Platform Grid */}
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
              <button onClick={() => syncPlatform(platform.id)} className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
                Test & Sync
              </button>
              <a href={`/api/integrations/${platform.id}/sync`} className="text-[10px] text-neutral-500 hover:text-white self-center px-2">
                Docs
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* MLC / CWR Section */}
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
          <button onClick={generateCwr} className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors">
            Generate CWR Export
          </button>
          <button onClick={loadConfigs} className="bg-neutral-950 border border-neutral-700 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800">
            Refresh
          </button>
        </div>
        {cwrResult && <p className="mt-3 text-xs font-mono text-green-500">{cwrResult}</p>}
      </div>

      {/* Add Manual Income / Royalty Section */}
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

      {/* OCR Statement Upload Section */}
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

      {/* Connected Status */}
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

// === Manual Income Entry Form ===
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

// === Manual Royalty Entry Form ===
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

// === AI Statement OCR Upload Component ===
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
          <button onClick={doGenerate} disabled={generating} className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
            {generating ? 'Generating...' : 'Generate ERN 4.3 XML'}
          </button>
          <button onClick={() => fetch('/api/cwr/v2/generate').then(r => r.blob()).then(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ncsound-cwr-v2.txt'; a.click(); })} className="bg-neutral-950 border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs text-white hover:bg-neutral-800">
            Export CWR v2.2
          </button>
        </div>
        {msg && <p className="mt-3 text-xs font-mono text-green-500">{msg}</p>}
      </div>
    </div>
  );
}

// === Live Admin Analytics ===
function LiveAdminAnalytics() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/analytics/admin').then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, []);

  if (!data) return <div className="text-neutral-500 p-8 text-center">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-heading uppercase tracking-wider text-neutral-300">Global Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Total Catalog</p>
          <p className="text-3xl font-heading text-white">{data.total_catalog}</p>
        </div>
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Active Artists</p>
          <p className="text-3xl font-heading text-white">{data.active_artists}</p>
        </div>
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Supervisor Accts</p>
          <p className="text-3xl font-heading text-orange-500">{data.supervisor_accounts}</p>
        </div>
        <div className="bg-neutral-900 p-4 border border-neutral-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">MTD Placements</p>
          <p className="text-3xl font-mono text-white">{data.mtd_placements}</p>
        </div>
      </div>
    </div>
  );
}

// === Live Metrics Panel ===
function LiveMetricsPanel() {
  const [admin, setAdmin] = useState<any>(null);
  const [supervisors, setSupervisors] = useState<any>(null);
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

// === AI Sync Placement Pipeline ===
function AIPipelinePanel() {
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
      // First generate embeddings for all active tracks
      await fetch('/api/embeddings/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      // Then match against the brief text
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
          <button onClick={() => setMsg('')} className="text-neutral-400 hover:text-white">x</button>
        </div>
      )}

      {/* Step 1: Brief Input */}
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
          <button onClick={doMatch} disabled={loading || (!briefText && !briefId)} className="bg-orange-500 text-black px-6 py-2 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
            {loading ? 'Matching...' : 'Match Catalog'}
          </button>
        </div>
      </div>

      {/* Step 2: Matches */}
      {matches.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading uppercase tracking-wider text-white">2. Matched Tracks ({matches.length})</h3>
            <button onClick={doGeneratePitch} disabled={loading} className="bg-orange-500 text-black px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
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

      {/* Step 3: Pitch Result */}
      {pitch && (
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-heading uppercase tracking-wider text-white">3. Generated Pitch</h3>
            <div className="flex gap-2">
              <button onClick={doCreateCampaign} disabled={loading} className="bg-orange-500 text-black px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 disabled:opacity-50">
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

      {/* Outreach Campaigns */}
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

// === Live Metadata Quality Score (replaces hardcoded mock) ===
function LiveMetadataQualityScore() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/quality/scores').then(r => r.json()).then(d => { if (d?.fields) setData(d); }).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-6 text-center text-neutral-500 text-sm font-sans">
        Loading quality scores...
      </div>
    );
  }

  const fieldLabels: Record<string, string> = {
    title: 'Title', genre: 'Genre', bpm: 'BPM', key_signature: 'Key',
    mood_tags: 'Mood Tags', instrumentation: 'Instrumentation',
    energy_level: 'Energy Level', isrc: 'ISRC', iswc: 'ISWC',
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800">
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
        <h4 className="text-sm font-heading uppercase tracking-wider text-white">Metadata Quality Score</h4>
        <span className="text-2xl font-heading text-orange-500">{data.overall}%</span>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(fieldLabels).map(([field, label]) => {
            const pct = data.field_percentages?.[field] || 0;
            const filled = data.fields?.[field] || 0;
            return (
              <div key={field} className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 w-28">{label}</span>
                <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-mono text-neutral-500 w-16 text-right">{filled}/{data.total_tracks}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
