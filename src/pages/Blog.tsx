import { useState, useEffect } from 'react';
import { Youtube, Radio, Headphones } from 'lucide-react';
import { SEO } from '../components/SEO';

const NCSOUND_CHANNEL_ID = 'UCc-BX8O8xIAHOdPUwEGzxZA';

export default function Blog() {
  const [videos, setVideos] = useState<{ id: string; title: string; thumbnail: string; publishedAt: string }[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/youtube/feed?channelId=${NCSOUND_CHANNEL_ID}`)
      .then(r => r.json())
      .then(data => {
        setVideos(data.videos || []);
        setIsLive(data.isLive || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Keep static blog posts as "articles" alongside video resources
  const articles = [
    {
      title: 'How to Prepare Your Catalog for Sync Licensing',
      description: 'Music supervisors move fast. If your files, metadata, and instrumentals aren\'t ready to go at a moment\'s notice, you will lose the placement.',
      date: 'Mar 16, 2026',
      category: 'Education',
    },
    {
      title: 'Exclusive vs. Non-Exclusive Publishing Deals Explained',
      description: 'Understanding the difference between signing your entirety of rights away vs. creating a strategic partnership for incremental revenue.',
      date: 'Mar 10, 2026',
      category: 'Industry',
    },
    {
      title: 'Placement Alert: The Riverstones hit major network TV',
      description: 'We are thrilled to announce that Durham-based folk group The Riverstones have their track featured in the season finale of a major network drama.',
      date: 'Feb 28, 2026',
      category: 'News',
    },
  ];

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SEO title="Resources" description="Sync licensing tips, industry insights, and video resources from NcSound Publishing." />

        {/* Live Indicator */}
        {isLive && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-4 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-red-400 text-sm font-bold uppercase tracking-widest">Live Now on YouTube</span>
            <a href={`https://www.youtube.com/channel/${NCSOUND_CHANNEL_ID}/live`} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-bold uppercase tracking-widest bg-red-500 text-white px-4 py-2 hover:bg-red-400 transition-colors flex items-center gap-2">
              <Radio className="w-4 h-4" /> Watch Live
            </a>
          </div>
        )}

        <div className="text-center mb-16">
          <h2 className="text-5xl font-heading font-bold tracking-wider text-white uppercase">The <span className="font-graffiti text-orange-500 drop-shadow-md">Wire</span></h2>
          <p className="mt-4 text-lg leading-8 text-neutral-400 font-sans">
            Publishing education, sync tips, video resources, and announcements from the NcSound team.
          </p>
        </div>

        {/* Video Resources */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
            <Youtube className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-heading uppercase tracking-wider text-white">Latest Videos</h3>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-neutral-800 aspect-video" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <p className="text-neutral-500 font-sans text-center py-12">No videos yet. Subscribe to our YouTube channel for updates.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => (
                <a key={video.videoId} href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="group block bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition-all">
                  <div className="aspect-video bg-neutral-800 relative overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {video.isLive && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <Youtube className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-heading uppercase tracking-wider text-white line-clamp-2 group-hover:text-orange-500 transition-colors">{video.title}</h4>
                    <p className="text-[10px] text-neutral-500 font-sans mt-2">{new Date(video.published).toLocaleDateString()}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <a href={`https://www.youtube.com/channel/${NCSOUND_CHANNEL_ID}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">
              <Youtube className="w-4 h-4 mr-2" /> View All on YouTube
            </a>
          </div>
        </div>

        {/* Articles */}
        <div>
          <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
            <Headphones className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-heading uppercase tracking-wider text-white">Articles</h3>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {articles.map((post) => (
              <article key={post.title} className="flex flex-col items-start justify-between border-2 border-neutral-800 bg-neutral-900 p-8 hover:border-orange-500/50 transition-all">
                <div className="flex items-center gap-x-4 text-[10px] font-bold uppercase tracking-widest w-full justify-between mb-4">
                  <time className="text-neutral-500">{post.date}</time>
                  <span className="bg-orange-500 px-2 py-1 text-black">{post.category}</span>
                </div>
                <h4 className="text-xl font-heading tracking-wider text-white group-hover:text-orange-500 transition-colors mb-3">{post.title}</h4>
                <p className="text-sm font-sans text-neutral-400 line-clamp-3">{post.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
