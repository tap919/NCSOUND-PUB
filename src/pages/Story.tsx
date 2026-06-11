import { BookOpen, Download, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';

const CHAPTERS = [
  {
    number: 'PROLOGUE',
    title: 'The Foundation',
    content: `Every empire starts with a single brick. NcSound Publishing was born not in a boardroom, but in the bedroom of a producer who refused to accept the limitations placed on independent artists. In Raleigh, North Carolina — a city caught between the hip-hop Mecca of New York and the trap dynasty of Atlanta — a new sound was waiting to be forged.

    Terrence Perry II, known in the streets and on the boards as Tap919, had spent years watching talented producers get exploited. Beats sold for pocket change. Publishing signed away for nothing. Sync placements that could change lives going to the same five major-label acts.

    The system wasn't broken — it was designed that way. And someone had to redesign it.`,
    image: 'origin',
  },
  {
    number: 'CHAPTER I',
    title: 'The Beat Builder',
    content: `Tap919 cut his teeth in the NC underground, building beats in FL Studio until 3 AM, layering 808s and samples into something that felt like the future. His early work caught the attention of DJ Skullator, a veteran curator with ears tuned to what's next.

    Together, they started building a network. Not just of producers, but of artists, engineers, videographers, and most importantly — music supervisors looking for fresh sounds.

    The vision was clear: create a publishing platform that treats artists like partners, not products. Non-exclusive deals. 80/20 splits in favor of the creator. And a pipeline directly to the people who place music in TV, film, and advertising.

    No one was doing this for the independent producer. Until now.`,
    image: 'build',
  },
  {
    number: 'CHAPTER II',
    title: 'The Roster',
    content: `The roster grew organically. Mr. Niro (David Irby) brought raw lyricism and street narratives that demanded to be heard. A.R.T. Productions brought the hard-hitting boom bap that makes NC hip-hop distinct. Each artist added a new color to the palette.

    But NcSound wasn't just about collecting talent — it was about activating it. Every track uploaded to the platform became eligible for sync licensing. Every producer got access to a growing network of music supervisors. Every beat sold in the store came with automatic placement opportunity.

    The Roster wasn't a list. It was a movement.`,
    image: 'roster',
  },
  {
    number: 'CHAPTER III',
    title: 'The Technology',
    content: `NcSound Publishing was built from the ground up as a technology-first publishing platform. Not just a website — a complete operating system for the independent musician's career.

    AI-powered brief matching connects producer catalogs to supervisor needs in real-time. Automated royalty tracking aggregates income across all platforms. CWR generation streamlines PRO registration. Stripe Connect enables instant payouts.

    The platform handles the business so artists can focus on the music.

    It's publishing administration reimagined for the 21st century — where AI handles the paperwork and humans handle the creativity.`,
    image: 'tech',
  },
  {
    number: 'CHAPTER IV',
    title: 'The Future',
    content: `The story of NcSound is still being written. With a growing catalog of 100+ tracks, a network of supervisors spanning film, television, and advertising, and technology that gets smarter every day — the foundation is laid for something bigger.

    The goal: become the go-to publishing partner for independent producers across the Southeast and beyond. Build a catalog that competes with major publishers while keeping artist ownership intact. Prove that the independent model isn't just viable — it's superior.

    This isn't just a publishing company. It's proof that the streets can build their own system. Their own infrastructure. Their own future.

    The sound of North Carolina is about to be heard everywhere.`,
    image: 'future',
  },
];

export default function Story() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <SEO title="The NcSound Story" description="The origin, vision, and future of NcSound Publishing — told as a graphic novel." />

      {/* Hero */}
      <div className="relative border-b border-neutral-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-neutral-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 mb-8">
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">The Origin Story</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-heading font-bold uppercase tracking-wider text-white leading-none mb-6">
            NcSound
          </h1>
          <div className="font-graffiti text-5xl text-orange-500 mb-8">Volume I: The Foundation</div>
          <p className="text-lg font-sans text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            From a bedroom studio in Raleigh, NC to a technology-powered publishing platform serving independent artists worldwide — this is the story of NcSound Publishing.
          </p>
          <div className="flex gap-4 justify-center mt-10">
            <a href="/api/story/download" className="inline-flex items-center gap-2 bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors">
              <Download className="w-4 h-4" /> Download PDF
            </a>
            <Link to="/about" className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700 px-6 py-3 font-bold uppercase tracking-widest text-xs text-white hover:bg-neutral-800 transition-colors">
              Meet The Team <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
        {CHAPTERS.map((chapter, i) => (
          <div key={i} className="relative">
            {/* Decorative line */}
            {i > 0 && <div className="absolute -top-16 left-8 w-px h-16 bg-gradient-to-b from-transparent via-orange-500/30 to-transparent" />}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Chapter number sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">{chapter.number}</div>
                  <h2 className="text-2xl font-heading uppercase tracking-wider text-white">{chapter.title}</h2>
                  <div className="w-12 h-0.5 bg-orange-500 mt-4" />
                </div>
              </div>

              {/* Chapter content */}
              <div className="lg:col-span-4">
                <div className="bg-neutral-900 border border-neutral-800 p-8 sm:p-12 relative">
                  {/* Decorative corner */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-orange-500" />

                  {/* Panel decoration */}
                  <div className="flex gap-2 mb-6">
                    {[1,2,3].map(dot => (
                      <div key={dot} className="w-2 h-2 rounded-full bg-neutral-800" />
                    ))}
                  </div>

                  <div className="prose prose-invert max-w-none">
                    {chapter.content.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-base sm:text-lg font-sans text-neutral-300 leading-relaxed mb-6 first-letter:text-orange-500 first-letter:text-3xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>

                  {/* Page number */}
                  <div className="text-center mt-8 pt-6 border-t border-neutral-800">
                    <span className="text-xs font-mono text-neutral-600">— {i + 1} —</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Epilogue / CTA */}
      <div className="border-t border-neutral-800 py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-heading uppercase tracking-wider text-white mb-4">To Be Continued...</h2>
          <p className="font-sans text-neutral-400 mb-8">The story of NcSound is being written every day. Stay connected for Volume II.</p>
          <a href="/api/story/download" className="inline-flex items-center gap-2 bg-orange-500 text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors">
            <Download className="w-4 h-4" /> Download Complete Story
          </a>
        </div>
      </div>
    </div>
  );
}
