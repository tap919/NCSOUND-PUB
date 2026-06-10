import { Upload, Music, DollarSign, LogOut, BarChart3, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Catalog');
  const [tracks, setTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [artistName, setArtistName] = useState('Artist');
  const [trackCount, setTrackCount] = useState(0);
  const [proAffiliation, setProAffiliation] = useState('');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!user) { setLoadingTracks(false); return; }
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', user.id)
        .single();
      const artist = data as unknown as { id: string; stage_name: string; pro_affiliation: string } | null;
      if (!ignore && !error && artist) {
        setArtistId(artist.id);
        setArtistName(artist.stage_name || 'Artist');
        setProAffiliation(artist.pro_affiliation || '');
        const { data: tracksData } = await supabase
          .from('tracks')
          .select('*')
          .eq('artist_id', artist.id)
          .order('created_at', { ascending: false });
        if (!ignore) setTracks(tracksData || []);
      }
      if (!ignore) setLoadingTracks(false);
    };
    init();
    return () => { ignore = true; };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/artist/login');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Placed': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Metadata Review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Submitted': return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
      default: return 'bg-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row border-t border-neutral-800">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-shrink-0 relative z-10 shadow-2xl">
        <div className="p-6 border-b border-neutral-800">
          <div className="w-16 h-16 bg-neutral-800 border border-neutral-700 mb-4 flex items-center justify-center">
            <span className="font-heading text-2xl text-neutral-500 uppercase">AB</span>
          </div>
          <h2 className="text-xl font-heading font-bold uppercase tracking-wider text-white">{artistName}</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mt-1">{proAffiliation ? `PRO: ${proAffiliation}` : ''}</p>
        </div>
        <div className="py-4 flex-1">
          <button 
            onClick={() => setActiveTab('Catalog')}
            className={`w-full flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Catalog' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Music className="w-4 h-4 mr-3" /> My Catalog
          </button>
          <button 
            onClick={() => setActiveTab('Royalties')}
            className={`w-full flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Royalties' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <DollarSign className="w-4 h-4 mr-3" /> Royalties
          </button>
          <button 
            onClick={() => setActiveTab('Analytics')}
            className={`w-full flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-l-2 ${activeTab === 'Analytics' ? 'border-orange-500 text-orange-500 bg-black/20' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <BarChart3 className="w-4 h-4 mr-3" /> Insights
          </button>

          <div className="mt-4 pt-4 border-t border-neutral-800/50">
            <Link 
              to="/artist/upload-beat"
              className="w-full flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800"
            >
              <Upload className="w-4 h-4 mr-3" /> Upload Beat
            </Link>
            <Link 
              to="/artist/profile"
              className="w-full flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800"
            >
              <BarChart3 className="w-4 h-4 mr-3" /> My Profile
            </Link>
            <Link
              to="/artist/pro-guide"
              className="w-full flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-transparent text-neutral-400 hover:text-orange-500 hover:bg-neutral-800"
            >
              <FileText className="w-4 h-4 mr-3" /> PRO Guide
            </Link>
          </div>
        </div>
        <div className="p-4 border-t border-neutral-800">
          <button onClick={handleSignOut} className="w-full flex items-center px-2 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 mr-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">Dashboard</h1>
            <p className="text-neutral-400 font-sans mt-1">Manage your intellectual property.</p>
          </div>
          <Link to="/artist/upload" className="flex items-center bg-orange-500 text-black px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors shadow-lg">
            <Upload className="w-4 h-4 mr-2" /> Upload Track
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Total Earnings</span>
            <span className="text-3xl font-graffiti text-neutral-500">$0.00</span>
            <span className="text-[10px] text-neutral-600 mt-1">Connect Stripe to receive payouts</span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Active Tracks</span>
            <span className="text-4xl font-heading text-orange-500">{tracks.length}</span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Placements</span>
            <span className="text-4xl font-heading text-white">0</span>
          </div>
        </div>

        {/* Analytics Tab Content */}
        {activeTab === 'Analytics' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-neutral-900 border border-neutral-800 p-6">
                <h2 className="text-xl font-heading uppercase tracking-wider text-white mb-6">Catalog Performance Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-black/50 p-4 border border-neutral-800">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Supervisor Plays</p>
                     <p className="text-3xl font-heading text-white">—</p>
                  </div>
                  <div className="bg-black/50 p-4 border border-neutral-800">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Track Saves</p>
                     <p className="text-3xl font-heading text-orange-500">—</p>
                  </div>
                  <div className="bg-black/50 p-4 border border-neutral-800">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Brief Matches</p>
                     <p className="text-3xl font-heading text-white">—</p>
                  </div>
                  <div className="bg-black/50 p-4 border border-neutral-800">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Top Genre</p>
                     <p className="text-xl font-heading text-white mt-2">—</p>
                  </div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 p-6 flex items-center justify-center h-64">
                   <p className="font-sans text-sm text-neutral-500">Analytics appear here once you have tracks and plays</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-center">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Top Performing Tracks</h3>
                   <p className="font-sans text-sm text-neutral-600">No data yet — upload tracks to start building insights</p>
                </div>
             </div>
          </div>
        )}

        {/* Catalog Tab Content */}
        {activeTab === 'Catalog' && (
          <div className="bg-neutral-900 border border-neutral-800 shadow-xl animate-in fade-in duration-500">
            <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
              <h2 className="text-lg font-heading uppercase tracking-wider text-white">Recent Submissions</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-500">
                    <th className="px-6 py-4 font-normal">Track Title</th>
                    <th className="px-6 py-4 font-normal">ISRC</th>
                    <th className="px-6 py-4 font-normal">Status</th>
                    <th className="px-6 py-4 font-normal">Earnings</th>
                    <th className="px-6 py-4 font-normal text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50 font-sans text-sm">
                  {loadingTracks ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">Loading catalog...</td>
                    </tr>
                  ) : tracks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">No tracks found. Upload your first track.</td>
                    </tr>
                  ) : tracks.map((track, i) => (
                    <tr key={i} className="hover:bg-neutral-800/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-white uppercase tracking-wider">{track.title}</td>
                       <td className="px-6 py-4 font-mono text-neutral-400 text-xs">{track.isrc || 'Pending'}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(track.status === 'active' ? 'Active' : track.status === 'placed' ? 'Placed' : 'Submitted')}`}>
                           {track.status === 'active' ? 'Active' : track.status === 'placed' ? 'Placed' : 'Submitted'}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-white font-mono">$0.00</td>
                       <td className="px-6 py-4 text-neutral-500 text-right">{new Date(track.created_at).toLocaleDateString()}</td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Royalties Tab Content */}
        {activeTab === 'Royalties' && (
           <div className="bg-neutral-900 border border-neutral-800 shadow-xl animate-in fade-in duration-500 p-8 text-center flex flex-col items-center justify-center">
              <DollarSign className="w-12 h-12 text-neutral-600 mb-4" />
              <h2 className="text-2xl font-heading uppercase tracking-wider text-white mb-2">Royalty Statements</h2>
              <p className="font-sans text-sm text-neutral-400 max-w-md mx-auto mb-6">View detailed PDF statements, track historical earnings, and manage your Stripe Connect payout preferences.</p>
              <button className="bg-neutral-950 border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs text-white hover:bg-neutral-800 transition-colors">
                Connect Stripe Account
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
