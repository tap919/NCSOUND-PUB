export default function RecordsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
        <h3 className="text-lg font-heading uppercase tracking-wider text-white">Label Roster (Net Profit Share)</h3>
        <button type="button" className="border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
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
  );
}
