import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Disc3 } from 'lucide-react';
import { useState } from 'react';
import { GlobalPlayer } from '../GlobalPlayer';
import { useAuth } from '../../hooks/useAuth';
import { usePlayerStore } from '../../store/usePlayerStore';
import { SkipLink } from '../ui/SkipLink';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { role } = useAuth();
  const { currentTrack } = usePlayerStore();
  const mobileMenuRef = useFocusTrap(isMobileMenuOpen);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Sync Catalog', href: '/catalog' },
    { name: 'Music Supervisor Access', href: '/supervisor' },
    { name: 'Beat Store', href: '/beat-store' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col font-sans">
      <SkipLink />
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <img src="/assets/brand/ncsound-logo.jpg" alt="NcSound" className="h-8 w-auto object-contain" />
                <span className="text-2xl font-heading font-bold tracking-wider text-white uppercase">NcSound <span className="text-neutral-500 font-medium">Pub</span></span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-bold font-sans uppercase tracking-widest transition-colors ${
                    isActive(item.href) ? 'text-orange-500' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center space-x-4 border-l border-neutral-800 pl-6">
                <Link
                  to="/artist/login"
                  className="text-sm font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                >
                  Artist Portal
                </Link>
                <Link
                  to="/submit"
                  className="text-sm font-bold uppercase tracking-wider text-black bg-orange-500 hover:bg-orange-400 px-5 py-2.5 rounded-none border border-orange-500 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                >
                  Submit Your Catalog
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button
                type="button"
                className="text-neutral-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open menu</span>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-neutral-800 bg-neutral-900">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block rounded-md px-3 py-2 text-base font-bold font-sans uppercase tracking-widest ${
                    isActive(item.href) ? 'bg-neutral-800 text-orange-500' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/artist/login"
                className="block w-full text-center mt-2 text-base font-bold uppercase tracking-wider text-white border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-4 py-3 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Artist Portal
              </Link>
              <Link
                to="/submit"
                className="block w-full text-center mt-4 text-base font-bold uppercase tracking-wider text-black bg-orange-500 hover:bg-orange-400 px-4 py-3 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Submit Your Catalog
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className={`flex-1 w-full relative ${currentTrack ? 'pb-28' : 'pb-8'}`}>
        <Outlet />
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-950/80 mb-20 md:mb-24 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <Link to="/" className="flex items-center gap-2">
                <Disc3 className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-heading font-bold tracking-wider text-white uppercase">NcSound Pub</span>
              </Link>
            </div>
            <div className="mt-8 flex justify-center space-x-6 md:mt-0 items-center">
               <span className="text-sm font-sans text-neutral-500">
                &copy; {new Date().getFullYear()} NcSound Publishing. All rights reserved.
              </span>
              <span className="text-neutral-800 hidden sm:inline">|</span>
              <Link to="/terms" className="text-sm font-sans text-neutral-500 hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-neutral-800 hidden sm:inline">|</span>
              <Link to="/privacy" className="text-sm font-sans text-neutral-500 hover:text-white transition-colors">
                Privacy
              </Link>
              {role === 'admin' && (<>
                <span className="text-neutral-800 hidden sm:inline">|</span>
                <Link to="/admin/login" className="text-sm font-sans text-neutral-500 hover:text-white transition-colors">
                  Admin
                </Link>
              </>)}
            </div>
          </div>
        </div>
      </footer>

      {/* Persistent Global Player */}
      <GlobalPlayer />
    </div>
  );
}
