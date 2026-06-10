import React, { useState, useEffect } from 'react';
import { Save, ChevronLeft, CheckCircle2, Link2, Plus, Trash2, Globe, Music, Youtube, Camera, Headphones, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const PLATFORMS = [
  { value: 'spotify', label: 'Spotify', icon: Music },
  { value: 'apple-music', label: 'Apple Music', icon: Music },
  { value: 'soundcloud', label: 'SoundCloud', icon: Headphones },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'instagram', label: 'Instagram', icon: Camera },
  { value: 'twitter', label: 'Twitter / X', icon: MessageCircle },
  { value: 'tiktok', label: 'TikTok', icon: MessageCircle },
  { value: 'bandcamp', label: 'Bandcamp', icon: Headphones },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'other', label: 'Other', icon: Link2 },
];

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [form, setForm] = useState({
    stage_name: '',
    legal_name: '',
    bio: '',
    photo_url: '',
    pro_affiliation: '',
    ipi_number: '',
    payment_method: '',
  });

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) return;
      const { data: a } = await supabase.from('artists').select('*').eq('user_id', user?.id).single();
      if (ignore) return;
      const artist = a as unknown as { id: string; stage_name: string; legal_name: string; bio: string; photo_url: string; pro_affiliation: string; ipi_number: string; payment_method: string } | null;
      if (artist) {
        setArtistId(artist.id);
        setForm(f => ({ ...f, stage_name: artist.stage_name || '', legal_name: artist.legal_name || '', bio: artist.bio || '', photo_url: artist.photo_url || '', pro_affiliation: artist.pro_affiliation || '', ipi_number: artist.ipi_number || '', payment_method: artist.payment_method || '' }));
        const { data: linkData } = await supabase.from('artist_links').select('*').eq('artist_id', artist.id).order('sort_order');
        if (!ignore && linkData) setLinks(linkData);
      }
    };
    load();
    return () => { ignore = true; };
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!artistId) return;
    setLoading(true);
    const { error } = await (supabase.from('artists') as any).update({
      stage_name: form.stage_name || null,
      legal_name: form.legal_name || null,
      bio: form.bio || null,
      photo_url: form.photo_url || null,
      pro_affiliation: form.pro_affiliation || null,
      ipi_number: form.ipi_number || null,
      payment_method: form.payment_method || null,
    }).eq('id', artistId);
    if (error) toast.error('Failed to save');
    else toast.success('Profile saved');
    setLoading(false);
  };

  const addLink = async () => {
    if (!artistId) return;
    const { data } = await (supabase.from('artist_links') as any).insert({
      artist_id: artistId,
      platform: 'website',
      url: '',
      sort_order: links.length,
    }).select();
    if (data) setLinks(prev => [...prev, data[0]]);
  };

  const updateLink = async (id: string, field: string, value: string) => {
    await (supabase.from('artist_links') as any).update({ [field]: value }).eq('id', id);
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLink = async (id: string) => {
    await (supabase.from('artist_links') as any).delete().eq('id', id);
    setLinks(prev => prev.filter(l => l.id !== id));
    toast.success('Link removed');
  };

  const platformIcon = (platform: string) => {
    const p = PLATFORMS.find(p => p.value === platform);
    if (p) return <p.icon className="w-4 h-4 text-orange-500" />;
    return <Link2 className="w-4 h-4 text-orange-500" />;
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link to="/artist/dashboard" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-orange-500 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <h1 className="text-4xl font-heading font-bold uppercase tracking-wider text-white mb-2">Artist <span className="text-orange-500">Profile</span></h1>
      <p className="text-neutral-400 font-sans text-sm mb-10">Manage your public profile, bio, and connected platforms. This info powers your roster page on NcSound.</p>

      <div className="space-y-8">
        {/* About You */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
          <h2 className="text-lg font-heading uppercase tracking-wider text-white border-b border-neutral-800 pb-2">About You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Stage Name</label>
              <input name="stage_name" value={form.stage_name} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Legal Name</label>
              <input name="legal_name" value={form.legal_name} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans resize-none" placeholder="Tell supervisors about your sound, style, and background..." />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Photo URL</label>
            <input name="photo_url" value={form.photo_url} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" placeholder="https://..." />
          </div>
        </div>

        {/* Publishing Info */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
          <h2 className="text-lg font-heading uppercase tracking-wider text-white border-b border-neutral-800 pb-2">Publishing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">PRO Affiliation</label>
              <select name="pro_affiliation" value={form.pro_affiliation} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans">
                <option value="">Select...</option>
                <option>ASCAP</option>
                <option>BMI</option>
                <option>SESAC</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">IPI Number</label>
              <input name="ipi_number" value={form.ipi_number} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Payment Method</label>
            <input name="payment_method" value={form.payment_method} onChange={handleChange} placeholder="PayPal, Stripe, etc." className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:border-orange-500 outline-none font-sans" />
          </div>
        </div>

        {/* Connected Links */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h2 className="text-lg font-heading uppercase tracking-wider text-white">Connected Platforms</h2>
            <button onClick={addLink} className="flex items-center text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">
              <Plus className="w-4 h-4 mr-1" /> Add Link
            </button>
          </div>
          <p className="text-xs text-neutral-500 font-sans -mt-4">Add links to your Spotify, YouTube, Instagram, Bandcamp, and more. They'll appear on your public roster page.</p>

          {links.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 font-sans text-sm border border-dashed border-neutral-800">
              <Link2 className="w-8 h-8 mx-auto mb-2 text-neutral-700" />
              <p>No links added yet. Click "Add Link" to connect your platforms.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map(link => (
                <div key={link.id} className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 p-3">
                  {platformIcon(link.platform)}
                  <select value={link.platform} onChange={e => updateLink(link.id, 'platform', e.target.value)} className="bg-neutral-900 border border-neutral-700 text-white text-xs px-2 py-1.5 outline-none focus:border-orange-500">
                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <input value={link.url} onChange={e => updateLink(link.id, 'url', e.target.value)} placeholder="https://..." className="flex-1 bg-transparent border-b border-neutral-700 text-white text-sm px-2 py-1 outline-none focus:border-orange-500 font-sans" />
                  <button onClick={() => removeLink(link.id)} className="text-neutral-600 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button onClick={handleSave} disabled={loading} className="flex items-center bg-orange-500 text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
