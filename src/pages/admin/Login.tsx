import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-neutral-950 flex flex-col items-center justify-center">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-md w-full relative z-10 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-neutral-900 border border-neutral-700 mb-6">
            <ShieldCheck className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-4xl font-heading font-bold uppercase tracking-wider text-white">
            System <span className="text-orange-500">Access</span>
          </h2>
          <p className="mt-2 text-sm font-sans text-neutral-400 uppercase tracking-widest font-bold">
            Publishing Automation Engine
          </p>
        </div>

        <form 
          className="mt-8 space-y-6 bg-neutral-900 border border-neutral-800 p-8 sm:p-10 shadow-2xl relative" 
          onSubmit={handleAuth}
        >
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 px-4 py-4 text-white font-mono placeholder-neutral-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                placeholder="admin@ncsound.com"
              />
            </div>
            <div>
               <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">
                Passkey
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 pl-12 pr-4 py-4 text-white font-mono placeholder-neutral-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 px-4 py-4 text-sm font-bold uppercase tracking-widest text-black hover:bg-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)] mt-6 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div className="text-center pt-4">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
            Return to Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
