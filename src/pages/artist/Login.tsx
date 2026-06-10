import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Check your email for the confirmation link!');
        setIsSignUp(false);
        setPassword('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/artist/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl sm:text-5xl font-heading font-bold uppercase tracking-wider text-white">
            Artist <span className="text-orange-500">Portal</span>
          </h2>
          <p className="mt-2 text-center text-sm font-sans text-neutral-400 uppercase tracking-widest font-bold">
            {isSignUp ? 'Create an account' : 'Manage your catalog & royalties'}
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-neutral-900 border border-neutral-800 p-8 sm:p-10 shadow-2xl" onSubmit={handleAuth}>
          {successMsg && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded relative text-sm" role="status">
              <span className="block sm:inline">{successMsg}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="space-y-5 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full appearance-none rounded-none border border-neutral-800 bg-neutral-950 px-4 py-4 text-white placeholder-neutral-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm font-sans shadow-inner"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-none border border-neutral-800 bg-neutral-950 px-4 py-4 text-white placeholder-neutral-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm font-sans shadow-inner"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded-none border-neutral-800 bg-neutral-950 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold uppercase tracking-widest text-neutral-400">
                Remember me
              </label>
            </div>

            <div className="text-sm flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-bold uppercase tracking-widest text-xs text-orange-500 hover:text-orange-400"
              >
                {isSignUp ? 'Already have an account?' : 'Need an account?'}
              </button>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { setError('Enter your email first.'); return; }
                    const { error } = await supabase.auth.resetPasswordForEmail(email);
                    if (error) setError(error.message);
                    else setSuccessMsg('Password reset email sent!');
                  }}
                  className="font-bold uppercase tracking-widest text-[10px] text-neutral-500 hover:text-orange-500 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center bg-orange-500 px-4 py-4 text-sm font-bold uppercase tracking-widest text-black hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign in to Portal'}
            </button>
          </div>
          <div className="text-center pt-2">
             <span className="text-xs text-neutral-500 font-sans">Not partnered yet? </span>
             <Link to="/submit" className="text-xs font-bold uppercase tracking-widest text-white hover:text-orange-500 transition-colors">Submit Catalog</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
