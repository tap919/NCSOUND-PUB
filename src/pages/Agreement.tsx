import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Agreement() {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <ShieldCheck className="mx-auto h-16 w-16 text-orange-500 mb-6 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          <h2 className="text-4xl font-heading tracking-wider text-white uppercase sm:text-5xl">The <span className="font-graffiti text-orange-500">Agreement</span></h2>
          <p className="mt-4 text-lg leading-8 text-neutral-400 font-sans">
            Please review the terms of our non-exclusive administrative partnership. Pure transparency.
          </p>
        </div>

        <div className="bg-neutral-100 p-8 sm:p-12 rounded-none shadow-2xl text-black relative">
          {/* Subtle texture overlay for paper effect */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>
          <div className="prose prose-sm sm:prose-base mx-auto max-w-none text-neutral-900 font-sans relative z-10">
            <h3 className="text-2xl font-heading tracking-widest text-black uppercase mb-4 border-b-4 border-orange-500 pb-2 inline-block">NON-EXCLUSIVE ADMINISTRATION CONTRACT</h3>
            <p className="mb-6 text-sm font-bold tracking-widest uppercase text-neutral-500">Effective Date: {new Date().toLocaleDateString()}</p>
            
            <p className="mb-4">
              This Non-Exclusive Publishing Administration Agreement (the "Agreement") is entered into by and between 
              <strong> NcSound Publishing</strong> ("Administrator") and the submitting entity/individual ("Writer/Publisher").
            </p>

            <h4 className="font-heading text-xl uppercase tracking-wider text-black mt-8 mb-2">1. Grant of Rights</h4>
            <p className="mb-4">
              Writer/Publisher hereby grants to Administrator the non-exclusive right to administer, license, and collect royalties for the musical compositions submitted via the NcSound Platform (the "Compositions") within the Territory (The World). Writer/Publisher retains 100% ownership of the copyright in and to the Compositions.
            </p>

            <h4 className="font-heading text-xl uppercase tracking-wider text-black mt-8 mb-2">2. Term</h4>
            <p className="mb-4">
              The initial term of this Agreement shall be one (1) year. Either party may terminate this agreement with thirty (30) days written notice after the initial term.
            </p>

            <h4 className="font-heading text-xl uppercase tracking-wider text-black mt-8 mb-2">3. Compensation & Splits</h4>
            <p className="mb-4">
              Administrator shall retain twenty percent (20%) of all gross receipts actually received by Administrator derived directly from synchronization licenses and placements secured exclusively by the Administrator. Writer/Publisher shall receive eighty percent (80%) of such gross receipts. Administrator shall not collect royalties on placements or licenses secured directly by the Writer/Publisher or third parties.
            </p>

            <h4 className="font-heading text-xl uppercase tracking-wider text-black mt-8 mb-2">4. Representations & Warranties</h4>
            <p className="mb-6">
              Writer/Publisher warrants that they have the full right and authority to enter into this Agreement, that they own or control the Compositions, and that no samples or third-party materials are included without proper clearance.
            </p>

            <div className="mt-12 p-6 bg-white rounded-none border-2 border-neutral-300 shadow-inner">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                (This is a demonstration of the digital signature workflow that will integrate with DocuSign/HelloSign in Phase 2)
              </p>
              <div className="flex items-center space-x-4 mb-8">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="h-6 w-6 rounded-none border-neutral-400 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="agree" className="font-bold text-neutral-900 uppercase tracking-wide">
                  I have read and agree to the terms of this Publishing Admin Agreement.
                </label>
              </div>
              <button
                type="button"
                disabled={!agreed}
                className={
                  'w-full sm:w-auto rounded-none px-10 py-5 text-sm font-bold uppercase tracking-widest text-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all ' +
                  (agreed ? 'bg-orange-500' : 'bg-neutral-400 cursor-not-allowed')
                }
                onClick={() => toast.success('Agreement signed! Welcome to the syndicate.')}
              >
                Sign & Lock In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
