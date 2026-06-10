import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function Privacy() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SEO title="Privacy Policy" description="NcSound Publishing Privacy Policy" />
        <Link to="/" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8 inline-block">← Back</Link>
        <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-sm prose-invert max-w-none text-neutral-300 font-sans space-y-6">
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Last updated: June 2026</p>

          <h2 className="text-white font-heading text-xl mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email address, payment information, music metadata, and communication preferences. We also collect usage data: page views, track plays, and interaction patterns.</p>

          <h2 className="text-white font-heading text-xl mt-8">2. How We Use Your Information</h2>
          <p>To operate the platform, process transactions, match your catalog with licensing opportunities, communicate about placements and payments, and improve our services.</p>

          <h2 className="text-white font-heading text-xl mt-8">3. Data Sharing</h2>
          <p>We share your data only with: Stripe (payment processing), Supabase (cloud database hosting), and music supervisors who require track metadata for licensing evaluation. We never sell your personal data.</p>

          <h2 className="text-white font-heading text-xl mt-8">4. Data Retention</h2>
          <p>We retain your account data for the duration of your agreement plus 3 years. You may request deletion at any time by contacting support.</p>

          <h2 className="text-white font-heading text-xl mt-8">5. Security</h2>
          <p>We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and strict access controls.</p>

          <h2 className="text-white font-heading text-xl mt-8">6. Your Rights</h2>
          <p>You have the right to access, correct, export, or delete your personal data. Contact us at ncsoundpublishing@gmail.com to exercise these rights.</p>

          <h2 className="text-white font-heading text-xl mt-8">7. Cookies</h2>
          <p>We use essential cookies for authentication and platform functionality. We do not use tracking cookies or third-party analytics.</p>

          <h2 className="text-white font-heading text-xl mt-8">8. Contact</h2>
          <p>NcSound Publishing<br />Knightdale, North Carolina<br />ncsoundpublishing@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
