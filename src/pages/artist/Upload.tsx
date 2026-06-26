import React, { useState } from 'react';
import { Upload as UploadIcon, CheckCircle2, AlertCircle, FileAudio, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Upload() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    isrc: '',
    genre: '',
    bpm: '',
    mood: '',
    masterOwnership: false,
    publishingOwnership: false,
    sampleClearance: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!user) return toast.error('You must be logged in to submit a track');
    if (loading) return;
    
    if (!formData.title || !formData.masterOwnership || !formData.publishingOwnership || !formData.sampleClearance) {
        return toast.error('Complete all fields and confirm rights declarations.');
    }

    setLoading(true);
    try {
        const { data: artistRow, error: artistError } = await supabase
          .from('artists')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (artistError) {
          console.error("Error fetching artist profile:", artistError);
          throw new Error('Artist profile not found or database error. Please contact support.');
        }

        const artist = artistRow as { id: string };

        const trackPayload: Record<string, any> = {
            artist_id: artist.id,
            title: formData.title,
            genre: formData.genre || null,
            bpm: parseInt(formData.bpm) || null,
            owns_master: formData.masterOwnership,
            owns_publishing: formData.publishingOwnership,
            status: 'metadata_review',
            visibility: 'supervisors_only'
        };
        const { data: track, error: trackError } = await (supabase.from('tracks') as any).insert(trackPayload).select('id').single();
        
        if (trackError) {
          console.error("Error inserting track:", trackError);
          throw trackError;
        }
        
        // Auto-analyze: classify mood/genre via Gemini from the track metadata
        try {
          const trackId = (track as any)?.id;
          if (!trackId) throw new Error('No track ID returned');
          const bpmVal = parseInt(formData.bpm) || null;
          await fetch('/api/analyze/metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trackId,
              title: formData.title,
              bpm: bpmVal,
              energy: null,
              instrumentation: null,
            }),
          });
        } catch { /* non-blocking */ }
        
        navigate('/artist/dashboard');
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="py-24 sm:py-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/artist/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="mb-10 border-b border-neutral-800 pb-8">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-wider text-white">Track <span className="text-orange-500">Ingestion</span></h1>
        <p className="mt-2 text-neutral-400 font-sans">Submit new material to your NcSound catalog. High quality WAVs required.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative z-10">
          {[1, 2, 3].map((num) => (
             <div key={num} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 flex items-center justify-center font-heading font-bold text-lg border-2 transition-colors bg-neutral-950 ${step >= num ? 'border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-neutral-800 text-neutral-600'}`}>
                  {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                </div>
             </div>
          ))}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-neutral-800 -z-10">
            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          <span className={step >= 1 ? 'text-orange-500' : ''}>Audio Files</span>
          <span className={step >= 2 ? 'text-orange-500' : ''}>Metadata</span>
          <span className={step >= 3 ? 'text-orange-500' : ''}>Rights & Submit</span>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-8 sm:p-12 shadow-2xl">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-heading uppercase tracking-wider text-white">Audio Assets</h2>
            
            <div className="border-2 border-dashed border-neutral-700 hover:border-orange-500 bg-neutral-950 p-12 text-center transition-colors cursor-pointer group">
               <UploadIcon className="mx-auto h-12 w-12 text-neutral-600 group-hover:text-orange-500 transition-colors mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest text-white mb-2">Drag & Drop Main Master (WAV)</p>
               <p className="text-xs text-neutral-500 font-sans">24-bit / 48kHz preferred. Max 100MB.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-neutral-950 border border-neutral-800 p-6 flex items-center justify-between group cursor-pointer hover:border-neutral-600">
                 <div className="flex items-center gap-4">
                   <FileAudio className="w-6 h-6 text-neutral-600 group-hover:text-white" />
                   <div>
                     <p className="text-xs font-bold uppercase tracking-widest text-white">Instrumental</p>
                     <p className="text-xs text-neutral-500 font-sans mt-1">Optional, but highly recommended</p>
                   </div>
                 </div>
                 <UploadIcon className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="bg-neutral-950 border border-neutral-800 p-6 flex items-center justify-between group cursor-pointer hover:border-neutral-600">
                 <div className="flex items-center gap-4">
                   <FileAudio className="w-6 h-6 text-neutral-600 group-hover:text-white" />
                   <div>
                     <p className="text-xs font-bold uppercase tracking-widest text-white">Clean Edit</p>
                     <p className="text-xs text-neutral-500 font-sans mt-1">Optional</p>
                   </div>
                 </div>
                 <UploadIcon className="w-4 h-4 text-neutral-600" />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button type="button" onClick={() => setStep(2)} className="bg-orange-500 text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-heading uppercase tracking-wider text-white">Core Metadata</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Track Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-sans" placeholder="e.g. STREET ANTHEM" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">ISRC Code</label>
                <input type="text" name="isrc" value={formData.isrc} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-mono text-sm" placeholder="US-..." />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Genre</label>
                <select name="genre" value={formData.genre} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-sans">
                  <option value="">Select...</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Boom Bap">Boom Bap</option>
                  <option value="Trap">Trap</option>
                  <option value="R&B">R&B</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">BPM</label>
                <input type="number" name="bpm" value={formData.bpm} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-mono text-sm" placeholder="e.g. 95" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Primary Mood</label>
                <select name="mood" value={formData.mood} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-sans">
                  <option value="">Select...</option>
                  <option value="Tense">Tense</option>
                  <option value="Triumphant">Triumphant</option>
                  <option value="Dark">Dark</option>
                  <option value="Energetic">Energetic</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-neutral-800">
              <button type="button" onClick={() => setStep(1)} className="text-neutral-400 hover:text-white px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="bg-orange-500 text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-heading uppercase tracking-wider text-white">Rights Declarations</h2>
            
            <div className="bg-black/50 border border-orange-500/30 p-6 flex gap-4 items-start">
               <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
               <div>
                 <h4 className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-2">Legal Accuracy Warning</h4>
                 <p className="text-sm font-sans text-neutral-400">By submitting this track, you are legally declaring that the metadata and splits provided are 100% accurate. False claims or uncleared samples will result in immediate deal termination.</p>
               </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-4 p-4 border border-neutral-800 bg-neutral-950 cursor-pointer hover:border-neutral-600 transition-colors">
                 <input type="checkbox" name="masterOwnership" checked={formData.masterOwnership} onChange={handleChange} className="mt-1 bg-neutral-900 border-neutral-700 text-orange-500 rounded-none focus:ring-orange-500" />
                 <div>
                   <span className="block text-sm font-bold uppercase tracking-widest text-white mb-1">Master Ownership Confirmation</span>
                   <span className="block text-xs font-sans text-neutral-400">I confirm I own or control 100% of the Sound Recording (Master) for this track.</span>
                 </div>
              </label>
              <label className="flex items-start gap-4 p-4 border border-neutral-800 bg-neutral-950 cursor-pointer hover:border-neutral-600 transition-colors">
                 <input type="checkbox" name="publishingOwnership" checked={formData.publishingOwnership} onChange={handleChange} className="mt-1 bg-neutral-900 border-neutral-700 text-orange-500 rounded-none focus:ring-orange-500" />
                 <div>
                   <span className="block text-sm font-bold uppercase tracking-widest text-white mb-1">Publishing Confirmation</span>
                   <span className="block text-xs font-sans text-neutral-400">I confirm I own or control 100% of the underlying Composition (Publishing) for this track.</span>
                 </div>
              </label>
              <label className="flex items-start gap-4 p-4 border border-neutral-800 bg-neutral-950 cursor-pointer hover:border-neutral-600 transition-colors">
                 <input type="checkbox" name="sampleClearance" checked={formData.sampleClearance} onChange={handleChange} className="mt-1 bg-neutral-900 border-neutral-700 text-orange-500 rounded-none focus:ring-orange-500" />
                 <div>
                   <span className="block text-sm font-bold uppercase tracking-widest text-white mb-1">Sample Clearance</span>
                   <span className="block text-xs font-sans text-neutral-400">I confirm this track contains ZERO uncleared samples. All splices/loops used are royalty-free.</span>
                 </div>
              </label>
            </div>

            <div className="flex justify-between pt-6 border-t border-neutral-800">
              <button type="button" onClick={() => setStep(2)} className="text-neutral-400 hover:text-white px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading} onClick={handleSubmit} className="bg-orange-500 text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Track'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
