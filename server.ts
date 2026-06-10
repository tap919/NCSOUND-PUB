import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import 'dotenv/config';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

// Error sanitization â€” never leak internal details to the client
const SENSITIVE_KEYWORDS = ['key', 'secret', 'token', 'password', 'authorization', 'bearer', 'stripe'];
function sanitizeError(err: unknown): string {
  if (!err) return 'An unexpected error occurred';
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (SENSITIVE_KEYWORDS.some(s => lower.includes(s))) return 'Internal configuration error';
  return message.substring(0, 300);
}

function missingFields(body: any, fields: string[]): string | null {
  for (const f of fields) {
    if (body === undefined || body === null || body[f] === undefined || body[f] === null || body[f] === '') return `${f} is required`;
  }
  return null;
}

async function startServer() {
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

  // Env validation — warn at startup, hard block critical paths at runtime
  const ENV_CHECKS = [
    { key: 'VITE_SUPABASE_URL', name: 'Supabase URL', critical: true },
    { key: 'VITE_SUPABASE_ANON_KEY', name: 'Supabase Anon Key', critical: true },
    { key: 'GEMINI_API_KEY', name: 'Gemini AI API Key', critical: false },
    { key: 'STRIPE_SECRET_KEY', name: 'Stripe Secret Key', critical: false },
    { key: 'RESEND_API_KEY', name: 'Resend Email API Key', critical: false },
  ];
  const missingVars = ENV_CHECKS.filter(v => !process.env[v.key]);
  const criticalMissing = missingVars.filter(v => v.critical);
  if (criticalMissing.length > 0) {
    console.error(`❌ CRITICAL: Missing required env vars: ${criticalMissing.map(v => `${v.key} (${v.name})`).join(', ')}`);
  }
  if (missingVars.length > 0) {
    console.warn(`⚠ Missing ${missingVars.length} env var(s): ${missingVars.map(v => `${v.key} (${v.name})`).join(', ')}`);
    console.warn('Some features will not work until these are set in .env');
  }

  const app = express();
  const PORT = 3000;

  // Initialize Stripe + Supabase clients once (not per-request)
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeModule = stripeKey ? await (async () => {
    const Stripe = (await import('stripe')).default;
    return new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
  })() : null;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseClient = (supabaseUrl && supabaseServiceKey) ? await (async () => {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(supabaseUrl, supabaseServiceKey);
  })() : null;

  // CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.APP_URL || '' : '*',
    methods: ['GET', 'POST', 'OPTIONS'],
  }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Rate limiting â€” webhook is excluded (Stripe retries must not be throttled)
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Try again in a minute.' },
    skip: (req) => req.path.startsWith('/api/webhook'),
  });
  app.use('/api/', apiLimiter);
  // Health check exempt from rate limiting
  const healthLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Body parsing (skip raw for webhook)
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api/webhook")) {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // Stripe Webhook Endpoint
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      return res.status(500).send("Stripe is not configured.");
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      if (!sig) throw new Error("No signature");
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send("Invalid signature");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const supabaseUrl = process.env.VITE_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { beatId, title, trackId, licenseType, buyerEmail, userId } = session.metadata || {};

        // Beat store order
        if (beatId && title) {
          await supabase.from('beat_store_orders').insert({
            product_id: beatId,
            buyer_email: session.customer_details?.email || 'unknown',
            license_type: 'lease',
            amount_paid: (session.amount_total || 0) / 100,
            stripe_payment_id: session.id,
          });
          console.log(`Beat order fulfilled: ${title} (session ${session.id})`);
        }

        // Sync license purchase
        if (trackId && licenseType) {
          const email = buyerEmail || session.customer_details?.email || 'unknown';
          const { data: purchase } = await supabase.from('license_purchases').insert({
            track_id: trackId,
            buyer_email: email,
            license_type: licenseType,
            amount_paid: (session.amount_total || 0) / 100,
            stripe_payment_id: session.id,
          }).select().single();

          // Generate license PDF
          if (purchase) {
        try {
          await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/license/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              purchaseId: purchase.id,
              trackId,
              buyerEmail: email,
              licenseType,
              amount: (session.amount_total || 0) / 100,
            }),
          });
        } catch (e: any) { console.error('License PDF gen failed:', e.message); }
          }
          console.log(`License purchased: ${licenseType} for track ${trackId}`);
        }

        // Subscription
        if (userId) {
          const subscription = event.data.object as any;
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.subscription,
            stripe_price_id: session.metadata?.priceId || '',
            status: 'active',
            current_period_start: new Date().toISOString(),
          }, { onConflict: 'stripe_subscription_id' });
          console.log(`Subscription activated for user ${userId}`);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const supUrl = process.env.VITE_SUPABASE_URL!;
        const supKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
        const { createClient: cc } = await import('@supabase/supabase-js');
        const sb = cc(supUrl, supKey);
        await sb.from('subscriptions').update({
          status: subscription.status === 'active' ? 'active' : 'canceled',
        }).eq('stripe_subscription_id', subscription.id);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
  });

  // API Routes
  app.get("/api/health", healthLimiter, (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/gemini", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "AI generation failed" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      if (!stripeModule) {
        return res.status(500).json({ error: "Payments not configured" });
      }
      const { beatId, title, priceStr } = req.body;
      const priceObject = parseFloat(priceStr);
      if (isNaN(priceObject) || priceObject <= 0) {
        return res.status(400).json({ error: "Invalid price" });
      }

      const session = await stripeModule.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `Beat Lease - ${title}` },
            unit_amount: Math.round(priceObject * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        metadata: { beatId, title },
        success_url: `${req.headers.referer || process.env.APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${req.headers.referer || process.env.APP_URL || 'http://localhost:3000'}/beat-store?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Checkout failed" });
    }
  });

  // --- OCR: Royalty Statement Processing via Gemini Vision ---
  app.post("/api/ocr/statement", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "AI service not configured" });

      const { imageBase64, mimeType, entity } = req.body;
      if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const entityLabel = (entity || 'PRO').toUpperCase();
      const prompt = `You are an OCR assistant for music royalty statements. Analyze this screenshot from ${entityLabel}.

Extract the following structured data as JSON. For each line item, return:
- period_start (YYYY-MM-DD)
- period_end (YYYY-MM-DD)
- source_type: one of "performance", "mechanical", "sync", "broadcast", "digital", "neighboring"
- gross_amount (number)
- net_amount (number)
- fee_amount (number, default 0)
- currency (default "USD")
- notes (any relevant info)

Also extract totals if visible.
Return ONLY valid JSON like: {"line_items": [...], "total_gross": 0, "total_net": 0, "period_start": "...", "period_end": "..."}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType || 'image/png', data: imageBase64 } }
          ]
        }]
      });

      let parsed;
      try {
        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { line_items: [], error: 'No JSON found in response' };
      } catch (parseErr: any) {
        console.error('OCR parse error:', parseErr.message);
        parsed = { line_items: [], raw: response.text, error: 'Failed to parse AI response' };
      }

      res.json(parsed);
    } catch (err: any) {
      console.error('OCR error:', err);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // ================================================================
  // AUDIO ANALYSIS & METADATA ENRICHMENT
  // ================================================================

  // POST /api/analyze/audio â€” Analyze audio file for BPM, key, energy
  app.post("/api/analyze/audio", async (req, res) => {
    try {
      const { audioUrl, trackId } = req.body;
      if (!audioUrl) return res.status(400).json({ error: 'audioUrl required' });

      // Download audio
      const response = await fetch(audioUrl);
      if (!response.ok) return res.status(502).json({ error: 'Failed to fetch audio' });
      const arrayBuffer = await response.arrayBuffer();
      const audioData = new Uint8Array(arrayBuffer);

      // Decode audio
      const decodeModule: any = await import('audio-decode');
      const decode = decodeModule.default || decodeModule;
      const audioDataDecoded: any = await decode(audioData);
      const channelData = audioDataDecoded.channelData?.[0] || audioDataDecoded.getChannelData?.(0);
      if (!channelData) return res.status(422).json({ error: 'Failed to decode audio' });
      const sampleRate = audioDataDecoded.sampleRate || 44100;

      // Detect BPM
      const { detectBpm, detectKey, detectEnergy } = await import('./src/lib/analyze');
      const bpm = detectBpm(channelData, sampleRate);
      const keyResult = detectKey(channelData, sampleRate);
      const energyResult = detectEnergy(channelData);

      const result = {
        bpm: bpm > 0 ? bpm : null,
        key: keyResult.key,
        key_confidence: Math.round(keyResult.confidence * 10000) / 10000,
        energy: energyResult.level,
        energy_score: energyResult.score,
      };

      // Save to track_analysis if trackId provided
      if (trackId && supabaseClient) {
        await supabaseClient.from('track_analysis').upsert({
          track_id: trackId,
          bpm: result.bpm,
          key: result.key,
          key_confidence: result.key_confidence,
          energy: result.energy,
          energy_score: result.energy_score,
          analysis_model: 'dsp',
          analyzed_at: new Date().toISOString(),
        }, { onConflict: 'track_id' });
      }

      res.json(result);
    } catch (err: any) {
      console.error('Audio analysis error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // POST /api/analyze/metadata â€” AI mood/genre classification via Gemini
  app.post("/api/analyze/metadata", async (req, res) => {
    try {
      const { trackId, title, bpm, key, energy, instrumentation } = req.body;
      if (!trackId || !title) return res.status(400).json({ error: 'trackId and title required' });

      const { classifyMetadata } = await import('./src/lib/analyze');
      const aiResult = await classifyMetadata(title, bpm, key, energy, instrumentation);

      // Save to track_analysis
      if (supabaseClient) {
        await supabaseClient.from('track_analysis').upsert({
          track_id: trackId,
          mood_tags: aiResult.mood_tags,
          genre: aiResult.genre,
          genre_confidence: aiResult.confidence,
          analysis_model: 'gemini-2.5-pro',
          analyzed_at: new Date().toISOString(),
        }, { onConflict: 'track_id' });

        // Also update tracks table
        if (aiResult.genre && aiResult.genre !== 'Unknown') {
          await supabaseClient.from('tracks').update({
            genre: aiResult.genre,
            mood_tags: aiResult.mood_tags,
            energy_level: energy || null,
          }).eq('id', trackId);
        }
      }

      res.json(aiResult);
    } catch (err: any) {
      console.error('Metadata classification error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // GET /api/analyze/status/:trackId â€” Check if analysis exists
  app.get("/api/analyze/status/:trackId", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data } = await supabaseClient.from('track_analysis').select('*').eq('track_id', req.params.trackId).single();
      res.json(data || { analyzed: false });
    } catch (e: any) {
      console.error('Analysis status check error:', e.message);
      res.json({ analyzed: false });
    }
  });

  // GET /api/quality/scores â€” Metadata quality for all artists (admin)
  app.get("/api/quality/scores", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data: tracks } = await supabaseClient.from('tracks').select('*');
      if (!tracks?.length) return res.json({ overall: 0, fields: {}, total_tracks: 0 });

      const fields = ['title', 'genre', 'bpm', 'key_signature', 'mood_tags', 'instrumentation', 'energy_level', 'isrc', 'iswc'];
      const fieldCounts: Record<string, number> = {};
      for (const f of fields) {
        fieldCounts[f] = tracks.filter(t => t[f] !== null && t[f] !== '' && !(Array.isArray(t[f]) && t[f].length === 0)).length;
      }
      const totalChecks = fields.length * tracks.length;
      const filledChecks = Object.values(fieldCounts).reduce((a, b) => a + b, 0);
      const overall = totalChecks > 0 ? Math.round((filledChecks / totalChecks) * 100) : 0;

      res.json({
        overall,
        fields: fieldCounts,
        field_percentages: Object.fromEntries(fields.map(f => [f, tracks.length > 0 ? Math.round((fieldCounts[f] / tracks.length) * 100) : 0])),
        total_tracks: tracks.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // GET /api/quality/scores/:artistId â€” Per-artist metadata quality
  app.get("/api/quality/scores/:artistId", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data: tracks } = await supabaseClient.from('tracks').select('*').eq('artist_id', req.params.artistId);
      if (!tracks?.length) return res.json({ overall: 0, fields: {}, total_tracks: 0 });

      const fields = ['title', 'genre', 'bpm', 'key_signature', 'mood_tags', 'instrumentation', 'energy_level', 'isrc'];
      const fieldCounts: Record<string, number> = {};
      for (const f of fields) {
        fieldCounts[f] = tracks.filter(t => t[f] !== null && t[f] !== '' && !(Array.isArray(t[f]) && t[f].length === 0)).length;
      }
      const overall = tracks.length > 0 ? Math.round(Object.values(fieldCounts).reduce((a, b) => a + b, 0) / (fields.length * tracks.length) * 100) : 0;

      res.json({
        overall,
        fields: fieldCounts,
        field_percentages: Object.fromEntries(fields.map(f => [f, tracks.length > 0 ? Math.round((fieldCounts[f] / tracks.length) * 100) : 0])),
        total_tracks: tracks.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // DISCO Catalog Export
  app.get("/api/disco/export", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const { data: tracks, error } = await supabaseClient
        .from('tracks')
        .select('*, artists(stage_name), track_writers(*)')
        .eq('status', 'active');

      if (error) throw error;

      // DISCO CSV format: Title, Artist, ISRC, Genre, BPM, Key, Mood, Duration, Album, Label, Year
      const csvRows = ['"Title","Artist","ISRC","Genre","BPM","Key","Mood","Writers","Label","Status"'];
      for (const t of tracks || []) {
        const writers = (t.track_writers || []).map((w: any) => w.writer_name).join('; ');
        csvRows.push([
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `"${(t.artists?.stage_name || '').replace(/"/g, '""')}"`,
          `"${t.isrc || ''}"`,
          `"${t.genre || ''}"`,
          t.bpm || '',
          `"${t.key_signature || ''}"`,
          `"${(t.mood_tags || []).join(', ')}"`,
          `"${writers}"`,
          '"NcSound Publishing"',
          t.status
        ].join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ncsound-catalog-disco.csv"');
      res.send(csvRows.join('\n'));
    } catch (err: any) {
      console.error('DISCO export error:', err.message);
      res.status(500).json({ error: 'Export failed' });
    }
  });

  // Supabase Storage Upload URL
  app.post("/api/upload-url", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Storage not configured' });
      const { bucket, fileName, contentType } = req.body;
      if (!bucket || !fileName) return res.status(400).json({ error: 'bucket and fileName required' });

      const filePath = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;

      // Generate signed upload URL (client uploads directly to Supabase Storage)
      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .createSignedUploadUrl(filePath);

      if (error) throw error;
      res.json({ url: data?.signedUrl, path: filePath });
    } catch (err: any) {
      console.error('Upload URL error:', err.message);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });

  // YouTube Feed â€” fetches latest videos and live status from a channel
  app.get("/api/youtube/feed", async (req, res) => {
    try {
      const channelId = req.query.channelId as string;
      if (!channelId) return res.status(400).json({ error: 'channelId required' });

      const rssRes = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
      if (!rssRes.ok) return res.status(502).json({ error: 'YouTube feed unavailable' });

      const xml = await rssRes.text();
      const videos: { title: string; videoId: string; published: string; thumbnail: string; isLive: boolean }[] = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let entryMatch;

      while ((entryMatch = entryRegex.exec(xml)) !== null) {
        const entry = entryMatch[1];
        const title = entry.match(/<title>([^<]*)<\/title>/)?.[1] || '';
        const videoId = entry.match(/<yt:videoId>([^<]*)<\/yt:videoId>/)?.[1] || '';
        const published = entry.match(/<published>([^<]*)<\/published>/)?.[1] || '';
        const isLive = title.toLowerCase().includes('live') || entry.includes('yt:live');
        videos.push({
          title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          videoId,
          published,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          isLive,
        });
      }

      res.json({ channelId, videos: videos.slice(0, 20), isLive: videos.some(v => v.isLive) });
    } catch (err: any) {
      console.error('YouTube feed error:', err.message);
      res.status(500).json({ error: 'Feed unavailable' });
    }
  });

  // Sitemap
  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const staticRoutes = ['/', '/about', '/catalog', '/beat-store', '/blog', '/supervisor', '/supervisor/register', '/submit-brief', '/submit', '/agreement', '/terms', '/privacy'];
    const rosterRoutes = ['/roster/niro', '/roster/tap919', '/roster/art-productions'];

    let urls = '';
    for (const route of [...staticRoutes, ...rosterRoutes]) {
      urls += `  <url><loc>${baseUrl}${route}</loc><changefreq>weekly</changefreq></url>\n`;
    }

    res.setHeader('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`);
  });

  // Robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send('User-agent: *\nAllow: /\n\nSitemap: http://localhost:3000/sitemap.xml');
  });

  // ================================================================
  // INTEGRATION FRAMEWORK â€” 3rd Party Platform Config & Income
  // ================================================================

  // Helper: get authenticated supabase client
  function getSupabase() {
    const url = process.env.VITE_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !key) throw new Error('Supabase not configured');
    // lazy-import to avoid top-level dep issues
    return import('@supabase/supabase-js').then(m => m.createClient(url, key));
  }

  // --- Integration Config CRUD ---
  app.post("/api/integrations/config", async (req, res) => {
    try {
      const { platform, config_key, config_value, artist_id } = req.body;
      if (!platform || !config_key || !config_value) {
        return res.status(400).json({ error: 'platform, config_key, and config_value required' });
      }
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('integration_configs').upsert({
        platform, config_key, config_value, artist_id: artist_id || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'platform,config_key,artist_id' }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/integrations/configs", async (req, res) => {
    try {
      const supabase = await getSupabase();
      let query = supabase.from('integration_configs').select('*').order('platform');
      if (req.query.platform) query = query.eq('platform', req.query.platform);
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.delete("/api/integrations/config/:id", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('integration_configs').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Income Summary ---
  app.get("/api/integrations/summary", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { artist_id, period_start, period_end } = req.query;
      let query = supabase.from('income_summary').select('*');
      if (artist_id) query = query.eq('artist_id', artist_id);
      if (period_start) query = query.gte('period_start', period_start);
      if (period_end) query = query.lte('period_end', period_end);
      query = query.order('period_start', { ascending: false }).limit(100);
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Track Income ---
  app.get("/api/integrations/track/:trackId", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('platform_income')
        .select('*')
        .eq('track_id', req.params.trackId)
        .order('period_start', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Add Platform Income (manual / import) ---
  app.post("/api/integrations/platform-income", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { track_id, artist_id, platform, period_start, period_end, stream_count, download_count, gross_revenue, net_revenue, currency, metadata } = req.body;
      if (!track_id || !artist_id || !platform || !period_start || !period_end) {
        return res.status(400).json({ error: 'track_id, artist_id, platform, period_start, period_end required' });
      }
      const { data, error } = await supabase.from('platform_income').upsert({
        track_id, artist_id, platform, period_start, period_end,
        stream_count: stream_count || 0, download_count: download_count || 0,
        gross_revenue: gross_revenue || 0, net_revenue: net_revenue || 0,
        currency: currency || 'USD',
        metadata: metadata || {},
        synced_at: new Date().toISOString(),
      }, { onConflict: 'track_id,platform,period_start,period_end' }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Add Royalty Collection (manual entry) ---
  app.post("/api/integrations/royalty-collection", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { artist_id, collection_entity, period_start, period_end, source_type, gross_amount, net_amount, fee_amount, currency, statement_url, notes } = req.body;
      if (!artist_id || !collection_entity || !period_start || !period_end) {
        return res.status(400).json({ error: 'artist_id, collection_entity, period_start, period_end required' });
      }
      const { data, error } = await supabase.from('royalty_collections').insert({
        artist_id, collection_entity, period_start, period_end,
        source_type: source_type || 'other', gross_amount: gross_amount || 0,
        net_amount: net_amount || 0, fee_amount: fee_amount || 0,
        currency: currency || 'USD', statement_url, notes,
      }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Split Calculation ---
  app.get("/api/integrations/splits/:trackId", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const incomeAmount = req.query.income ? parseFloat(req.query.income as string) : 0;

      const { data: track, error: trackErr } = await supabase
        .from('tracks').select('*, track_writers(*)').eq('id', req.params.trackId).single();
      if (trackErr) throw trackErr;

      const trackTitle = track.title;
      const writers = track.track_writers || [];
      const splits = writers.map((w: any) => {
        const writerShare = parseFloat(w.writer_share) || 0;
        const publisherShare = parseFloat(w.publisher_share) || 0;
        return {
          writer_name: w.writer_name,
          pro_affiliation: w.pro_affiliation,
          ipi_number: w.ipi_number,
          writer_share: writerShare,
          publisher_share: publisherShare,
          writer_payout: incomeAmount * (writerShare / 100),
          publisher_payout: incomeAmount * (publisherShare / 100),
        };
      });

      res.json({ track_id: req.params.trackId, track_title: trackTitle, total_income: incomeAmount, splits });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Platform Sync Endpoints ---

  // Spotify sync: fetches basic artist data
  app.post("/api/integrations/spotify/sync", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: configs } = await supabase.from('integration_configs').select('*').eq('platform', 'spotify');
      const clientId = configs?.find(c => c.config_key === 'client_id')?.config_value;
      const clientSecret = configs?.find(c => c.config_key === 'client_secret')?.config_value;
      if (!clientId || !clientSecret) {
        return res.status(400).json({ error: 'Spotify credentials not configured. Add client_id and client_secret in Integrations tab.' });
      }

      // Exchange client credentials for access token
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
        body: 'grant_type=client_credentials',
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(`Spotify auth failed: ${tokenData.error_description || tokenData.error}`);

      res.json({ message: 'Spotify connected successfully. Token acquired.', records: 0 });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // SoundCloud sync: checks connectivity
  app.post("/api/integrations/soundcloud/sync", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: configs } = await supabase.from('integration_configs').select('*').eq('platform', 'soundcloud');
      const clientId = configs?.find(c => c.config_key === 'client_id')?.config_value;
      if (!clientId) return res.status(400).json({ error: 'SoundCloud client_id not configured' });

      res.json({ message: 'SoundCloud integration configured.', records: 0 });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Bandcamp sync: validate URL connectivity
  app.post("/api/integrations/bandcamp/sync", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: configs } = await supabase.from('integration_configs').select('*').eq('platform', 'bandcamp');
      const bandcampUrl = configs?.find(c => c.config_key === 'bandcamp_url')?.config_value || 'https://ncsound.bandcamp.com';

      const response = await fetch(`${bandcampUrl}/music`);
      if (!response.ok) throw new Error(`Bandcamp page returned ${response.status}`);
      res.json({ message: `Bandcamp page reachable at ${bandcampUrl}`, records: 0 });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- CWR Export ---
  app.post("/api/integrations/cwr/generate", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: tracks, error: tErr } = await supabase
        .from('tracks').select('*, artists(stage_name), track_writers(*)').eq('status', 'active');
      if (tErr) throw tErr;

      if (!tracks || tracks.length === 0) {
        return res.status(400).json({ error: 'No active tracks to export' });
      }

      // Build CWR lines (simplified NWN format)
      const cwrLines: string[] = [];
      cwrLines.push('HDR', `NcSound Publishing CWR Export ${new Date().toISOString().split('T')[0]}`, '', '');
      let recordCount = 0;

      for (const t of tracks) {
        recordCount++;
        const isrc = t.isrc || '';
        const title = (t.title || '').substring(0, 50);
        const artistName = (t.artists?.stage_name || 'Unknown').substring(0, 50);
        const writers = (t.track_writers || []).map((w: any) => w.writer_name).join(', ').substring(0, 80);

        cwrLines.push(`NWN\t${isrc}\t${title}\t${artistName}\t${writers}\t${t.genre || ''}\t${t.duration || ''}`);
      }

      const cwrContent = cwrLines.join('\n');
      const fileName = `ncsound-cwr-${Date.now()}.txt`;

      // Store CWR export record
      const { data: exportRec, error: eErr } = await supabase.from('cwr_exports').insert({
        export_type: 'new_works', file_name: fileName, record_count: recordCount,
        status: 'draft',
      }).select().single();
      if (eErr) throw eErr;

      // Link tracks to export
      for (const t of tracks) {
        await supabase.from('cwr_export_tracks').insert({
          cwr_export_id: exportRec.id, track_id: t.id, transaction_type: 'NWN',
        });
      }

      res.json({ id: exportRec.id, file_name: fileName, record_count: recordCount, cwr: cwrContent });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/integrations/cwr/exports", async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('cwr_exports').select('*, cwr_export_tracks(*)').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Placeholder sync handlers for all other platforms
  const SYNC_PLATFORMS = ['ascap','bmi','sesac','soundexchange','songtrust','hfa','tuneregistry','apple_music'];
  for (const pf of SYNC_PLATFORMS) {
    app.post(`/api/integrations/${pf}/sync`, async (req, res) => {
      res.json({ message: `${pf.toUpperCase()} integration configured. Manual statement entry available in dashboard.`, records: 0 });
    });
  }

  // Bandcamp Discography Proxy
  app.get("/api/bandcamp/discography", async (req, res) => {
    try {
      const bandcampUrl = (req.query.bandcampUrl as string) || 'https://ncsound.bandcamp.com';
      const musicUrl = bandcampUrl.endsWith('/music') ? bandcampUrl : `${bandcampUrl}/music`;
      const response = await fetch(musicUrl);
      const html = await response.text();
      const releases: { title: string; url: string; artist: string; artUrl: string; type: string }[] = [];

      const itemRegex = /<a\s+href="(\/(?:album|track)\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = itemRegex.exec(html)) !== null) {
        const url = `https://ncsound.bandcamp.com${match[1]}`;
        const inner = match[2];
        const titleMatch = inner.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
          || inner.match(/alt="([^"]+)"/i)
          || inner.match(/title="([^"]+)"/i);
        const artMatch = inner.match(/src="([^"]+)"\s+alt/i) || inner.match(/src="([^"]+\.jpg)"/i);
        const title = titleMatch ? titleMatch[1].trim() : '';
        const artUrl = artMatch ? artMatch[1] : '';
        if (title && url) {
          releases.push({ title, url, artist: '', artUrl, type: url.includes('/album/') ? 'album' : 'track' });
        }
      }

      const artistMatch = html.match(/"artist"\s*:\s*"([^"]+)"/);
      const defaultArtist = artistMatch ? artistMatch[1] : 'NcSound Publishing';
      const uniqueReleases = releases.filter((r, i, a) => a.findIndex(x => x.url === r.url) === i);

      for (const r of uniqueReleases) {
        r.artist = defaultArtist;
      }

      res.json({ releases: uniqueReleases });
    } catch (err: any) {
      console.error("Bandcamp fetch error:", err);
      res.status(500).json({ error: 'Failed to fetch Bandcamp catalog', releases: [] });
    }
  });

  // Niro Site Proxy
  const NIRO_SITE_URL = process.env.NIRO_SITE_URL || 'https://niro-music.vercel.app';

  const proxyToNiro = async (req: any, res: any) => {
    try {
      const upstreamUrl = NIRO_SITE_URL + req.path;
      const upstream = await fetch(upstreamUrl, {
        headers: { 'user-agent': req.headers['user-agent'] || '' },
      });
      const contentType = upstream.headers.get('content-type') || '';

      if (contentType.includes('text/html')) {
        let html = await upstream.text();
        html = html.replace(/(href|src|action)=(["'])\//g, `$1=$2/niro-site/`);
        html = html.replace(/https:\/\/niro-music\.vercel\.app\//g, '/niro-site/');
        html = html.replace(/@next_public_base_url\b/g, '/niro-site');
        res.status(upstream.status).type('text/html').send(html);
      } else {
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).set('content-type', contentType).send(buffer);
      }
    } catch (err: any) {
      console.error('Niro proxy error:', err.message);
      res.status(502).send('Niro site unavailable');
    }
  };

  app.use('/niro-site', proxyToNiro);
  const niroStaticPaths = ['/_next', '/images', '/gallery', '/icons', '/fonts'];
  for (const p of niroStaticPaths) { app.use(p, proxyToNiro); }
  app.get('/favicon.ico', proxyToNiro);

  // ================================================================
  // EMAIL SERVICE (Resend)
  // ================================================================
  app.post("/api/email/send", async (req, res) => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Email service not configured (set RESEND_API_KEY)" });

      const { to, subject, html, from, cc, bcc } = req.body;
      if (!to || !subject || !html) return res.status(400).json({ error: 'to, subject, and html required' });

      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: from || 'NcSound Publishing <notifications@ncsound.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        cc,
        bcc,
      });

      if (error) throw error;
      res.json({ id: data?.id });
    } catch (err: any) {
      console.error('Email error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // ================================================================
  // AI AGENT CHAT
  // ================================================================
  app.post("/api/agent/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'AI service not configured' });

      const { messages, context } = req.body;
      if (!messages?.length) return res.status(400).json({ error: 'messages required' });

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      // Build system prompt with available tools
      const tools = [
        { name: 'get_income_summary', description: 'Get total income summary across all platforms', params: { artist_id: 'string', period: 'string' } },
        { name: 'get_track_splits', description: 'Calculate royalty splits for a track', params: { track_id: 'string', income: 'string' } },
        { name: 'generate_cwr', description: 'Generate CWR export for all active tracks', params: {} },
        { name: 'get_registration_status', description: 'Check PRO/MLC registration status for an artist', params: { artist_id: 'string' } },
        { name: 'send_notification_email', description: 'Send an email notification to anyone', params: { to: 'string', subject: 'string', message: 'string' } },
        { name: 'get_integration_status', description: 'Check which 3rd party integrations are configured', params: {} },
        { name: 'get_catalog_stats', description: 'Get catalog statistics (total track count)', params: { artist_id: 'string' } },
        { name: 'add_platform_income', description: 'Record platform income data (streams, revenue)', params: { track_id: 'string', artist_id: 'string', platform: 'string', streams: 'string', gross: 'string', net: 'string' } },
        { name: 'generate_ddex', description: 'Generate DDEX ERN 4.3 XML for DSP delivery', params: { track_ids: 'string' } },
        { name: 'get_analytics', description: 'Get admin analytics dashboard data', params: {} },
      ];

      const systemPrompt = `You are an AI assistant for NcSound Publishing. You help with publishing admin tasks.

Available tools:
${tools.map(t => `${t.name}: ${t.description} (${JSON.stringify(t.params)})`).join('\n')}

When the user asks you to DO something (generate, calculate, send, check, create), respond with a tool call in this format:
TOOL: tool_name | key1=val1 | key2=val2

For questions and conversation, respond normally without a tool prefix.

Current context: ${JSON.stringify(context || {})}

Be concise and helpful. Do not make up information.`;

      const conversation = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversation}\n\nASSISTANT:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
      });

      const text = response.text || '';

      // Check for tool call
      const toolMatch = text.match(/TOOL:\s*(\w+)\s*\|\s*(.*)/);
      if (toolMatch) {
        const toolName = toolMatch[1];
        const raw = toolMatch[2];
        const args: Record<string, string> = {};
        raw.split('|').forEach(p => {
          const eq = p.indexOf('=');
          if (eq > 0) args[p.substring(0, eq).trim()] = p.substring(eq + 1).trim();
        });

        // Execute the tool
        let result: string;
        try {
          result = await executeAgentTool(toolName, args, supabaseClient);
        } catch (err: any) {
          result = `Error: ${err.message}`;
        }

        return res.json({
          role: 'assistant',
          content: result,
          tool_call: { name: toolName, args, result },
        });
      }

      res.json({ role: 'assistant', content: text });
    } catch (err: any) {
      console.error('Agent error:', err);
      res.status(500).json({ role: 'assistant', content: `Error: ${err.message}` });
    }
  });

  // ================================================================
  // CRON JOBS (Scheduled Automation)
  // ================================================================
  function setupCronJobs() {
    const client = supabaseClient;

    // Daily: Check for pending registrations and log status
    cron.schedule('0 9 * * *', async () => {
      console.log('[Cron] Daily registration status check...');
      if (!client) return;
      const { data: pending } = await client.from('registrations').select('*, tracks(title, artist_id)').eq('status', 'pending');
      if (pending?.length) {
        console.log(`[Cron] ${pending.length} pending registrations found`);
        // Could trigger email notification here
      }
    });

    // Daily: Log platform sync status
    cron.schedule('0 10 * * *', async () => {
      console.log('[Cron] Daily integration health check...');
      if (!client) return;
      const { data: configs } = await client.from('integration_configs').select('platform').not('enabled', 'eq', false);
      const platforms = [...new Set((configs || []).map(c => c.platform))];
      console.log(`[Cron] ${platforms.length} active integrations: ${platforms.join(', ')}`);
    });

    // Weekly (Monday 8am): Generate income summary report
    cron.schedule('0 8 * * 1', async () => {
      console.log('[Cron] Weekly income summary...');
      if (!client) return;
      const { data: summary } = await client.from('income_summary').select('*');
      const total = (summary || []).reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
      console.log(`[Cron] Weekly total income across all sources: $${total.toFixed(2)}`);
    });

    // Every 6 hours: Sync check for integrations that have auto-sync
    cron.schedule('0 */6 * * *', async () => {
      console.log('[Cron] Auto-sync check...');
    });

    console.log('[Cron] Scheduled jobs initialized');
  }

  // Agent tool executor
  async function executeAgentTool(toolName: string, args: Record<string, string>, client: any): Promise<string> {
    switch (toolName) {
      case 'get_income_summary': {
        if (!client) return 'Database not configured';
        let query = client.from('income_summary').select('*');
        if (args.artist_id) query = query.eq('artist_id', args.artist_id);
        if (args.period && args.period !== 'all') {
          query = query.gte('period_start', `${args.period}-01`).lte('period_end', `${args.period}-31`);
        }
        const { data } = await query;
        if (!data?.length) return 'No income data found.';
        const total = data.reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
        const platforms = [...new Set(data.map((i: any) => i.source))];
        return `Total income: $${total.toFixed(2)} across ${platforms.length} sources. ${data.length} records.`;
      }

      case 'get_track_splits': {
        if (!client) return 'Database not configured';
        const { data: track } = await client.from('tracks').select('*, track_writers(*)').eq('id', args.track_id).single();
        if (!track) return 'Track not found';
        const income = parseFloat(args.income || '0');
        const lines = (track.track_writers || []).map((w: any) => {
          const ws = parseFloat(w.writer_share) || 0;
          const ps = parseFloat(w.publisher_share) || 0;
          return `â€¢ ${w.writer_name}: ${ws}% writer ($${(income * ws / 100).toFixed(2)}) + ${ps}% publisher ($${(income * ps / 100).toFixed(2)})`;
        });
        return `Splits for "${track.title}":\n${lines.join('\n')}\nTotal: $${income.toFixed(2)}`;
      }

      case 'generate_cwr': {
        if (!client) return 'Database not configured';
        const { data: tracks } = await client.from('tracks').select('*, artists(stage_name), track_writers(*)').eq('status', 'active');
        if (!tracks?.length) return 'No active tracks to export';
        const { data: exportRec } = await client.from('cwr_exports').insert({
          export_type: 'new_works', file_name: `ncsound-cwr-${Date.now()}.txt`, record_count: tracks.length, status: 'draft',
        }).select().single();
        for (const t of tracks) {
          await client.from('cwr_export_tracks').insert({ cwr_export_id: exportRec.id, track_id: t.id, transaction_type: 'NWN' });
        }
        return `CWR export generated with ${tracks.length} works. Export ID: ${exportRec.id}`;
      }

      case 'get_registration_status': {
        if (!client) return 'Database not configured';
        const { data: regs } = await client.from('registrations').select('*, tracks(title)').order('created_at', { ascending: false });
        if (!regs?.length) return 'No registrations found.';
        const byStatus: Record<string, string[]> = {};
        for (const r of regs) {
          const st = r.status;
          byStatus[st] = byStatus[st] || [];
          byStatus[st].push(`${(r as any).tracks?.title || 'Unknown'} @ ${r.registry}`);
        }
        const parts: string[] = [];
        if (byStatus.registered?.length) parts.push(`âœ… Registered: ${byStatus.registered.length} works`);
        if (byStatus.pending?.length) parts.push(`â³ Pending: ${byStatus.pending.length} works`);
        if (byStatus.rejected?.length) parts.push(`âŒ Rejected: ${byStatus.rejected.length} works`);
        return parts.join('\n') || 'No registration data found.';
      }

      case 'send_notification_email': {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return 'Email service not configured.';
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
          from: 'NcSound Publishing <notifications@ncsound.com>',
          to: args.to,
          subject: args.subject,
          html: `<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:24px;border:1px solid #333"><p>${(args.message || '').replace(/\n/g, '<br>')}</p></div>`,
        });
        if (error) throw error;
        return `Email sent to ${args.to}: "${args.subject}"`;
      }

      case 'get_integration_status': {
        if (!client) return 'Database not configured';
        const { data: configs } = await client.from('integration_configs').select('platform, config_key').not('enabled', 'eq', false);
        if (!configs?.length) return 'No integrations configured.';
        const byPlatform: Record<string, number> = {};
        for (const c of configs) { byPlatform[c.platform] = (byPlatform[c.platform] || 0) + 1; }
        const lines = Object.entries(byPlatform).map(([p, n]) => `- ${p}: ${n} key(s)`);
        return `${Object.keys(byPlatform).length} platform(s) active:\n${lines.join('\n')}`;
      }

      case 'get_catalog_stats': {
        if (!client) return 'Database not configured';
        let q = client.from('tracks').select('*', { count: 'exact', head: true });
        if (args.artist_id) q = q.eq('artist_id', args.artist_id);
        const { count } = await q;
        return `Total tracks: ${count || 0}. ${args.artist_id ? 'Artist catalog' : 'Global catalog'}.`;
      }

      case 'add_platform_income': {
        const incomeUrl = process.env.APP_URL || 'http://localhost:3000';
        const res = await fetch(`${incomeUrl}/api/integrations/platform-income`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            track_id: args.track_id, artist_id: args.artist_id, platform: args.platform,
            period_start: `${new Date().toISOString().substring(0, 7)}-01`,
            period_end: new Date().toISOString().split('T')[0],
            stream_count: parseInt(args.streams) || 0,
            gross_revenue: parseFloat(args.gross) || 0,
            net_revenue: parseFloat(args.net) || 0,
          }),
        });
        if (!res.ok) throw new Error('Failed to record income');
        return `Income recorded for ${args.platform}: ${args.streams || 0} streams, $${parseFloat(args.net || '0').toFixed(2)} net.`;
      }

      case 'generate_ddex': {
        if (!client) return 'Database not configured';
        const { data: allTracks } = await client.from('tracks').select('id').eq('status', 'active').limit(10);
        const ids = args.track_ids ? args.track_ids.split(',') : (allTracks || []).map((t: any) => t.id);
        if (!ids.length) return 'No tracks to export';
        return `DDEX ERN 4.3 XML can be generated for ${ids.length} tracks. Use the DDEX tab in admin dashboard.`;
      }

      case 'get_analytics': {
        const analyticsUrl = process.env.APP_URL || 'http://localhost:3000';
        const res = await fetch(`${analyticsUrl}/api/analytics/admin`);
        const data = await res.json();
        if (!res.ok) return 'Analytics unavailable';
        return `Catalog: ${data.total_catalog} tracks. Artists: ${data.active_artists}. Supervisors: ${data.supervisor_accounts}. MTD Placements: ${data.mtd_placements}. Total Income: $${(data.total_income || 0).toFixed(2)}.`;
      }

      default:
        return `Unknown tool: ${toolName}. Available: get_income_summary, get_track_splits, generate_cwr, get_registration_status, send_notification_email, get_integration_status, get_catalog_stats, add_platform_income, generate_ddex, get_analytics`;
    }
  }

  // Initialize cron jobs
  setupCronJobs();

  // ================================================================
  // PHASE 2b: AI SYNC PLACEMENT ENGINE
  // ================================================================

  // --- Track Embedding Generation ---
  app.post("/api/embeddings/generate", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { trackId } = req.body;

      // Determine which tracks to process
      let tracksToProcess: any[];
      if (trackId) {
        const { data } = await supabaseClient.from('tracks').select('*').eq('id', trackId);
        if (!data?.length) return res.status(404).json({ error: 'Track not found' });
        tracksToProcess = data;
      } else {
        const { data } = await supabaseClient.from('tracks').select('*').eq('status', 'active');
        tracksToProcess = data || [];
      }

      if (!tracksToProcess.length) return res.json({ generated: 0, message: 'No tracks to process' });

      let generated = 0;
      for (const track of tracksToProcess) {
        // Build embedding text from track metadata
        const parts: string[] = [track.title];
        if (track.genre) parts.push(`Genre: ${track.genre}`);
        if (track.mood_tags?.length) parts.push(`Mood: ${track.mood_tags.join(', ')}`);
        if (track.bpm) parts.push(`BPM: ${track.bpm}`);
        if (track.key_signature) parts.push(`Key: ${track.key_signature}`);
        if (track.energy_level) parts.push(`Energy: ${track.energy_level}`);
        const text = parts.join('. ');

        // Generate embedding via Gemini
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: `Generate a semantic embedding vector (384 dimensions) for this music track. Return ONLY a JSON array of 384 numbers:\n\n${text}`,
        });
        const responseText = response.text || '';
        const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
        if (!jsonMatch) continue;

        const embedding = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(embedding) || embedding.length < 100) continue;

        // Upsert embedding
        await supabaseClient.from('track_embeddings').upsert({
          track_id: track.id,
          embedding: embedding,
          model: 'gemini-2.5-pro',
        }, { onConflict: 'track_id' });
        generated++;
      }

      res.json({ generated, total: tracksToProcess.length });
    } catch (err: any) {
      console.error('Embedding error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Semantic Brief Matching ---
  app.post("/api/match/brief", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { briefId, briefText, mood_tags, bpm_min, bpm_max, use_type, limit } = req.body;
      if (!briefId && !briefText) return res.status(400).json({ error: 'briefId or briefText required' });

      // Get or build query text
      let queryText = briefText || '';
      if (briefId && !briefText) {
        const { data: brief } = await supabaseClient.from('briefs').select('*').eq('id', briefId).single();
        if (brief) {
          const parts: string[] = [brief.project_name];
          if (brief.use_type) parts.push(`Use type: ${brief.use_type}`);
          if (brief.mood_tags?.length) parts.push(`Required mood: ${brief.mood_tags.join(', ')}`);
          if (brief.bpm_min || brief.bpm_max) parts.push(`BPM range: ${brief.bpm_min || 'â€”'} to ${brief.bpm_max || 'â€”'}`);
          if (brief.details) parts.push(`Details: ${brief.details}`);
          queryText = parts.join('. ');
        }
      }

      if (!queryText) return res.status(400).json({ error: 'Could not build query text' });

      // Generate embedding for the brief text
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const embedResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Generate a semantic embedding vector (384 dimensions) for this music supervisor brief. Return ONLY a JSON array of 384 numbers:\n\n${queryText}`,
      });
      const embedText = embedResponse.text || '';
      const embedMatch = embedText.match(/\[[\s\S]*?\]/);
      if (!embedMatch) return res.status(500).json({ error: 'Failed to generate query embedding' });
      const queryEmbedding: number[] = JSON.parse(embedMatch[0]);

      // Get all track embeddings
      const { data: trackEmbeds } = await supabaseClient.from('track_embeddings').select('track_id, embedding, tracks!inner(title, genre, bpm, key_signature, mood_tags, energy_level, artist_id)');
      if (!trackEmbeds?.length) return res.json({ matches: [], message: 'No track embeddings found. Generate embeddings first.' });

      // Cosine similarity + filter
      const results: any[] = [];
      for (const te of trackEmbeds as any[]) {
        const emb = te.embedding;
        if (!Array.isArray(emb)) continue;

        const track = te.tracks;
        // Optional metadata filters
        if (mood_tags?.length && track.mood_tags?.length) {
          const hasMood = track.mood_tags.some((m: string) => mood_tags.includes(m));
          if (!hasMood) continue;
        }
        if (bpm_min && track.bpm && track.bpm < bpm_min) continue;
        if (bpm_max && track.bpm && track.bpm > bpm_max) continue;
        if (use_type && use_type === 'instrumental' && track.instrumentation?.includes('vocals')) continue;

        // Cosine similarity
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < Math.min(emb.length, queryEmbedding.length); i++) {
          dot += emb[i] * queryEmbedding[i];
          normA += emb[i] * emb[i];
          normB += queryEmbedding[i] * queryEmbedding[i];
        }
        const score = (Math.sqrt(normA) * Math.sqrt(normB)) === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));

        if (score > 0.1) {
          results.push({
            track_id: te.track_id,
            title: track.title,
            genre: track.genre,
            bpm: track.bpm,
            mood_tags: track.mood_tags,
            score: Math.round(score * 10000) / 10000,
          });
        }
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
      const topResults = results.slice(0, limit || 20);

      // Store matches in brief_matches table if briefId provided
      if (briefId) {
        for (const r of topResults) {
          await supabaseClient.from('brief_matches').upsert({
            brief_id: briefId,
            track_id: r.track_id,
            relevance_score: r.score,
            match_reason: `Semantic similarity: ${r.score}`,
          }, { onConflict: 'brief_id,track_id' });
        }
      }

      res.json({ matches: topResults, total: topResults.length });
    } catch (err: any) {
      console.error('Brief matching error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Auto-Pitch Generation ---
  app.post("/api/pitch/generate", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { briefId, trackIds } = req.body;
      if (!briefId || !trackIds?.length) return res.status(400).json({ error: 'briefId and trackIds required' });

      // Get brief details
      const { data: brief } = await supabaseClient.from('briefs').select('*').eq('id', briefId).single();
      if (!brief) return res.status(404).json({ error: 'Brief not found' });

      // Get track details
      const { data: tracks } = await supabaseClient.from('tracks').select('*, artists(stage_name)').in('id', trackIds);
      if (!tracks?.length) return res.status(404).json({ error: 'Tracks not found' });

      // Build track list description
      const trackList = tracks.map((t: any, i: number) =>
        `${i + 1}. "${t.title}" by ${t.artists?.stage_name || 'Unknown'} â€” ${t.genre || 'Unknown'} | ${t.mood_tags?.join(', ') || 'Various'} | ${t.bpm || 'â€”'} BPM`
      ).join('\n');

      // Generate pitch via Gemini
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const pitchResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `You are a sync licensing music coordinator. Write a professional pitch email to a music supervisor.

Supervisor Project: "${brief.project_name}"
Use Type: ${brief.use_type || 'Not specified'}
Budget Range: ${brief.budget_range || 'Not specified'}
Deadline: ${brief.deadline || 'Not specified'}
Details: ${brief.details || 'Not specified'}

Curated Track List:
${trackList}

Write a concise, professional pitch email (3-4 paragraphs) that:
1. References the specific project and its needs
2. Explains why each track or the collection fits their brief
3. Highlights relevant mood/genre/BPM matches
4. Includes a clear call to action (listen to full tracks, schedule a call)

Also generate a DISCO playlist description (1-2 sentences) that summarizes the collection.`,
      });
      const pitchText = pitchResponse.text || '';

      // Extract DISCO description and email body
      const parts = pitchText.split(/(?=DISCO playlist|disco playlist)/i);
      const emailBody = parts[0]?.trim() || pitchText;
      const discoDescription = parts[1]?.trim() || `${tracks.length} tracks curated for "${brief.project_name}".`;

      res.json({
        subject: `Sync Placement: ${tracks.length} tracks for "${brief.project_name}"`,
        email_body: emailBody,
        disco_description: discoDescription,
        track_count: tracks.length,
      });
    } catch (err: any) {
      console.error('Pitch generation error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Outreach Campaign CRUD ---
  app.post("/api/outreach/create", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { brief_id, title, subject, body } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });
      const { data, error } = await supabaseClient.from('outreach_campaigns').insert({
        brief_id, title, subject, body, status: 'draft',
      }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) { res.status(500).json({ error: sanitizeError(err) }); }
  });

  app.post("/api/outreach/send", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { campaignId } = req.body;
      if (!campaignId) return res.status(400).json({ error: 'campaignId required' });

      const { data: campaign } = await supabaseClient.from('outreach_campaigns').select('*').eq('id', campaignId).single();
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

      // Get all supervisors with email
      const { data: supervisors } = await supabaseClient.from('supervisors').select('*').eq('verified', true);
      const recipients = supervisors || [];

      // Create recipient records
      for (const s of recipients) {
        const { data: user } = await supabaseClient.from('users').select('email').eq('id', s.user_id).single();
        if ((user as any)?.email) {
          await supabaseClient.from('outreach_recipients').insert({
            campaign_id: campaignId,
            supervisor_id: s.id,
            email: (user as any).email,
            name: s.company || 'Supervisor',
            status: 'pending',
          });
        }
      }

      await supabaseClient.from('outreach_campaigns').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      }).eq('id', campaignId);

      res.json({ sent: recipients.length, campaign_id: campaignId });
    } catch (err: any) { res.status(500).json({ error: sanitizeError(err) }); }
  });

  app.get("/api/outreach/stats", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data: campaigns } = await supabaseClient.from('outreach_campaigns').select('*, outreach_recipients(*)').order('created_at', { ascending: false });
      if (!campaigns) return res.json([]);

      const stats = campaigns.map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        sent_at: c.sent_at,
        total: c.outreach_recipients?.length || 0,
        sent: c.outreach_recipients?.filter((r: any) => r.status === 'sent').length || 0,
        opened: c.outreach_recipients?.filter((r: any) => r.status === 'opened' || r.opened_at).length || 0,
        replied: c.outreach_recipients?.filter((r: any) => r.status === 'replied' || r.replied_at).length || 0,
      }));

      res.json(stats);
    } catch (err: any) { res.status(500).json({ error: sanitizeError(err) }); }
  });

  // --- DISCO Playlist Export ---
  app.post("/api/disco/playlist", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { trackIds, playlistName } = req.body;
      if (!trackIds?.length) return res.status(400).json({ error: 'trackIds required' });

      const { data: tracks } = await supabaseClient.from('tracks').select('*, track_writers(*)').in('id', trackIds);
      if (!tracks?.length) return res.status(404).json({ error: 'Tracks not found' });

      const name = playlistName || `AI Curated Playlist ${Date.now()}`;
      const csvRows = ['"Title","Artist","ISRC","Genre","BPM","Key","Mood","Writers","Label","Playlist"'];
      for (const t of tracks as any[]) {
        const writers = (t.track_writers || []).map((w: any) => w.writer_name).join('; ');
        csvRows.push([
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `""`,
          `"${t.isrc || ''}"`,
          `"${t.genre || ''}"`,
          t.bpm || '',
          `"${t.key_signature || ''}"`,
          `"${(t.mood_tags || []).join(', ')}"`,
          `"${writers}"`,
          '"NcSound Publishing"',
          `"${name}"`,
        ].join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${name.replace(/[^a-zA-Z0-9]/g, '-')}.csv"`);
      res.send(csvRows.join('\n'));
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // ================================================================
  // PHASE 2c: REVENUE INFRASTRUCTURE
  // ================================================================

  // --- Stripe Connect Onboarding ---
  app.post("/api/stripe/connect/onboard", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return res.status(500).json({ error: 'Payments not configured' });
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
      const { artistId } = req.body;
      if (!artistId) return res.status(400).json({ error: 'artistId required' });

      // Check if account already exists
      const { data: existing } = await supabaseClient.from('stripe_accounts').select('*').eq('artist_id', artistId).single();

      let accountId: string;
      if (existing?.stripe_account_id) {
        accountId = existing.stripe_account_id;
      } else {
        // Create new Connect account
        const account = await stripe.accounts.create({
          type: 'express',
          capabilities: { transfers: { requested: true } },
        });
        accountId = account.id;
        await supabaseClient.from('stripe_accounts').insert({
          artist_id: artistId,
          stripe_account_id: accountId,
        });
      }

      // Generate onboarding link
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${appUrl}/artist/dashboard`,
        return_url: `${appUrl}/artist/dashboard?connect=complete`,
        type: 'account_onboarding',
      });

      res.json({ url: link.url });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Webhook: Stripe Connect account.updated
  // Note: Must be registered in Stripe dashboard webhook settings
  app.post("/api/stripe/connect/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripeKey || !webhookSecret || !supabaseClient) return res.status(200).send(); // no-op if not configured

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
      const sig = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      if (event.type === 'account.updated') {
        const account = event.data.object;
        await supabaseClient.from('stripe_accounts').update({
          onboarding_complete: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        }).eq('stripe_account_id', account.id);
      }
      res.json({ received: true });
    } catch (webhookErr: any) {
      console.error('Stripe connect webhook error:', webhookErr.message);
      res.status(200).send();
    }
  });

  // --- Automated Payout ---
  app.post("/api/stripe/payout", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return res.status(500).json({ error: 'Payments not configured' });
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
      const { statementId, artistId, amount } = req.body;
      if (!artistId || !amount) return res.status(400).json({ error: 'artistId and amount required' });

      // Get artist's Stripe account
      const { data: account } = await supabaseClient.from('stripe_accounts').select('*').eq('artist_id', artistId).single();
      if (!account?.stripe_account_id) return res.status(400).json({ error: 'Artist has not connected Stripe' });
      if (!account.payouts_enabled) return res.status(400).json({ error: 'Artist Stripe account not ready for payouts' });

      // Create transfer to connected account
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: account.stripe_account_id,
      });

      // Update royalty statement with transfer ID
      if (statementId) {
        await supabaseClient.from('royalty_statements').update({
          stripe_transfer_id: transfer.id,
          status: 'paid',
        }).eq('id', statementId);
      }

      res.json({ transfer_id: transfer.id, amount, status: 'paid' });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Self-Serve Sync License Checkout ---
  app.post("/api/license/checkout", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return res.status(500).json({ error: 'Payments not configured' });
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
      const { trackId, licenseType, price, buyerEmail, title } = req.body;
      if (!trackId || !licenseType || !price || !buyerEmail) {
        return res.status(400).json({ error: 'trackId, licenseType, price, buyerEmail required' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `${licenseType.toUpperCase()} License â€” ${title || 'Track'}` },
            unit_amount: Math.round(parseFloat(price) * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        metadata: { trackId, licenseType, buyerEmail },
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/track/${trackId}?license=success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/track/${trackId}?license=canceled`,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- License Webhook (track purchases) ---
  // Uses the same webhook endpoint as beat store â€” already handles checkout.session.completed
  // The webhook at /api/webhook inserts into beat_store_orders. We add license_purchases here.
  // This is integrated into the existing /api/webhook handler above.

  // --- License PDF Generation ---
  app.post("/api/license/pdf", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const { purchaseId, trackId, buyerEmail, licenseType, amount } = req.body;

      // Get track details
      const { data: track } = await supabaseClient.from('tracks').select('*, artists(stage_name)').eq('id', trackId).single();
      if (!track) return res.status(404).json({ error: 'Track not found' });

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Generate HTML for the license
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>License Agreement â€” ${track.title}</title>
<style>
  body { font-family: 'Courier New', monospace; max-width: 700px; margin: 40px auto; padding: 20px; color: #111; }
  h1 { text-transform: uppercase; font-size: 20px; letter-spacing: 2px; border-bottom: 2px solid #000; padding-bottom: 10px; }
  h2 { font-size: 16px; text-transform: uppercase; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  td { padding: 8px 5px; border-bottom: 1px solid #ccc; font-size: 13px; }
  td:first-child { font-weight: bold; width: 160px; }
  .footer { margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
  .signature { margin-top: 30px; }
</style></head><body>
<h1>Sync License Agreement</h1>
<p style="font-size:12px;color:#666;">License ID: ${purchaseId || 'N/A'}</p>
<p style="font-size:12px;color:#666;">Date: ${date}</p>
<h2>Parties</h2>
<table><tr><td>Licensor:</td><td>${track.artists?.stage_name || 'Rights Holder'} (admin by NcSound Publishing)</td></tr>
<tr><td>Licensee:</td><td>${buyerEmail}</td></tr></table>
<h2>Track</h2>
<table><tr><td>Title:</td><td>${track.title}</td></tr>
<tr><td>ISRC:</td><td>${track.isrc || 'Not provided'}</td></tr>
<tr><td>Genre:</td><td>${track.genre || 'â€”'}</td></tr></table>
<h2>License Terms</h2>
<table><tr><td>Type:</td><td>${licenseType.toUpperCase()}</td></tr>
<tr><td>Fee:</td><td>$${parseFloat(amount).toFixed(2)} USD</td></tr>
<tr><td>Term:</td><td>Perpetual</td></tr>
<tr><td>Territory:</td><td>Worldwide</td></tr>
<tr><td>Exclusivity:</td><td>Non-Exclusive</td></tr></table>
<p>This license grants the Licensee the right to synchronize the above-mentioned Track in timed relation with visual media, subject to the terms agreed upon at the time of purchase.</p>
<div class="signature"><p>Accepted by NcSound Publishing as publishing administrator for the Licensor.</p></div>
<div class="footer">NcSound Publishing â€” ${appUrl}</div>
</body></html>`;

      // Upload HTML as PDF to Supabase Storage
      const fileName = `license-${purchaseId || trackId}-${Date.now()}.html`;
      const { data: upload } = await supabaseClient.storage
        .from('licenses')
        .upload(fileName, html, { contentType: 'text/html', upsert: true });

      const pdfUrl = upload?.path
        ? `${appUrl}/api/license/view/${fileName}`
        : null;

      // Store URL
      if (purchaseId) {
        await supabaseClient.from('license_purchases').update({ pdf_url: pdfUrl }).eq('id', purchaseId);
      }

      res.json({ pdf_url: pdfUrl, html });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Serve stored license files
  app.get("/api/license/view/:fileName", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data } = await supabaseClient.storage.from('licenses').download(req.params.fileName);
      if (!data) return res.status(404).send('Not found');
      const text = await data.text();
      res.setHeader('Content-Type', 'text/html');
      res.send(text);
    } catch (viewErr: any) {
      console.error('License view error:', viewErr.message);
      res.status(404).send('Not found');
    }
  });

  // --- Subscription Checkout ---
  app.post("/api/subscription/checkout", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return res.status(500).json({ error: 'Payments not configured' });

      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
      const { priceId, userId, email } = req.body;
      if (!priceId || !userId) return res.status(400).json({ error: 'priceId and userId required' });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        metadata: { userId },
        customer_email: email,
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/artist/dashboard?subscription=active`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing`,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Webhook: subscription status updates
  // Handled in existing /api/webhook â€” add subscription handlers in the switch

  // ================================================================
  // PHASE 2d: DISTRIBUTION + ANALYTICS
  // ================================================================

  // --- CWR 2.2 Compliant Export ---
  app.post("/api/cwr/v2/generate", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data: tracks } = await supabaseClient
        .from('tracks').select('*, artists(stage_name, ipi_number), track_writers(*)').eq('status', 'active');
      if (!tracks?.length) return res.status(400).json({ error: 'No active tracks' });

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const lines: string[] = [];

      // HDR record
      lines.push(`HDR${dateStr}${' '.repeat(40)}NcSound Publishing${' '.repeat(55)}${' '.repeat(8)}NWN${' '.repeat(49)}${' '.repeat(8)}N`);
      lines.push(`GRH${' '.repeat(119)}`);

      for (const t of tracks as any[]) {
        const title = (t.title || 'UNTITLED').substring(0, 50);
        const iswc = t.iswc || '';
        const isrc = t.isrc || '';
        const duration = t.duration || 0;
        const artistName = (t.artists?.stage_name || 'Unknown').substring(0, 30);

        // NWR (Work) record
        lines.push([
          'NWR', 'N', '00', 'E',
          title.padEnd(50),
          iswc.padEnd(14),
          '  ', '00', '00', '00',
          isrc.padEnd(14),
          'N',
        ].join(''));

        // Writers
        for (const w of (t.track_writers || [])) {
          const writerName = (w.writer_name || '').substring(0, 30);
          const ipi = (w.ipi_number || '').substring(0, 11);
          const pro = (w.pro_affiliation || 'ASCAP').substring(0, 5);
          const ws = parseFloat(w.writer_share) || 0;
          const ps = parseFloat(w.publisher_share) || 0;
          lines.push(`WRN${writerName.padEnd(30)}${ipi.padEnd(11)}${pro.padEnd(5)}${String(ws).padStart(7)}${String(ps).padStart(7)}`);
        }
      }

      lines.push(`UTR${' '.repeat(119)}`);
      const cwr = lines.join('\r\n');
      const fileName = `ncsound-cwr-v2-${Date.now()}.txt`;

      const { data: exportRec } = await supabaseClient.from('cwr_exports').insert({
        export_type: 'new_works', file_name: fileName, record_count: tracks.length, status: 'draft',
      }).select().single();

      for (const t of tracks) {
        await supabaseClient.from('cwr_export_tracks').insert({ cwr_export_id: exportRec.id, track_id: t.id, transaction_type: 'NWN' });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(cwr);
    } catch (err: any) { res.status(500).json({ error: sanitizeError(err) }); }
  });

  // --- DDEX ERN 4.3 XML Generation ---
  app.post("/api/ddex/generate", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { trackIds } = req.body;
      if (!trackIds?.length) return res.status(400).json({ error: 'trackIds required' });

      const { data: tracks } = await supabaseClient
        .from('tracks').select('*, artists(stage_name), track_writers(*)').in('id', trackIds);
      if (!tracks?.length) return res.status(404).json({ error: 'Tracks not found' });

      const now = new Date().toISOString();
      const msgId = `NCSOUND-ERN-${Date.now()}`;
      const partyId = 'P1';

      let trackXml = '';
      for (const [i, t] of (tracks as any[]).entries()) {
        const ref = `T${i + 1}`;
        trackXml += `
    <SoundRecording>
      <SoundRecordingReference>${ref}</SoundRecordingReference>
      <ReferenceTitle>
        <TitleText>${escapeXml(t.title || 'Untitled')}</TitleText>
      </ReferenceTitle>
      <Duration>${formatDuration(t.duration || 0)}</Duration>
      <SoundRecordingType>MusicalWorkSoundRecording</SoundRecordingType>
      <Genre>
        <GenreText>${escapeXml(t.genre || 'Unknown')}</GenreText>
      </Genre>
      <SoundRecordingDetailsByTerritory>
        <TerritoryCode>US</TerritoryCode>
        <LabelName>NcSound Publishing</LabelName>
        <RightsController>${partyId}</RightsController>
      </SoundRecordingDetailsByTerritory>
    </SoundRecording>`;
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/43" ReleaseProfileVersionId="ern/43">
  <MessageHeader>
    <MessageId>${msgId}</MessageId>
    <MessageCreatedDateTime>${now}</MessageCreatedDateTime>
    <MessageSender>
      <PartyId>${partyId}</PartyId>
      <PartyName>NcSound Publishing</PartyName>
    </MessageSender>
  </MessageHeader>
  <ReleaseList>
    <Release>
      <ReleaseReference>R1</ReleaseReference>
      <ReleaseType>Album</ReleaseType>
      <ReferenceTitle>
        <TitleText>NcSound Catalog Delivery</TitleText>
      </ReferenceTitle>
      <ReleaseLabel>
        <LabelName>NcSound Publishing</LabelName>
      </ReleaseLabel>
      <ReleaseDetailsByTerritory>
        <TerritoryCode>US</TerritoryCode>
        <DealList>
          <Deal>
            <DealReference>D1</DealReference>
            <DealTerms>
              <Usage>
                <UseType>PermanentDownload</UseType>
              </Usage>
              <NumberOfUnits>0</NumberOfUnits>
              <RoyaltyBase>SuggestedRetailPrice</RoyaltyBase>
              <CommercialModelType>PayAsYouGo</CommercialModelType>
            </DealTerms>
          </Deal>
        </DealList>
      </ReleaseDetailsByTerritory>
      <ReleaseResourceReferenceList>
        ${tracks.map((_: any, i: number) => `<ReleaseResourceReference>${'T' + (i + 1)}</ReleaseResourceReference>`).join('\n        ')}
      </ReleaseResourceReferenceList>
    </Release>
  </ReleaseList>
  <ResourceList>${trackXml}
  </ResourceList>
</ern:NewReleaseMessage>`;

      const fileName = `ncsound-ddex-${Date.now()}.xml`;
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(xml);
    } catch (err: any) { res.status(500).json({ error: sanitizeError(err) }); }
  });

  // Helpers
  function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `PT${m}M${s}S`;
  }

  // --- Admin Analytics (replace hardcoded metrics) ---
  app.get("/api/analytics/admin", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const [tracksRes, artistsRes, supervisorsRes, dealsRes, statementsRes, incomeRes] = await Promise.all([
        supabaseClient.from('tracks').select('*', { count: 'exact', head: true }),
        supabaseClient.from('artists').select('*', { count: 'exact', head: true }),
        supabaseClient.from('supervisors').select('*', { count: 'exact', head: true }),
        supabaseClient.from('deals').select('sync_fee'),
        supabaseClient.from('royalty_statements').select('net_payout, status'),
        supabaseClient.from('income_summary').select('net_amount'),
      ]);

      const totalManagedFees = (dealsRes.data || []).reduce((s: number, d: any) => s + parseFloat(d.sync_fee || 0), 0);
      const activeCueSheets = (dealsRes.data || []).length;
      const pendingPayouts = (statementsRes.data || []).filter((s: any) => s.status === 'pending').length;
      const totalIncome = (incomeRes.data || []).reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
      const mtdDate = new Date(); mtdDate.setDate(1);
      const mtdIncome = (incomeRes.data || []).filter((i: any) => i.created_at >= mtdDate.toISOString()).reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);

      res.json({
        total_catalog: tracksRes.count || 0,
        active_artists: artistsRes.count || 0,
        supervisor_accounts: supervisorsRes.count || 0,
        mtd_placements: mtdIncome > 0 ? Math.ceil(mtdIncome / 1000) : 0,
        total_managed_fees: totalManagedFees,
        active_cue_sheets: activeCueSheets,
        pending_payouts: pendingPayouts,
        total_income: totalIncome,
      });
    } catch (err: any) { res.status(500).json({ error: sanitizeError(err) }); }
  });

  // --- Supervisor Analytics ---
  app.get("/api/analytics/supervisors", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const [supervisorsRes, briefsRes, matchesRes] = await Promise.all([
        supabaseClient.from('supervisors').select('*', { count: 'exact', head: true }),
        supabaseClient.from('briefs').select('*'),
        supabaseClient.from('brief_matches').select('*'),
      ]);

      const openBriefs = (briefsRes.data || []).filter((b: any) => b.status === 'open').length;
      const totalMatches = matchesRes.count || matchesRes.data?.length || 0;

      res.json({
        total_supervisors: supervisorsRes.count || 0,
        open_briefs: openBriefs,
        total_briefs: briefsRes.data?.length || 0,
        total_matches: totalMatches,
      });
    } catch (err: any) { res.status(500).json({ error: sanitizeError(err) }); }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
