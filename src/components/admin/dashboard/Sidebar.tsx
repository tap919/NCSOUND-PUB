import { ShieldCheck, ClipboardCheck, Database, Activity, Send, Plug, FileText, Mail, Users as UsersIcon, BrainCircuit, Cpu, BarChart3, DiscAlbum, TrendingUp, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleSignOut: () => Promise<void>;
}

export default function Sidebar({ activeTab, setActiveTab, handleSignOut }: SidebarProps) {
  return (
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
          type="button"
          onClick={() => setActiveTab('Validation')}
          className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Validation' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <ClipboardCheck className="w-4 h-4 mr-3" /> Metadata Layer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MLC')}
          className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'MLC' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <Database className="w-4 h-4 mr-3" /> MLC Registry Sync
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PRO')}
          className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'PRO' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <Activity className="w-4 h-4 mr-3" /> PRO / TuneRegistry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DDEX')}
          className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'DDEX' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <Send className="w-4 h-4 mr-3" /> DDEX ERN Deliv.
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('Integrations')}
          className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Integrations' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <Plug className="w-4 h-4 mr-3" /> Integrations
        </button>
        <button
          type="button"
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
            type="button"
            onClick={() => setActiveTab('AIPitch')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'AIPitch' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <BrainCircuit className="w-4 h-4 mr-3" /> AI Pitch Engine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Analytics')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Analytics' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <BarChart3 className="w-4 h-4 mr-3" /> System Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Records')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Records' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <DiscAlbum className="w-4 h-4 mr-3" /> NcSound Records
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Metrics')}
            className={`w-full flex items-center px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Metrics' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <TrendingUp className="w-4 h-4 mr-3" /> Acquisition Metrics
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-800">
        <button type="button" onClick={handleSignOut} className="w-full flex items-center px-2 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
          <LogOut className="w-4 h-4 mr-3" /> Exit Terminal
        </button>
      </div>
    </div>
  );
}
