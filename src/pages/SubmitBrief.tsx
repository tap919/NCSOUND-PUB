import React, { useState } from 'react';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SubmitBrief() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    const { error } = await supabase.from('briefs').insert({
      project_name: data.project_title as string,
      use_type: data.descriptors as string,
      requester_email: data.email as string,
      details: data.details as string,
      budget_range: data.budget as string,
      deadline: data.deadline as string,
      status: 'open'
    } as any);

    if (error) console.error(error);

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="py-24 sm:py-32 flex-1">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Link to="/supervisor" className="inline-flex items-center text-sm text-neutral-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portal
        </Link>
        <div className="text-left mb-12">
          <h2 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">Submit a <span className="text-orange-500">Brief</span></h2>
          <p className="mt-4 text-sm leading-6 text-neutral-400 font-sans max-w-xl">
            Drop us your music brief, reference tracks, or mood boards. Our curation team alongside the AI Pitch Engine will return a custom playlist link within 12 hours.
          </p>
        </div>

        {submitted ? (
          <div className="bg-neutral-900 border border-green-500/30 p-8 sm:p-12 shadow-2xl text-center">
            <MailCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-heading uppercase text-white mb-4">Brief Placed</h3>
            <p className="text-neutral-400 font-sans">
              We've received your brief. Our system is spinning up a custom DISCO playlist. We'll be in touch.
            </p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-none p-8 sm:p-12 shadow-2xl relative">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Project Title / Network</label>
                <input type="text" name="project_title" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
              </div>
              
              <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Genre / Mood / Descriptors</label>
                 <input type="text" name="descriptors" required placeholder="e.g. Gritty Boom Bap, Cinematic Trap, High Energy" className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Company Email</label>
                <input type="email" name="email" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Brief Details</label>
                <textarea rows={5} name="details" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" placeholder="Paste your full brief here... include reference links (Spotify/YouTube/DISCO) if you have them."></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Budget Range</label>
                    <select name="budget" className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none">
                       <option>TBD</option>
                       <option>Under $1k</option>
                       <option>$1k - $5k</option>
                       <option>$5k - $15k</option>
                       <option>$15k+</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Deadline</label>
                    <input type="date" name="deadline" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
                 </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-orange-500 px-10 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-lg hover:bg-orange-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Dispatch Brief'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
