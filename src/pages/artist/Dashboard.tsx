import { Upload, Music, DollarSign, LogOut, BarChart3, FileText, TrendingUp, Radio, Globe, Headphones, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import AgentChat from '../../components/AgentChat';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Catalog');
  const [tracks, setTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [artistName, setArtistName] = useState('Artist');
  const [proAffiliation, setProAffiliation] = useState('');
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [royaltyData, setRoyaltyData] = useState<any[]>([]);
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

        // Load income data
        fetch(`/api/integrations/summary?artist_id=${artist.id}`)
          .then(r => r.json()).then(d => { if (!ignore && Array.isArray(d)) setIncomeData(d); }).catch(() => {});
        fetch(`/api/integrations/summary?artist_id=${artist.id}`)
          .then(r => r.json()).then(d => { if (!ignore && Array.isArray(d)) setRoyaltyData(d.filter((i: any) => i.source_type === 'royalty')); }).catch(() => {});
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
    <><div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row border-t border-neutral-800">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Total Income</span>
            <span className="text-3xl font-graffiti text-white">
              ${incomeData.reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0).toFixed(2)}
            </span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Active Tracks</span>
            <span className="text-4xl font-heading text-orange-500">{tracks.length}</span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Platforms</span>
            <span className="text-4xl font-heading text-white">
              {new Set(incomeData.map((i: any) => i.source)).size}
            </span>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">ROI Score</span>
            <span className="text-4xl font-heading text-orange-500">
              {incomeData.length > 0 ? `${Math.round(incomeData.filter((i: any) => parseFloat(i.net_amount) > 0).length / Math.max(incomeData.length, 1) * 100)}%` : '—'}
            </span>
          </div>
        </div>

        {/* Analytics Tab Content */}
        {activeTab === 'Analytics' && <LiveArtistInsights artistId={artistId} incomeData={incomeData} tracks={tracks} />}

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
                   ) : tracks.map((track, i) => {
                    const trackIncome = incomeData
                      .filter((inc: any) => inc.track_id === track.id)
                      .reduce((s: number, inc: any) => s + (parseFloat(inc.net_amount) || 0), 0);
                    return (
                    <tr key={i} className="hover:bg-neutral-800/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-white uppercase tracking-wider">{track.title}</td>
                       <td className="px-6 py-4 font-mono text-neutral-400 text-xs">{track.isrc || 'Pending'}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(track.status === 'active' ? 'Active' : track.status === 'placed' ? 'Placed' : 'Submitted')}`}>
                           {track.status === 'active' ? 'Active' : track.status === 'placed' ? 'Placed' : 'Submitted'}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-white font-mono">${trackIncome.toFixed(2)}</td>
                       <td className="px-6 py-4 text-neutral-500 text-right">{new Date(track.created_at).toLocaleDateString()}</td>
                     </tr>
                    );})}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Royalties Tab Content */}
        {activeTab === 'Royalties' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              {/* Income Breakdown */}
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <h2 className="text-lg font-heading uppercase tracking-wider text-white mb-6">Income Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {['spotify','soundcloud','bandcamp','apple_music'].map(platform => {
                    const total = incomeData
                      .filter((i: any) => i.source === platform)
                      .reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
                    return (
                      <div key={platform} className="bg-black/50 border border-neutral-800 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{platform}</p>
                        <p className="text-2xl font-mono text-white">${total.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                {incomeData.filter((i: any) => i.source_type === 'platform').length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                        <tr>
                          <th className="px-4 py-3 font-normal">Platform</th>
                          <th className="px-4 py-3 font-normal">Period</th>
                          <th className="px-4 py-3 font-normal">Streams</th>
                          <th className="px-4 py-3 font-normal">Gross</th>
                          <th className="px-4 py-3 font-normal">Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/50">
                        {incomeData.filter((i: any) => i.source_type === 'platform').map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-neutral-800/50">
                            <td className="px-4 py-3 uppercase text-xs font-bold text-neutral-300">{item.source}</td>
                            <td className="px-4 py-3 font-mono text-xs text-neutral-400">{item.period_start?.substring(0, 7)}</td>
                            <td className="px-4 py-3 font-mono">{item.stream_count || 0}</td>
                            <td className="px-4 py-3 font-mono">${parseFloat(item.gross_amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 font-mono text-green-500">${parseFloat(item.net_amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Royalty Collections */}
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-heading uppercase tracking-wider text-white">PRO / Society Collections</h2>
                </div>
                {royaltyData.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 font-sans text-sm border border-dashed border-neutral-800">
                    No royalty collections recorded yet. These appear when you add data from ASCAP, BMI, SESAC, SoundExchange, HFA, or MLC statements.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                        <tr>
                          <th className="px-4 py-3 font-normal">Entity</th>
                          <th className="px-4 py-3 font-normal">Period</th>
                          <th className="px-4 py-3 font-normal">Type</th>
                          <th className="px-4 py-3 font-normal">Gross</th>
                          <th className="px-4 py-3 font-normal">Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/50">
                        {royaltyData.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-neutral-800/50">
                            <td className="px-4 py-3 uppercase text-xs font-bold text-neutral-300">{item.source}</td>
                            <td className="px-4 py-3 font-mono text-xs text-neutral-400">{item.period_start?.substring(0, 7)}</td>
                            <td className="px-4 py-3 text-xs text-neutral-400">{item.source_type}</td>
                            <td className="px-4 py-3 font-mono">${parseFloat(item.gross_amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 font-mono text-green-500">${parseFloat(item.net_amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Artist OCR Upload */}
                <details className="mt-4">
                  <summary className="text-xs font-bold uppercase tracking-widest text-orange-500 cursor-pointer hover:text-orange-400 select-none">
                    Upload Statement Screenshot (AI OCR)
                  </summary>
                  <div className="mt-3 p-4 bg-black/30 border border-neutral-800">
                    <p className="text-[10px] font-sans text-neutral-500 mb-3">Upload a screenshot from ASCAP, BMI, SESAC, or other PRO portals. AI extracts the data automatically.</p>
                    <div className="flex gap-3 items-start">
                      <select id="artist-ocr-entity" className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-xs focus:border-orange-500 outline-none">
                        {['ascap','bmi','sesac','soundexchange','hfa','mlc','songtrust'].map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
                      </select>
                      <label className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 px-4 py-2 cursor-pointer hover:bg-neutral-800 transition-colors text-xs font-bold uppercase tracking-widest text-white">
                        <Upload className="w-4 h-4" /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const entity = (document.getElementById('artist-ocr-entity') as HTMLSelectElement)?.value || 'ascap';
                          const r = new FileReader();
                          r.onload = async () => {
                            const b64 = (r.result as string).split(',')[1];
                            try {
                              const res = await fetch('/api/ocr/statement', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ imageBase64: b64, mimeType: file.type, entity }),
                              });
                              const data = await res.json();
                              alert(`OCR complete: ${data.line_items?.length || 0} line items found. Total: $${(data.total_net || 0).toFixed(2)}`);
                              window.location.reload();
                            } catch (err: any) {
                              alert(`OCR failed: ${err.message}`);
                            }
                          };
                          r.readAsDataURL(file);
                        }} />
                      </label>
                    </div>
                  </div>
                </details>
              </div>

              {/* Legacy Statements */}
              <div className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-heading uppercase tracking-wider text-white">Sync Licensing Statements</h2>
                </div>
                <p className="font-sans text-sm text-neutral-400 mb-4">View your sync placement earnings and connect Stripe for payouts.</p>
                <div className="flex gap-4">
                  <Link to="/artist/royalties" className="bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors">
                    View Statements
                  </Link>
                  <button
                    onClick={async () => {
                      if (!artistId) return;
                      try {
                        const res = await fetch('/api/stripe/connect/onboard', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ artistId }),
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch { alert('Failed to connect Stripe. Try again.'); }
                    }}
                    className="bg-neutral-950 border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs text-white hover:bg-neutral-800 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" /> Connect Stripe
                  </button>
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
      <AgentChat context={{ role: 'artist', artistId: artistId || undefined, userId: user?.id }} />
    </>
  );
}

// === Live Artist Insights (replaces dashed metrics) ===
function LiveArtistInsights({ artistId, incomeData, tracks }: { artistId: string | null; incomeData: any[]; tracks: any[] }) {
  const [quality, setQuality] = useState<any>(null);
  useEffect(() => {
    if (artistId) fetch('/api/quality/scores/' + artistId).then(r => r.json()).then(d => setQuality(d)).catch(() => {});
  }, [artistId]);

  const topGenres = [...new Set(tracks.map((t: any) => t.genre).filter(Boolean))];
  const topGenre = topGenres.sort((a: any, b: any) => tracks.filter((t: any) => t.genre === b).length - tracks.filter((t: any) => t.genre === a).length)[0] || '—';
  const totalIncome = incomeData.reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
  const trackIncomeMap = tracks.map((t: any) => ({
    title: t.title?.substring(0, 15) || 'Unknown',
    income: incomeData.filter((i: any) => i.track_id === t.id).reduce((s: number, inc: any) => s + (parseFloat(inc.net_amount) || 0), 0),
  })).sort((a: any, b: any) => b.income - a.income).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <h2 className="text-xl font-heading uppercase tracking-wider text-white mb-6">Catalog Performance Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/50 p-4 border border-neutral-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Metadata Quality</p>
            <p className="text-3xl font-heading text-white">{quality?.overall != null ? quality.overall + '%' : '—'}</p>
          </div>
          <div className="bg-black/50 p-4 border border-neutral-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Total Income</p>
            <p className="text-3xl font-heading text-orange-500">${totalIncome.toFixed(0)}</p>
          </div>
          <div className="bg-black/50 p-4 border border-neutral-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Income Sources</p>
            <p className="text-3xl font-heading text-white">{new Set(incomeData.map((i: any) => i.source)).size || '—'}</p>
          </div>
          <div className="bg-black/50 p-4 border border-neutral-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Top Genre</p>
            <p className="text-xl font-heading text-white mt-2">{topGenre}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Income by Platform</h3>
          {incomeData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-500 text-sm font-sans">No income data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(() => {
                const grouped: Record<string, number> = {};
                for (const i of incomeData) {
                  const s = i.source || 'other';
                  grouped[s] = (grouped[s] || 0) + (parseFloat(i.net_amount) || 0);
                }
                return Object.entries(grouped).map(([source, amount]) => ({ source, amount }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="source" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 0, color: '#fff' }} />
                <Bar dataKey="amount" fill="#f97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Top Earning Tracks</h3>
          {trackIncomeMap.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-500 text-sm font-sans">No data yet — upload tracks to start building insights</div>
          ) : (
            <div className="space-y-2">
              {trackIncomeMap.map((t, i) => (
                <div key={i} className="flex justify-between items-center bg-black/30 p-3 border border-neutral-800">
                  <span className="text-sm font-bold uppercase tracking-wider text-white">{t.title}</span>
                  <span className="text-sm font-mono text-green-500">${t.income.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
