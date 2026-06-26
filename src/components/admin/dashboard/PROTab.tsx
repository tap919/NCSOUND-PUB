import { Activity } from 'lucide-react';

export default function PROTab() {
  return (
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
  );
}
