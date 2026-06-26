import { Database } from 'lucide-react';

const registryQueue = [
  { title: 'STREET ANTHEM VOL 1', target: 'The MLC (CWR)', status: 'Pending Upload', deduct: 'Dedupe Match: 0' },
  { title: 'MIDNIGHT COFFEE', target: 'ASCAP/BMI Bridge', status: 'Processing', deduct: 'API Connected' },
];

export default function MLCTab() {
  return (
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
  );
}
