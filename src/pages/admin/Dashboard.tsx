import { useState } from 'react';
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
  Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row border-t border-neutral-800">
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

        {activeTab === 'Deals' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Total Managed Fees</h4>
                  <p className="text-3xl font-graffiti text-white">$14,250</p>
                </div>
                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Active Cue Sheets</h4>
                  <p className="text-3xl font-heading text-orange-500">8</p>
                </div>
                <div className="bg-neutral-900 p-6 border border-neutral-800">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Pending Payouts</h4>
                  <p className="text-3xl font-mono text-white">$0.00</p>
                </div>
             </div>

             <div className="bg-neutral-900 border border-neutral-800 mt-8">
               <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
                 <h3 className="text-sm font-heading uppercase tracking-wider text-white">Recent Placements</h3>
               </div>
               <div className="p-6 border-b border-neutral-800 flex justify-between items-center group cursor-pointer hover:bg-neutral-800 transition-colors">
                  <div>
                    <h4 className="text-lg font-bold font-heading uppercase tracking-wider text-white">Netflix - Urban Documentary</h4>
                    <p className="font-sans text-sm text-neutral-400 mt-1">Track: STREET ANTHEM VOL 1  •  Date: Oct 12, 2026</p>
                  </div>
                  <div className="text-right">
                     <p className="font-mono text-lg text-white">$1,500.00</p>
                     <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mt-1">Closed</p>
                  </div>
               </div>
               <div className="p-4 bg-black/30 border-b border-neutral-800 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                   <p className="text-sm font-sans text-neutral-300">Cue sheet rendered & dispatched directly to ASCAP</p>
                 </div>
                 <button className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-2" /> Download PDF PDF
                 </button>
               </div>
             </div>
           </div>
        )}
        
        {activeTab === 'DDEX' && (
           <div className="p-12 text-center border border-neutral-800 bg-neutral-900/50">
              <Send className="w-16 h-16 text-neutral-700 mx-auto mb-6" />
              <h3 className="text-2xl font-heading uppercase tracking-wider text-white mb-2">DDEX ERN 4.3 Pipeline</h3>
              <p className="font-sans text-neutral-400 max-w-md mx-auto mb-6">Direct delivery of metadata, cover art, and audio assets to global DSPs via SonicTune infrastructure.</p>
              <button className="bg-neutral-950 border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors text-white">
                View DDEX Delivery Logs
              </button>
           </div>
        )}

        {activeTab === 'AIPitch' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                     <BrainCircuit className="w-8 h-8 text-orange-500" />
                     <h3 className="text-xl font-heading uppercase tracking-wider text-white">Brief Matcher</h3>
                  </div>
                  <p className="font-sans text-sm text-neutral-400 mb-6">Paste a supervisor brief to automatically generate a ranked 5-10 track shortlist using catalog sonics and metadata tags.</p>
                  <button className="bg-orange-500 text-black font-bold uppercase tracking-widest text-xs py-3 px-4 hover:bg-orange-400 transition-colors">
                    Initialize Cross-Match
                  </button>
                </div>
                <div className="border border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold font-heading uppercase tracking-wider text-white">DISCO Outreach</h3>
                    <span className="bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] uppercase font-bold tracking-widest px-2 py-1">Running</span>
                  </div>
                  <p className="font-sans text-sm text-neutral-400 mb-6">Auto-compiling bi-weekly themed pitch emails to 240+ segment-matched supervisors.</p>
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-500 border-t border-neutral-800 pt-4">
                    <span>Last Send: 2 days ago</span>
                    <span>Open Rate: 42%</span>
                  </div>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'Analytics' && (
           <div className="space-y-6">
             <h3 className="text-lg font-heading uppercase tracking-wider text-neutral-300">Global Overview</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900 p-4 border border-neutral-800">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Total Catalog</p>
                   <p className="text-3xl font-heading text-white">1,248</p>
                </div>
                <div className="bg-neutral-900 p-4 border border-neutral-800">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Active Artists</p>
                   <p className="text-3xl font-heading text-white">42</p>
                </div>
                <div className="bg-neutral-900 p-4 border border-neutral-800">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Supervisor Accts</p>
                   <p className="text-3xl font-heading text-orange-500">115</p>
                </div>
                <div className="bg-neutral-900 p-4 border border-neutral-800">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Mtd Placements</p>
                   <p className="text-3xl font-mono text-white">6</p>
                </div>
             </div>
             <div className="bg-neutral-900 border border-neutral-800 p-6 flex items-center justify-center h-48 mt-8 border-dashed">
                <p className="font-sans text-neutral-500 text-sm">Visual trend charts (e.g. Activity over Time, Revenue by Genre) render here.</p>
             </div>
           </div>
        )}

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

        {activeTab === 'Metrics' && (
           <div className="space-y-6">
             <h3 className="text-lg font-heading uppercase tracking-wider text-neutral-300">Acquisition Dashboard</h3>
             <p className="text-xs font-sans text-neutral-500 mb-6 max-w-2xl">Key metrics that drive acquisition value. Track catalog growth, metadata quality, and supervisor engagement.</p>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-neutral-900 p-4 border border-neutral-800">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><Database className="w-3 h-3 text-orange-500" /> Catalog Size</p>
                 <p className="text-3xl font-heading text-white">14</p>
                 <p className="text-[10px] text-neutral-600 mt-1">100 target</p>
               </div>
               <div className="bg-neutral-900 p-4 border border-neutral-800">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><Target className="w-3 h-3 text-orange-500" /> Artists</p>
                 <p className="text-3xl font-heading text-white">3</p>
                 <p className="text-[10px] text-neutral-600 mt-1">20 target</p>
               </div>
               <div className="bg-neutral-900 p-4 border border-neutral-800">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><UsersIcon className="w-3 h-3 text-orange-500" /> Supervisors</p>
                 <p className="text-3xl font-heading text-white">0</p>
                 <p className="text-[10px] text-neutral-600 mt-1">10 active target</p>
               </div>
               <div className="bg-neutral-900 p-4 border border-neutral-800">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-orange-500" /> Sync Revenue</p>
                 <p className="text-3xl font-heading text-white">$0</p>
                 <p className="text-[10px] text-neutral-600 mt-1">$100K ARR target</p>
               </div>
             </div>

             <div className="bg-neutral-900 border border-neutral-800">
               <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
                 <h4 className="text-sm font-heading uppercase tracking-wider text-white">Metadata Quality Score</h4>
               </div>
               <div className="p-6">
                 <div className="space-y-4">
                   {[
                     { field: 'Title', filled: 14, total: 14 },
                     { field: 'Genre', filled: 8, total: 14 },
                     { field: 'BPM', filled: 5, total: 14 },
                     { field: 'Mood Tags', filled: 3, total: 14 },
                     { field: 'Instrumentation', filled: 2, total: 14 },
                     { field: 'Energy Level', filled: 4, total: 14 },
                     { field: 'Key Signature', filled: 3, total: 14 },
                   ].map(m => (
                     <div key={m.field} className="flex items-center gap-4">
                       <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 w-28">{m.field}</span>
                       <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                         <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(m.filled / m.total) * 100}%` }} />
                       </div>
                       <span className="text-xs font-mono text-neutral-500 w-16 text-right">{m.filled}/{m.total}</span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             <div className="bg-neutral-900 border border-neutral-800 p-6">
               <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Acquisition Value Drivers</h4>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-sans text-neutral-400">
                 <div className="bg-black/50 p-4 border border-neutral-800">
                   <p className="text-white font-bold text-lg mb-1">Data Asset</p>
                   <p className="text-xs">17 metadata fields per track. Rich tagging = training-ready data for AI matching systems. Songtrust doesn't have this.</p>
                 </div>
                 <div className="bg-black/50 p-4 border border-neutral-800">
                   <p className="text-white font-bold text-lg mb-1">Supervisor Pipeline</p>
                   <p className="text-xs">Direct relationships with music supervisors. Every track pre-cleared for one-stop licensing. BeatStars doesn't have this.</p>
                 </div>
                 <div className="bg-black/50 p-4 border border-neutral-800">
                   <p className="text-white font-bold text-lg mb-1">Regional Monopoly</p>
                   <p className="text-xs">NC/Southeast producer network. Geographic concentration = defensible niche that LA/NY publishers can't easily replicate.</p>
                 </div>
               </div>
             </div>
           </div>
        )}

       </div>
    </div>
  );
}
