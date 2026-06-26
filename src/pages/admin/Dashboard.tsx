import { useState, type FC } from 'react';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AgentChat from '../../components/AgentChat';
import Sidebar from '../../components/admin/dashboard/Sidebar';
import ValidationTab from '../../components/admin/dashboard/ValidationTab';
import IntegrationsTab from '../../components/admin/dashboard/IntegrationsTab';
import AiPitchTab from '../../components/admin/dashboard/AiPitchTab';
import AnalyticsTab from '../../components/admin/dashboard/AnalyticsTab';
import MLCTab from '../../components/admin/dashboard/MLCTab';
import PROTab from '../../components/admin/dashboard/PROTab';
import DealsTab from '../../components/admin/dashboard/DealsTab';
import DDEXTab from '../../components/admin/dashboard/DDEXTab';
import RecordsTab from '../../components/admin/dashboard/RecordsTab';
import MetricsTab from '../../components/admin/dashboard/MetricsTab';

const TABS: Record<string, FC> = {
  Validation: ValidationTab,
  Integrations: IntegrationsTab,
  AIPitch: AiPitchTab,
  Analytics: AnalyticsTab,
  MLC: MLCTab,
  PRO: PROTab,
  Deals: DealsTab,
  DDEX: DDEXTab,
  Records: RecordsTab,
  Metrics: MetricsTab,
};

const TAB_META: Record<string, { title: string; description: string; action?: { label: string; icon?: boolean } }> = {
  Validation: { title: 'Metadata Validation Engine', description: 'Automated split math, ownership declaration, and missing field checks before registry ingestion.', action: { label: 'Run Batch Check', icon: true } },
  MLC: { title: 'The MLC Integration', description: 'Deduplication API checks and CWR (Common Works Registration) bulk export generator.', action: { label: 'Generate CWR Export' } },
  PRO: { title: 'PRO Registration Bridge', description: 'Direct bridging to TuneRegistry for ASCAP/BMI work entity registrations.' },
  DDEX: { title: 'DDEX ERN 4.3 Delivery', description: 'Automated XML packaging for direct-artist distributions via SonicTune.' },
  Deals: { title: 'Sync Deal & Cue Sheet Logs', description: 'Log sync placements, trigger 80/20 payouts via Stripe, and generate automated performance cue sheets.', action: { label: 'Log New Placement' } },
  AIPitch: { title: 'AI Sync Pitch Automation', description: 'Proactive outreach, brief-matching engine, and auto-generated DISCO pitches.' },
  Analytics: { title: 'System Analytics', description: 'Global platform metrics, revenue tracking, and catalog trend intelligence.' },
  Records: { title: 'NcSound Records Roster', description: 'Manage the exclusive label tier roster and track integrated releases.' },
  Metrics: { title: 'Acquisition Metrics', description: 'Acquisition dashboard with catalog size, artists, supervisors, and sync revenue.' },
  Integrations: { title: '3rd Party Integrations', description: 'Configure API keys, sync catalogs, and manage connections to Spotify, SoundCloud, MLC, PROs, and more.' },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Validation');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const meta = TAB_META[activeTab] || TAB_META.Validation;
  const TabComponent = TABS[activeTab];

  return (
    <><div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row border-t border-neutral-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleSignOut={handleSignOut} />

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-10 bg-neutral-950 overflow-y-auto">
        <div className="mb-10 flex justify-between items-end border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">
              {meta.title}
            </h1>
            <p className="font-sans text-neutral-400 mt-2 text-sm max-w-2xl">
              {meta.description}
            </p>
          </div>
          {meta.action && (
            <button type="button" className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors shadow-lg flex items-center whitespace-nowrap">
              {meta.action.icon && <RefreshCw className="w-4 h-4 mr-2" />} {meta.action.label}
            </button>
          )}
        </div>

        {TabComponent && <TabComponent />}
      </div>
    </div>
      <AgentChat context={{ role: 'admin' }} />
    </>
  );
}
