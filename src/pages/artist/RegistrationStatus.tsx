import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Registration } from '../../types';

export default function RegistrationStatus() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) { setLoading(false); return; }
      const { data: artistRow } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (ignore) return;
      const artist = artistRow as unknown as { id: string } | null;
      if (artist) {
        const { data: tracks } = await supabase
          .from('tracks')
          .select('*')
          .eq('artist_id', artist.id);
        if (ignore) return;
        if (tracks && tracks.length > 0) {
          const trackIds = (tracks as unknown as { id: string }[]).map(t => t.id);
          const { data } = await supabase
            .from('registrations')
            .select('*, tracks(title)')
            .in('track_id', trackIds)
            .order('created_at', { ascending: false });
          if (!ignore && data) setRegistrations(data);
        }
      }
      if (!ignore) setLoading(false);
    };
    load();
    return () => { ignore = true; };
  }, [user]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">Registration <span className="text-orange-500">Status</span></h1>
        <p className="text-neutral-400 font-sans mt-1">Track PRO, MLC, and copyright registration progress for your catalog.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-neutral-500 font-sans border border-neutral-800 bg-neutral-900">Loading registrations...</div>
      ) : registrations.length === 0 ? (
        <div className="p-12 text-center border border-neutral-800 bg-neutral-900">
          <ShieldCheck className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl font-heading uppercase text-white mb-2">No Registrations Yet</h3>
          <p className="text-neutral-400 font-sans text-sm max-w-md mx-auto">Once your tracks pass metadata validation, they are submitted to PROs and The MLC. Status will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-heading uppercase tracking-wider text-white">{reg.tracks?.title || 'Unknown Track'}</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-1">{reg.registry}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border ${statusColor(reg.status)}`}>
                  {reg.status}
                </span>
                {reg.iswc_returned && (
                  <span className="font-mono text-xs text-neutral-400">ISWC: {reg.iswc_returned}</span>
                )}
                {reg.rejection_reason && (
                  <span className="text-xs text-red-400 font-sans max-w-[200px] truncate">{reg.rejection_reason}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
