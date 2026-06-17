import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CatalogSubmit() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    timerRef.current = setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="py-24 sm:py-32 flex items-center justify-center min-h-screen">
        <div className="max-w-2xl text-center px-6">
          <CheckCircle2 className="w-20 h-20 text-orange-500 mx-auto mb-6" />
          <h2 className="text-4xl font-heading uppercase text-white mb-4">Submission Received</h2>
          <p className="text-neutral-400 font-sans mb-8">
            Your catalog details and rights declarations have been securely logged. An electronic signature request for our non-exclusive administration agreement has been sent to your email via DocuSign. 
          </p>
          <Link to="/" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-black bg-orange-500 hover:bg-orange-400 px-8 py-4 transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 sm:py-32 flex-1">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm text-neutral-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        <div className="text-left mb-12 border-b-2 border-neutral-800 pb-8">
          <h2 className="text-5xl font-heading font-bold uppercase tracking-wider text-white sm:text-6xl">Submit Your <span className="font-graffiti text-orange-500 text-6xl sm:text-7xl lowercase drop-shadow-lg">Catalog for Publishing Administration</span></h2>
          <p className="mt-6 text-lg leading-8 text-neutral-400 font-sans max-w-2xl">
            Submit your owned catalog for non-exclusive publishing administration. NcSound takes 20% only on placements we secure — you keep 100% of your masters and all other income.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-8 sm:p-12 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[100px] rounded-full point-events-none"></div>
          <form className="space-y-12 relative z-10" onSubmit={handleSubmit}>
            
            {/* Artist Info */}
            <div>
              <h3 className="text-2xl font-heading uppercase tracking-wider text-orange-500 mb-6">Artist Information</h3>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Email Address *
                  </label>
                  <div className="mt-2">
                    <input type="email" name="email" id="email" required className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans" />
                  </div>
                </div>
                <div>
                  <label htmlFor="artist-name" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Artist or Band Name *
                  </label>
                  <div className="mt-2">
                    <input type="text" name="artist-name" id="artist-name" required className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans" />
                  </div>
                </div>
                <div>
                  <label htmlFor="legal-name" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Legal Name (for contract)
                  </label>
                  <div className="mt-2">
                    <input type="text" name="legal-name" id="legal-name" required className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-neutral-800" />

            {/* Publishing Info */}
            <div>
              <h3 className="text-2xl font-heading uppercase tracking-wider text-orange-500 mb-6">Publishing & Rights</h3>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <label htmlFor="pro" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    PRO Affiliation
                  </label>
                  <div className="mt-2">
                    <select id="pro" name="pro" className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans">
                      <option>ASCAP</option>
                      <option>BMI</option>
                      <option>SESAC</option>
                      <option>Other / None</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="ipi" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    IPI Number
                  </label>
                  <div className="mt-2">
                    <input type="text" name="ipi" id="ipi" className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-mono" placeholder="9-digit number" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="relative flex items-start bg-neutral-950 p-4 border border-neutral-800">
                    <div className="flex h-6 items-center">
                      <input id="ownership" name="ownership" type="checkbox" required className="h-5 w-5 rounded-none border-white/10 bg-black text-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-900" />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="ownership" className="font-bold text-white uppercase tracking-wider">Rights Confirmation *</label>
                      <p className="text-neutral-400 font-sans mt-1">I confirm that I own or control 100% of the master and composition rights for the submitted material, and there are no uncleared samples. We don't play with sample drama.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-neutral-800" />

            {/* Catalog Info */}
            <div>
              <h3 className="text-2xl font-heading uppercase tracking-wider text-orange-500 mb-6">Catalog Intel</h3>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <label htmlFor="catalog-size" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Catalog Size (Estimated Number of Tracks)
                  </label>
                  <div className="mt-2">
                    <select id="catalog-size" name="catalog-size" className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans">
                      <option>1 - 5 tracks</option>
                      <option>6 - 20 tracks</option>
                      <option>21 - 50 tracks</option>
                      <option>50+ tracks</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="term-length" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Desired Term Length
                  </label>
                  <div className="mt-2">
                    <select id="term-length" name="term-length" className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans">
                      <option>1 Year</option>
                      <option>2 Years</option>
                      <option>3 Years</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="genre-tags" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Primary Genres (e.g. Cinematic Trap, Boom Bap)
                  </label>
                  <div className="mt-2">
                    <input type="text" name="genre-tags" id="genre-tags" required className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans" placeholder="Comma separated tags..." />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="links" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Streaming Links (Spotify, Apple Music, SoundCloud, etc.)
                  </label>
                  <div className="mt-2">
                    <textarea name="links" id="links" rows={4} className="block w-full rounded-none border-0 bg-neutral-950 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm font-sans" placeholder="Paste your streaming profile or release links here" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-6 border-t border-neutral-800">
              <span className="block text-sm text-neutral-500 mb-6 font-sans">
                By submitting, you will be directed to review and digitally sign our standard non-exclusive publishing administration agreement.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-none bg-orange-500 px-10 py-4 text-base font-bold uppercase tracking-widest text-black shadow-lg hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Contract'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
