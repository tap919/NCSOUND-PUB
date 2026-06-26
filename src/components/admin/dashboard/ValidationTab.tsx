import { ChevronRight } from 'lucide-react';

const pendingValidations = [
  { title: 'THE TAKEOVER', artist: 'Apex Beats', issues: ['Missing IPI for Co-writer', 'Split math = 95%'], status: 'Failed' },
  { title: 'LATE NIGHT DRIVE', artist: 'DJ Sol', issues: [], status: 'Passed' },
];

export default function ValidationTab() {
  return (
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
                <button type="button" className="mt-4 bg-neutral-950 border border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
                  Ping Artist for Revision
                </button>
              </div>
            )}
            {track.status === 'Passed' && (
              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-500">All required fields present. Math verified.</span>
                <button type="button" className="bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-orange-400 transition-colors flex items-center">
                  Send to Queues <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
