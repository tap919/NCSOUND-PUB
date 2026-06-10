import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SupervisorRegister() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    const { error } = await supabase.from('supervisor_access_requests').insert({
      first_name: data.first_name,
      last_name: data.last_name,
      company: data.company,
      email: data.email,
      links: data.links
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
          <h2 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">Supervisor <span className="text-orange-500">Verification</span></h2>
          <p className="mt-4 text-sm leading-6 text-neutral-400 font-sans max-w-xl">
            Request an access key to bypass inquiry forms and directly browse, save, and download pre-cleared WAVs from our catalog.
          </p>
        </div>

        {submitted ? (
          <div className="bg-neutral-900 border border-green-500/30 p-8 sm:p-12 shadow-2xl text-center">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-heading uppercase text-white mb-4">Request Received</h3>
            <p className="text-neutral-400 font-sans">
              Our team will verify your credentials. If approved, you will receive an access key via email.
            </p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-none p-8 sm:p-12 shadow-2xl relative">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">First Name</label>
                  <input type="text" name="first_name" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Last Name</label>
                  <input type="text" name="last_name" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Company / Agency / Network</label>
                <input type="text" name="company" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Company Email</label>
                <input type="email" name="email" required className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Links (IMDb, LinkedIn, etc.)</label>
                <textarea rows={3} name="links" className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white focus:border-orange-500 font-sans outline-none" placeholder="Provide link(s) to verify your credentials..."></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-orange-500 px-10 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-lg hover:bg-orange-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
