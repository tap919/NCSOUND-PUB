import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { ShieldCheck, FileText, Music, Globe } from 'lucide-react';

export default function ProGuide() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SEO title="PRO Registration Guide" description="Learn how to register with ASCAP, BMI, or SESAC and collect publishing royalties." />
        <Link to="/artist/dashboard" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8 inline-block">← Back to Dashboard</Link>
        <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">PRO Registration Guide</h1>
        <p className="text-neutral-400 font-sans text-sm mb-10">How to register with a Performing Rights Organization and start collecting publishing royalties.</p>

        <div className="space-y-8">
          <section className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-heading uppercase tracking-wider text-white">What is a PRO?</h2>
            </div>
            <p className="text-sm font-sans text-neutral-300 leading-relaxed">
              A Performing Rights Organization (PRO) collects performance royalties on your behalf when your music is played on TV, radio, streaming services, live venues, and more. As a songwriter/publisher, you need to register with a PRO to collect these royalties.
            </p>
          </section>

          <section className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Music className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-heading uppercase tracking-wider text-white">Major PROs</h2>
            </div>
            <div className="grid gap-4">
              {[
                { name: 'ASCAP', desc: 'American Society of Composers, Authors and Publishers. $50 one-time fee. Most popular for songwriters.', url: 'https://www.ascap.com' },
                { name: 'BMI', desc: 'Broadcast Music Inc. Free to join. Popular for songwriters and composers.', url: 'https://www.bmi.com' },
                { name: 'SESAC', desc: 'Invitation-only. Smaller but offers personalized service.', url: 'https://www.sesac.com' },
              ].map(pro => (
                <a key={pro.name} href={pro.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-neutral-950 border border-neutral-800 p-4 hover:border-orange-500/50 transition-colors group">
                  <div>
                    <h3 className="text-white font-bold font-sans">{pro.name}</h3>
                    <p className="text-xs text-neutral-400 font-sans mt-1">{pro.desc}</p>
                  </div>
                  <Globe className="w-4 h-4 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                </a>
              ))}
            </div>
          </section>

          <section className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-heading uppercase tracking-wider text-white">How to Register</h2>
            </div>
            <ol className="space-y-4 text-sm font-sans text-neutral-300">
              <li className="flex gap-3">
                <span className="bg-orange-500 text-black w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
                <span><strong className="text-white">Choose a PRO</strong> — ASCAP ($50 fee) or BMI (free) are the most common for independent artists.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-orange-500 text-black w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
                <span><strong className="text-white">Create an account</strong> — Sign up as both a songwriter AND a publisher to collect both shares.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-orange-500 text-black w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
                <span><strong className="text-white">Get your IPI number</strong> — This is your unique identifier across all PROs worldwide. Save it — you'll need it for every registration.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-orange-500 text-black w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">4</span>
                <span><strong className="text-white">Add your catalog</strong> — Register each song with your PRO: title, writers, publisher splits, ISRC/ISWC if available.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-orange-500 text-black w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">5</span>
                <span><strong className="text-white">Update your profile</strong> — Add your IPI number and PRO affiliation in your <Link to="/artist/profile" className="text-orange-500 hover:text-orange-400">artist profile settings</Link>.</span>
              </li>
            </ol>
          </section>

          <section className="bg-neutral-900 border border-neutral-800 p-6">
            <h2 className="text-xl font-heading uppercase tracking-wider text-white mb-4">Next Steps</h2>
            <div className="text-sm font-sans text-neutral-300 space-y-2">
              <p>Once registered, tracks you upload through NcSound can be registered with your PRO for royalty collection. We'll handle the metadata and split documentation — you just need your IPI number on file.</p>
              <p className="mt-4">Questions? Contact us at <span className="text-orange-500">ncsoundpublishing@gmail.com</span></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
