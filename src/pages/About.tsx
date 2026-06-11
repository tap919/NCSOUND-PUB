import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Target, Users, Shield, Zap, ExternalLink, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { SEO } from '../components/SEO';

const contactSchema = z.object({
  'first-name': z.string().min(1, 'First name is required'),
  'last-name': z.string().optional(),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function About() {
  const [inquiryType, setInquiryType] = useState('sync');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const result = contactSchema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('contact_submissions').insert({
      type: inquiryType,
      first_name: data['first-name'],
      last_name: data['last-name'] || null,
      email: data.email,
      company: data.company || null,
      message: data.message
    } as any);

    if (error) { toast.error('Failed to send message.'); setLoading(false); return; }

    toast.success('Message sent! We will get back to you soon.');
    setLoading(false);
    setSuccess(true);
  };

  const features = [
    {
      name: 'Artist-First Payouts',
      description: 'You keep 100% of your ownership. We take an industry-standard 20% ONLY on the sync placements we actively secure.',
      icon: Users,
    },
    {
      name: 'North Carolina Roots',
      description: 'Born in NC, with a focus on cultivating local and regional talent while pitching to a global marketplace.',
      icon: Target,
    },
    {
      name: 'Non-Exclusive Freedom',
      description: 'Our admin deals are non-exclusive. If you secure a placement yourself, you keep the money. Simple.',
      icon: Shield,
    },
    {
      name: 'Rapid Clearing',
      description: 'Music supervisors need fast answers. Our catalog structure ensures every track is pre-cleared for rapid licensing.',
      icon: Zap,
    },
  ];

  const artists = [
    {
      name: 'TAP919',
      genre: 'Producer / Founder',
      location: 'Raleigh, NC',
      imageUrl: '/assets/pictures/tap919-1.jpg',
      instagram: 'https://www.instagram.com/tap919/',
      rosterSlug: 'tap919'
    },
    {
      name: 'Mr. Niro',
      genre: 'Recording Artist',
      location: 'NC',
      imageUrl: '/assets/pictures/Niro/niro-solo.jpg',
      instagram: 'https://www.instagram.com/mr_niro/',
      rosterSlug: 'niro'
    },
    {
      name: 'A.R.T. Productions',
      genre: 'Producer',
      location: 'NC',
      imageUrl: '/assets/pictures/art/art.jpg',
      instagram: 'https://www.instagram.com/a_r_tproductions_/',
      rosterSlug: 'art-productions'
    },
    {
      name: 'The Soulyghost',
      genre: 'Singer / Songwriter',
      location: 'Franklinton, NC',
      imageUrl: '/assets/pictures/The Soulyghost/souly.jpg',
      instagram: 'https://www.instagram.com/thesoulyghost/',
      rosterSlug: 'soulyghost'
    },
  ];

  return (
    <div className="py-24 sm:py-32">
      <SEO title="About" description="NcSound Publishing — built for artists, trusted by supervisors. Non-exclusive admin, beat store, and sync licensing for independent producers." />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* About Section */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500">About NcSound Publishing</h2>
            <p className="mt-2 text-4xl sm:text-6xl font-heading tracking-wider uppercase text-white">
              Built for Artists. Trusted by Supervisors.
            </p>
            <p className="mt-6 text-xl leading-8 text-neutral-400 font-sans max-w-3xl mx-auto">
              NcSound Publishing was built to bridge the gap between heavy-hitting producers, street-level talent, and top-tier music supervisors. We realized artists needed a partner who championed their grind without demanding their master rights.
            </p>
          </motion.div>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none mb-32">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <dt className="flex items-center gap-x-4 text-xl font-heading tracking-wider text-white uppercase">
                  <div className="bg-orange-500/10 border border-orange-500/30 p-2 transform rotate-1">
                    <feature.icon className="h-6 w-6 flex-none text-orange-500" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base font-sans leading-7 text-neutral-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        {/* Roster Section */}
        <div className="mx-auto max-w-2xl text-center mb-16 pt-16 border-t border-neutral-800">
          <h2 className="font-graffiti text-5xl text-orange-500 mb-2">The Roster</h2>
          <p className="mt-4 text-lg font-sans leading-8 text-neutral-400">
            We are proud to administer the catalogs of these incredible independent artists. 
            Discover their sound and explore their available works for sync.
          </p>
        </div>

        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 sm:grid-cols-2 mb-32">
          {artists.map((artist) => (
            <article key={artist.name} className="flex flex-col items-start justify-between group">
              <Link to={`/roster/${artist.rosterSlug}`} className="relative w-full border-2 border-neutral-800 group-hover:border-orange-500 transition-colors bg-neutral-900 block">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="aspect-[4/5] w-full object-cover sm:aspect-[3/4] lg:aspect-[4/5] brightness-110 group-hover:brightness-125 transition-all duration-500"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-neutral-800" />
              </Link>
              <div className="max-w-xl mt-6">
                <div className="flex items-center gap-x-3 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-black bg-orange-500 px-2 py-0.5">{artist.genre}</span>
                  <span className="text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5">{artist.location}</span>
                </div>
                <div className="group relative mt-4 flex items-center gap-2">
                  {artist.rosterSlug ? (
                    <Link to={`/roster/${artist.rosterSlug}`} className="flex items-center gap-2 group-hover:text-orange-500 transition-colors">
                      <h3 className="text-2xl font-heading tracking-wider leading-6 text-white group-hover:text-orange-500 transition-colors">
                        <span className="absolute inset-0" />
                        {artist.name}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                    </Link>
                  ) : (
                    <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group-hover:text-orange-500 transition-colors">
                      <h3 className="text-2xl font-heading tracking-wider leading-6 text-white group-hover:text-orange-500 transition-colors">
                        <span className="absolute inset-0" />
                        {artist.name}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mx-auto max-w-2xl text-center pt-16 border-t border-neutral-800">
          <h2 className="font-graffiti text-5xl text-orange-500 mb-2">Get in Touch</h2>
          <p className="mt-2 text-lg leading-8 text-neutral-400 font-sans">
            How can we help you today?
          </p>
        </div>

        <div className="mt-10 mx-auto max-w-lg">
          <div className="flex border-b-2 border-neutral-800 mb-8">
            <button
              onClick={() => setInquiryType('sync')}
              className={`flex-1 pb-4 text-sm font-bold uppercase tracking-widest text-center transition-all ${
                inquiryType === 'sync' ? 'text-orange-500 border-b-2 border-orange-500 translate-y-[2px]' : 'text-neutral-500 hover:text-white'
              }`}
            >
              Sync/Licensing
            </button>
            <button
              onClick={() => setInquiryType('artist')}
              className={`flex-1 pb-4 text-sm font-bold uppercase tracking-widest text-center transition-all ${
                inquiryType === 'artist' ? 'text-orange-500 border-b-2 border-orange-500 translate-y-[2px]' : 'text-neutral-500 hover:text-white'
              }`}
            >
              Artist Inquiry
            </button>
          </div>

          {success ? (
            <div className="bg-neutral-900 border border-green-500/30 p-8 sm:p-12 shadow-2xl text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-heading uppercase text-white mb-4">Message Received</h3>
              <p className="text-neutral-400 font-sans">
                We'll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <motion.form 
              key={inquiryType}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 bg-neutral-900 border border-neutral-800 p-8 shadow-2xl relative"
              onSubmit={handleContactSubmit}
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 relative z-10">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-neutral-200">
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      required
                      className="block w-full rounded-none border-0 bg-neutral-900 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 font-sans"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      autoComplete="family-name"
                      className="block w-full rounded-none border-0 bg-neutral-900 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Email
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-none border-0 bg-neutral-900 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 font-sans"
                  />
                </div>
              </div>

              {inquiryType === 'sync' && (
                <div className="sm:col-span-2">
                  <label htmlFor="company" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Company / Production
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      className="block w-full rounded-none border-0 bg-neutral-900 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Message
                </label>
                <div className="mt-2">
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    required
                    className="block w-full rounded-none border-0 bg-neutral-900 py-3 px-4 text-white shadow-inner ring-1 ring-inset ring-neutral-800 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 font-sans"
                    defaultValue={''}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-none bg-orange-500 px-8 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-lg hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </motion.form>
          )}
        </div>

      </div>
    </div>
  );
}
