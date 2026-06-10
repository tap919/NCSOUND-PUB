import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function Terms() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SEO title="Terms of Service" description="NcSound Publishing Terms of Service" />
        <Link to="/" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8 inline-block">← Back</Link>
        <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-8">Terms of Service</h1>
        <div className="prose prose-sm prose-invert max-w-none text-neutral-300 font-sans space-y-6">
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Last updated: June 2026</p>
          
          <h2 className="text-white font-heading text-xl mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using NcSound Publishing ("NcSound," "we," "us"), you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>

          <h2 className="text-white font-heading text-xl mt-8">2. Description of Service</h2>
          <p>NcSound provides a platform for music publishing administration, sync licensing, beat marketplace transactions, and related services. We act as a non-exclusive administrative publisher for enrolled composers and producers.</p>

          <h2 className="text-white font-heading text-xl mt-8">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must be 18 years or older to use this platform. You represent that all registration information you provide is accurate and complete.</p>

          <h2 className="text-white font-heading text-xl mt-8">4. Intellectual Property</h2>
          <p>You retain 100% ownership of your copyrights and masters. NcSound is granted non-exclusive administrative rights solely for the purpose of sync licensing and royalty collection as outlined in your publishing agreement.</p>

          <h2 className="text-white font-heading text-xl mt-8">5. Fees & Commission</h2>
          <p>NcSound retains 20% of gross sync licensing fees derived from placements we personally secure. No commission is taken on placements you secure independently or on pre-existing revenue streams.</p>

          <h2 className="text-white font-heading text-xl mt-8">6. Beat Store Purchases</h2>
          <p>Beat licenses are granted non-exclusively unless explicitly purchased as exclusive rights. License terms are specified at the point of purchase. All sales are final unless the product is defective.</p>

          <h2 className="text-white font-heading text-xl mt-8">7. Limitation of Liability</h2>
          <p>NcSound is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the fees you paid us in the 12 months preceding the claim.</p>

          <h2 className="text-white font-heading text-xl mt-8">8. Termination</h2>
          <p>Either party may terminate the non-exclusive administration agreement with 30 days written notice. Upon termination, your catalog data will be exported and delivered within 14 days.</p>

          <h2 className="text-white font-heading text-xl mt-8">9. Governing Law</h2>
          <p>These terms are governed by the laws of the State of North Carolina. Any disputes shall be resolved in Wake County, North Carolina.</p>
        </div>
      </div>
    </div>
  );
}
