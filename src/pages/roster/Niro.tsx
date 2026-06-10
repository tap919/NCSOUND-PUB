import { ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Niro() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-black/90 border-b border-neutral-900 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link to="/about" className="flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-orange-500 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roster
        </Link>
        <a
          href="https://niro-music.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
        >
          Open in New Tab <ExternalLink className="w-3 h-3 ml-1.5" />
        </a>
      </div>

      {/* Loading */}
      {!loaded && (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Loading Niro's site...</p>
          </div>
        </div>
      )}

      {/* Full-page iframe */}
      <iframe
        src="/niro-site/"
        className={`w-full border-0 ${loaded ? 'flex-1' : 'h-0'}`}
        title="Niro"
        onLoad={() => setLoaded(true)}
        allow="autoplay *; fullscreen *"
      />
    </div>
  );
}
