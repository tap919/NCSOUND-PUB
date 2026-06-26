import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import 'dotenv/config';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cron from 'node-cron';
import pino from 'pino';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';

import { sanitizeError } from './src/lib/sanitize';
import { sanitizePrompt, sanitizeMessages } from './src/lib/validation';
import { emailSchema, geminiSchema, agentChatSchema } from './src/lib/schemas';
import { SPLIT } from './src/lib/constants';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { createRequireAdmin } from './src/middleware/auth';
import { createOutreachRouter } from './src/routes/outreach';
import { createIntegrationsRouter } from './src/routes/integrations';
import { createStripeRouter } from './src/routes/stripe';
import { createAnalyticsRouter } from './src/routes/analytics';
import { createCwrDdexRouter } from './src/routes/cwr-ddex';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const ALLOWED_FETCH_HOSTS = [
  'supabase.co',
  'storage.googleapis.com',
  'soundcloud.com',
  'youtube.com',
  'i.ytimg.com',
  'images.unsplash.com',
  'bandcamp.com',
];

function isAllowedUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return ALLOWED_FETCH_HOSTS.some(host => u.hostname === host || u.hostname.endsWith('.' + host));
  } catch { return false; }
}

async function startServer() {
  // NODE_ENV must be set by the environment — never default to production here.
  // Vite's dev/prod behavior depends on it. Set via npm script or .env.
  // production: npm run build && npm start (NODE_ENV=production)
  // development: npm run dev (NODE_ENV=development)

  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Structured logging via pino (declare before env checks so console.* is overridden)
  const logger = pino({
    level: process.env.LOG_LEVEL || 'warn',
    transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
    redact: ['req.headers.authorization', 'req.headers["x-api-key"]', 'body.password', 'body.secret', 'body.apiKey'],
  });
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => (req.url || '').startsWith('/api/health') } }));
  function log(level: string, msg: string, ...rest: any[]) { logger[level](msg, ...rest); }
  // Pipe console through pino for structured logging everywhere
  console.log = (...args) => logger.info(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  console.error = (...args) => logger.error(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  console.warn = (...args) => logger.warn(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));

  // Sentry error tracking
  if (process.env.SENTRY_DSN) Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });

  // Env validation — warn at startup, hard block critical paths at runtime
  const GEMINI_KEY_PATTERN = /^AIza[A-Za-z0-9_-]{35}$/;
  if (process.env.GEMINI_API_KEY && !GEMINI_KEY_PATTERN.test(process.env.GEMINI_API_KEY)) {
    logger.warn('GEMINI_API_KEY format appears invalid');
  }

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

  // Initialize Stripe + Supabase clients once (not per-request)
  let stripeKey = process.env.STRIPE_SECRET_KEY;
  const fs = await import('fs');
  if (fs.existsSync(path.join(process.cwd(), 'tests/e2e/test.mode'))) stripeKey = 'mock'; 
  const stripeModule = stripeKey ? await (async () => {
    if (stripeKey === 'mock') {
        return {
            checkout: {
                sessions: {
                    create: async () => ({ url: 'https://checkout.stripe.com/test' })
                }
            }
        } as any;
    }
    const Stripe = (await import('stripe')).default;
    return new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });
  })() : null;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseClient = (supabaseUrl && supabaseServiceKey) ? await (async () => {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(supabaseUrl, supabaseServiceKey);
  })() : null;

  // Gemini client — singleton, instantiated once at startup
  let geminiClient: any = null;
  function getGemini() {
    if (!geminiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return null;
      geminiClient = new (require('@google/genai').GoogleGenAI)({ apiKey: key }); // eslint-disable-line @typescript-eslint/no-require-imports
    }
    return geminiClient;
  }

  const requireAdmin = createRequireAdmin(supabaseClient);

  // CORS
  const corsOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.APP_URL || 'http://localhost:3000').split(',').map(s => s.trim())
    : '*';
  app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  }));

  // Static assets — direct file serving using fs (works with Vite dev middleware)
  // Serve assets/ directory directly (outside dist) so images never need copying
  app.use('/assets', express.static(path.join(process.cwd(), 'assets'), { maxAge: '1d' }));

  // Security headers — helmet replaces manual X-Content-Type-Options, X-Frame-Options, etc.
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://*.supabase.co'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));

  // Trust proxy for correct IP detection behind reverse proxies
  app.set('trust proxy', 'loopback');

  // Rate limiting — granular per-endpoint
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Try again in a minute.' },
    skip: (req) => req.path.startsWith('/api/webhook'),
  });
  app.use('/api/', apiLimiter);

  const webhookLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests.' },
  });

  const financialLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many payment requests. Try again later.' },
    keyGenerator: (req) => req.ip || 'unknown',
  });

  const geminiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many AI requests. Slow down.' },
    keyGenerator: (req) => req.ip || 'unknown',
  });

  const agentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many chat requests.' },
    keyGenerator: (req) => req.ip || 'unknown',
  });

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
  app.post("/api/webhook", webhookLimiter, express.raw({ type: "application/json" }), async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeModule || !webhookSecret) {
      return res.status(500).send("Stripe is not configured.");
    }

    const sig = req.headers["stripe-signature"];

    let event: Stripe.Event;
    try {
      if (!sig) throw new Error("No signature");
event = stripeModule.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send("Invalid signature");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!supabaseClient) throw new Error('Supabase not configured');

        const { beatId, title, trackId, licenseType, buyerEmail, userId } = session.metadata || {};

        // Beat store order
        if (beatId && title) {
          await supabaseClient.from('beat_store_orders').insert({
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
          const { data: purchase } = await supabaseClient.from('license_purchases').insert({
            track_id: trackId,
            buyer_email: email,
            license_type: licenseType,
            amount_paid: (session.amount_total || 0) / 100,
            stripe_payment_id: session.id,
          }).select().single();

          // Generate license PDF
          if (purchase) {
        try {
          await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/license/agreement`, {
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
        } catch (e: any) { log('error', 'License PDF gen failed:', e.message); }
          }
          console.log(`License purchased: ${licenseType} for track ${trackId}`);
        }

        // Subscription
        if (userId) {
          const subId = session.subscription as string | null;
          await supabaseClient.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subId,
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
        if (!supabaseClient) throw new Error('Supabase not configured');
        await supabaseClient.from('subscriptions').update({
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

  app.post("/api/gemini", geminiLimiter, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      const geminiValid = geminiSchema.safeParse(req.body);
      if (!geminiValid.success) {
        return res.status(400).json({ error: geminiValid.error.issues[0].message });
      }
      const { prompt } = geminiValid.data;
      const sanitizeErr = sanitizePrompt(prompt);
      if (sanitizeErr) return res.status(400).json({ error: sanitizeErr });
      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (error: any) {
      log('error', error);
      res.status(500).json({ error: "AI generation failed" });
    }
  });

  // --- Dedicated AI Endpoints (replacing generic /api/gemini proxy) ---

  app.post("/api/analyze/classify", geminiLimiter, async (req, res) => {
    try {
      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });
      const { title, bpm, key, energy, instrumentation } = req.body;
      if (!title) return res.status(400).json({ error: 'Track title is required' });
      const prompt = `You are a music AI classifier. Analyze this track and respond with ONLY a JSON object.

Track: "${title}"
BPM: ${bpm || 'unknown'}
Key: ${key || 'unknown'}
Energy: ${energy || 'unknown'}
${instrumentation ? `Instruments: ${instrumentation}` : ''}

Respond with:
{
  "genre": "one primary genre (e.g., Hip-Hop, R&B, Pop, Rock, Electronic, Lo-Fi, Trap, Drill, House, Ambient, Country, Jazz)",
  "mood_tags": ["3-5 mood tags that describe the emotional feel (e.g., dark, energetic, melancholic, uplifting, aggressive, smooth)"],
  "confidence": 0.0-1.0
}`;
      const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
      res.json({ text: response.text });
    } catch (error: any) {
      log('error', error);
      res.status(500).json({ error: 'Classification failed' });
    }
  });

  app.post("/api/analyze/embed", geminiLimiter, async (req, res) => {
    try {
      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text is required' });
      const prompt = `Generate a semantic embedding vector (384 dimensions) for the following text. Return ONLY a JSON array of numbers, no other text:\n\n${text}`;
      const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
      res.json({ text: response.text });
    } catch (error: any) {
      log('error', error);
      res.status(500).json({ error: 'Embedding generation failed' });
    }
  });

  // --- End AI Endpoints ---

  app.post("/api/checkout", financialLimiter, async (req, res) => {
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
      log('error', error);
      res.status(500).json({ error: "Checkout failed" });
    }
  });

  // --- OCR: Royalty Statement Processing via Gemini Vision ---
  app.post("/api/ocr/statement", requireAdmin, geminiLimiter, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "AI service not configured" });

      const { imageBase64, mimeType, entity } = req.body;
      if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });

      // Size limit: ~10MB base64 = ~7.5MB binary
      if (imageBase64.length > 10 * 1024 * 1024) {
        return res.status(413).json({ error: 'Image too large (max 10MB base64)' });
      }

      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });

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
        log('error', 'OCR parse error:', parseErr.message);
        parsed = { line_items: [], raw: response.text, error: 'Failed to parse AI response' };
      }

      res.json(parsed);
    } catch (err: any) {
      log('error', 'OCR error:', err);
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

      // SSRF protection: only allow Supabase Storage URLs
      try {
        const u = new URL(audioUrl);
        if (u.protocol !== 'https:') return res.status(400).json({ error: 'Audio URL must use HTTPS' });
        const supabaseHost = (process.env.VITE_SUPABASE_URL || '').replace('https://', '');
        if (!supabaseHost || !u.hostname.endsWith(supabaseHost)) {
          return res.status(400).json({ error: 'Audio URL must be from Supabase Storage' });
        }
      } catch { return res.status(400).json({ error: 'Invalid audio URL' }); }

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
      log('error', 'Audio analysis error:', err.message);
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
      log('error', 'Metadata classification error:', err.message);
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
      log('error', 'Analysis status check error:', e.message);
      res.status(500).json({ error: 'Analysis status check failed' });
    }
  });

  // GET /api/quality/scores â€” Metadata quality for all artists (admin)
  app.get("/api/quality/scores", requireAdmin, async (req, res) => {
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
  app.get("/api/quality/scores/:artistId", requireAdmin, async (req, res) => {
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
  // Helper: sanitize CSV cell to prevent formula injection
  function csvCell(val: string): string {
    const safe = (val || '').replace(/"/g, '""');
    // Prefix cells starting with formula-triggering chars to prevent CSV injection
    if (/^[=+\-@\t\r]/.test(safe)) return `"${'\t'}${safe}"`;
    return `"${safe}"`;
  }

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
          csvCell(t.title || ''),
          csvCell(t.artists?.stage_name || ''),
          csvCell(t.isrc || ''),
          csvCell(t.genre || ''),
          t.bpm || '',
          csvCell(t.key_signature || ''),
          csvCell((t.mood_tags || []).join(', ')),
          csvCell(writers),
          '"NcSound Publishing"',
          t.status
        ].join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="ncsound-catalog-disco.csv"');
      res.send(csvRows.join('\n'));
    } catch (err: any) {
      log('error', 'DISCO export error:', err.message);
      res.status(500).json({ error: 'Export failed' });
    }
  });

  // Supabase Storage Upload URL
  app.post("/api/upload-url", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Storage not configured' });
      const { bucket, fileName } = req.body;
      const ALLOWED_BUCKETS = ['audio', 'images', 'avatars', 'documents'];
      if (!bucket || !fileName) return res.status(400).json({ error: 'bucket and fileName required' });
      if (!ALLOWED_BUCKETS.includes(bucket)) return res.status(400).json({ error: 'bucket not allowed' });

      const filePath = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;

      // Generate signed upload URL (client uploads directly to Supabase Storage)
      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .createSignedUploadUrl(filePath);

      if (error) throw error;
      res.json({ url: data?.signedUrl, path: filePath });
    } catch (err: any) {
      log('error', 'Upload URL error:', err.message);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });

  // YouTube Feed â€” fetches latest videos and live status from a channel
  app.get("/api/youtube/feed", async (req, res) => {
    try {
      const channelId = req.query.channelId as string;
      if (!channelId) return res.status(400).json({ error: 'channelId required' });
      if (!/^[a-zA-Z0-9_-]+$/.test(channelId)) return res.status(400).json({ error: 'Invalid channelId format' });

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
      log('error', 'YouTube feed error:', err.message);
      res.status(500).json({ error: 'Feed unavailable' });
    }
  });

  // Sitemap
  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const staticRoutes = ['/', '/about', '/catalog', '/beat-store', '/blog', '/supervisor', '/supervisor/register', '/submit-brief', '/submit', '/agreement', '/terms', '/privacy'];
    const rosterRoutes = ['/roster/niro', '/roster/tap919', '/roster/art-productions', '/roster/soulyghost'];
    const lastmod = new Date().toISOString().split('T')[0];

    let urls = '';
    for (const route of [...staticRoutes, ...rosterRoutes]) {
      urls += `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>\n`;
    }

    res.setHeader('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`);
  });

  // Robots.txt
  app.get("/robots.txt", (_req, res) => {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`);
  });

  // ================================================================
  // INTEGRATION FRAMEWORK â€” 3rd Party Platform Config & Income
  // ================================================================

  // Helper: get authenticated supabase client (uses singleton)
  function getSupabase() {
    if (!supabaseClient) throw new Error('Supabase not configured');
    return Promise.resolve(supabaseClient);
  }

  // --- Integrations (see src/routes/integrations.ts) ---
  app.use("/api/integrations", createIntegrationsRouter({ supabaseClient, requireAdmin, sanitizeError, getSupabase, isAllowedUrl }));

  // Bandcamp Discography Proxy
  app.get("/api/bandcamp/discography", async (req, res) => {
    try {
      const bandcampUrl = (req.query.bandcampUrl as string) || 'https://ncsound.bandcamp.com';
      if (!isAllowedUrl(bandcampUrl)) return res.status(400).json({ error: 'Bandcamp URL domain not allowed' });
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
      // Validate upstream — only allow configured NIRO_SITE_URL
      const upstream = new URL(NIRO_SITE_URL);
      const reqPath = req.path.replace(/\.\./g, '').replace(/\/+/g, '/');
      const fullUrl = `${upstream.origin}${reqPath}`;
      // Ensure the URL stays within the configured origin
      const parsed = new URL(fullUrl);
      if (parsed.origin !== upstream.origin) {
        return res.status(403).json({ error: 'Proxy target not allowed' });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const proxyRes = await fetch(fullUrl, {
        headers: { 'user-agent': req.headers['user-agent'] || '' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const contentType = proxyRes.headers.get('content-type') || '';

      if (contentType.includes('text/html')) {
        let html = await proxyRes.text();
        html = html.replace(/(href|src|action)=(["'])\//g, `$1=$2/niro-site/`);
        html = html.replace(/https:\/\/niro-music\.vercel\.app\//g, '/niro-site/');
        html = html.replace(/@next_public_base_url\b/g, '/niro-site');
        res.status(proxyRes.status).type('text/html').send(html);
      } else {
        const buffer = Buffer.from(await proxyRes.arrayBuffer());
        res.status(proxyRes.status).set('content-type', contentType).send(buffer);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        res.status(504).json({ error: 'Niro proxy timed out' });
      } else {
        log('error', 'Niro proxy error:', err.message);
        res.status(502).json({ error: 'Niro site unavailable' });
      }
    }
  };

  app.use('/niro-site', proxyToNiro);
  const niroStaticPaths = ['/_next', '/images', '/gallery', '/icons', '/fonts'];
  for (const p of niroStaticPaths) { app.use(p, proxyToNiro); }
  app.get('/favicon.ico', proxyToNiro);

  // ================================================================
  // EMAIL SERVICE (Resend)
  // ================================================================
  app.post("/api/email/send", requireAdmin, async (req, res) => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Email service not configured (set RESEND_API_KEY)" });

      const emailValid = emailSchema.safeParse(req.body);
      if (!emailValid.success) {
        return res.status(400).json({ error: emailValid.error.issues[0].message });
      }
      const { to, subject, html, from, cc, bcc } = emailValid.data;

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
      log('error', 'Email error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // ================================================================
  // AI AGENT CHAT
  // ================================================================
  app.post("/api/agent/chat", requireAdmin, agentLimiter, geminiLimiter, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'AI service not configured' });

      const agentValid = agentChatSchema.safeParse(req.body);
      if (!agentValid.success) {
        return res.status(400).json({ error: agentValid.error.issues[0].message });
      }
      const { messages, context } = agentValid.data;
      const sanitizeErr = sanitizeMessages(messages);
      if (sanitizeErr) return res.status(400).json({ error: sanitizeErr });

      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });

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
      log('error', 'Agent error:', err);
      res.status(500).json({ role: 'assistant', content: 'An error occurred processing your request.' });
    }
  });

  // ================================================================
  // CRON JOBS (Scheduled Automation)
  // ================================================================
  function setupCronJobs() {
    const client = supabaseClient;

    // Daily: Check for pending registrations and log status
    cron.schedule('0 9 * * *', async () => {
      log('info', '[Cron] Daily registration status check...');
      if (!client) return;
      const { data: pending } = await client.from('registrations').select('*, tracks(title, artist_id)').eq('status', 'pending');
      if (pending?.length) {
        console.log(`[Cron] ${pending.length} pending registrations found`);
        // Could trigger email notification here
      }
    });

    // Daily: Log platform sync status
    cron.schedule('0 10 * * *', async () => {
      log('info', '[Cron] Daily integration health check...');
      if (!client) return;
      const { data: configs } = await client.from('integration_configs').select('platform').not('enabled', 'eq', false);
      const platforms = [...new Set((configs || []).map(c => c.platform))];
      console.log(`[Cron] ${platforms.length} active integrations: ${platforms.join(', ')}`);
    });

    // Weekly (Monday 8am): Generate income summary report
    cron.schedule('0 8 * * 1', async () => {
      log('info', '[Cron] Weekly income summary...');
      if (!client) return;
      const { data: summary } = await client.from('income_summary').select('*');
      const total = (summary || []).reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
      console.log(`[Cron] Weekly total income across all sources: $${total.toFixed(2)}`);
    });

    // Every 6 hours: Sync check for integrations that have auto-sync
    cron.schedule('0 */6 * * *', async () => {
      log('info', '[Cron] Auto-sync check...');
    });

    log('info', '[Cron] Scheduled jobs initialized');
  }

  // Agent tool executor
  async function executeAgentTool(toolName: string, args: Record<string, string>, client: SupabaseClient | null): Promise<string> {
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
        // Restrict recipients to prevent abuse
        const allowedDomains = ['ncsound.com', 'gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
        const emailDomain = (args.to || '').split('@')[1]?.toLowerCase();
        if (!emailDomain || !allowedDomains.includes(emailDomain)) {
          return `Email to ${args.to} blocked: only allowed to send to ${allowedDomains.join(', ')}`;
        }
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);
        const { error } = await resend.emails.send({
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
        if (!client) return 'Database not configured';
        const { error: incomeErr } = await client.from('platform_income').upsert({
          track_id: args.track_id, artist_id: args.artist_id, platform: args.platform,
          period_start: `${new Date().toISOString().substring(0, 7)}-01`,
          period_end: new Date().toISOString().split('T')[0],
          stream_count: parseInt(args.streams) || 0,
          gross_revenue: parseFloat(args.gross) || 0,
          net_revenue: parseFloat(args.net) || 0,
          currency: 'USD', metadata: {}, synced_at: new Date().toISOString(),
        }, { onConflict: 'track_id,platform,period_start,period_end' });
        if (incomeErr) throw new Error('Failed to record income');
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
        if (!client) return 'Database not configured';
        const [tracksR, artistsR, supervisorsR, incomeR] = await Promise.all([
          client.from('tracks').select('*', { count: 'exact', head: true }),
          client.from('artists').select('*', { count: 'exact', head: true }),
          client.from('supervisors').select('*', { count: 'exact', head: true }),
          client.from('income_summary').select('net_amount').limit(1000),
        ]);
        const totalIncome = (incomeR.data || []).reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
        const mtdDate = new Date(); mtdDate.setDate(1);
        const mtdIncome = (incomeR.data || []).filter((i: any) => i.created_at >= mtdDate.toISOString()).reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
        return `Catalog: ${tracksR.count || 0} tracks. Artists: ${artistsR.count || 0}. Supervisors: ${supervisorsR.count || 0}. MTD Placements: ${mtdIncome > 0 ? Math.ceil(mtdIncome / 1000) : 0}. Total Income: $${totalIncome.toFixed(2)}.`;
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
  app.post("/api/embeddings/generate", requireAdmin, geminiLimiter, async (req, res) => {
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
        const ai = getGemini();
        if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });
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
      log('error', 'Embedding error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Semantic Brief Matching ---
  app.post("/api/match/brief", geminiLimiter, async (req, res) => {
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
      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });
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
      log('error', 'Brief matching error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Auto-Pitch Generation ---
  app.post("/api/pitch/generate", geminiLimiter, async (req, res) => {
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
      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });
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
      log('error', 'Pitch generation error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // --- Outreach Campaign CRUD (see src/routes/outreach.ts) ---
  app.use("/api/outreach", createOutreachRouter({ supabaseClient, requireAdmin, sanitizeError }));

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

  // --- Stripe Connect (see src/routes/stripe.ts) ---
  // Stripe Connect webhook requires raw body — apply express.raw() only on that path
  const stripeRawJson = express.raw({ type: 'application/json' });
  app.use("/api/stripe", createStripeRouter({
    supabaseClient, stripeModule, requireAdmin,
    financialLimiter, webhookLimiter,
    rawJson: stripeRawJson,
    sanitizeError, log,
  }));

  // --- Self-Serve Sync License Checkout ---
  app.post("/api/license/checkout", financialLimiter, async (req, res) => {
    try {
      if (!stripeModule) return res.status(500).json({ error: 'Payments not configured' });
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { trackId, licenseType, price, buyerEmail, title } = req.body;
      if (!trackId || !licenseType || !price || !buyerEmail) {
        return res.status(400).json({ error: 'trackId, licenseType, price, buyerEmail required' });
      }

      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0 || priceNum > 10000) {
        return res.status(400).json({ error: 'Invalid price value' });
      }

      const session = await stripeModule.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `${licenseType.toUpperCase()} License — ${title || 'Track'}` },
            unit_amount: Math.round(priceNum * 100),
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

  // --- License Agreement Generation ---
  app.post("/api/license/agreement", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });

      const { purchaseId, trackId, buyerEmail, licenseType, amount } = req.body;

      const { data: track } = await supabaseClient.from('tracks').select('*, artists(stage_name)').eq('id', trackId).single();
      if (!track) return res.status(404).json({ error: 'Track not found' });

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>License Agreement — ${track.title}</title>
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
<p style="font-size:12px;color:#666;">License ID: ${escapeHtml(purchaseId || 'N/A')}</p>
<p style="font-size:12px;color:#666;">Date: ${date}</p>
<h2>Parties</h2>
<table><tr><td>Licensor:</td><td>${escapeHtml(track.artists?.stage_name || 'Rights Holder')} (admin by NcSound Publishing)</td></tr>
<tr><td>Licensee:</td><td>${escapeHtml(buyerEmail)}</td></tr></table>
<h2>Track</h2>
<table><tr><td>Title:</td><td>${escapeHtml(track.title)}</td></tr>
<tr><td>ISRC:</td><td>${escapeHtml(track.isrc || 'Not provided')}</td></tr>
<tr><td>Genre:</td><td>${escapeHtml(track.genre || '—')}</td></tr></table>
<h2>License Terms</h2>
<table><tr><td>Type:</td><td>${escapeHtml(licenseType.toUpperCase())}</td></tr>
<tr><td>Fee:</td><td>$${parseFloat(amount).toFixed(2)} USD</td></tr>
<tr><td>Term:</td><td>Perpetual</td></tr>
<tr><td>Territory:</td><td>Worldwide</td></tr>
<tr><td>Exclusivity:</td><td>Non-Exclusive</td></tr></table>
<p>This license grants the Licensee the right to synchronize the above-mentioned Track in timed relation with visual media, subject to the terms agreed upon at the time of purchase.</p>
<div class="signature"><p>Accepted by NcSound Publishing as publishing administrator for the Licensor.</p></div>
<div class="footer">NcSound Publishing — ${appUrl}</div>
</body></html>`;

      const fileName = `license-${purchaseId || trackId}-${Date.now()}.html`;
      const { data: upload } = await supabaseClient.storage
        .from('licenses')
        .upload(fileName, html, { contentType: 'text/html', upsert: true });

      const docUrl = upload?.path
        ? `${appUrl}/api/license/view/${fileName}`
        : null;

      if (purchaseId) {
        await supabaseClient.from('license_purchases').update({ doc_url: docUrl }).eq('id', purchaseId);
      }

      res.json({ doc_url: docUrl, html });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Serve stored license agreement files
  app.get("/api/license/view/:fileName", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data } = await supabaseClient.storage.from('licenses').download(req.params.fileName);
      if (!data) return res.status(404).send('Not found');
      const text = await data.text();
      res.setHeader('Content-Type', 'text/html');
      res.send(text);
    } catch (viewErr: any) {
      log('error', 'License view error:', viewErr.message);
      res.status(404).send('Not found');
    }
  });

  // --- Subscription Checkout ---
  app.post("/api/subscription/checkout", async (req, res) => {
    try {
      if (!stripeModule) return res.status(500).json({ error: 'Payments not configured' });
      const { priceId, userId, email } = req.body;
      if (!priceId || !userId) return res.status(400).json({ error: 'priceId and userId required' });

      const session = await stripeModule.checkout.sessions.create({
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

  // --- CWR 2.2 + DDEX (see src/routes/cwr-ddex.ts) ---
  app.use("/api", createCwrDdexRouter({ supabaseClient, requireAdmin, sanitizeError }));

  // --- Analytics (see src/routes/analytics.ts) ---
  app.use("/api/analytics", createAnalyticsRouter({ supabaseClient, requireAdmin, sanitizeError, log }));

  // ================================================================
  // PLAYLIST SUBMISSION — Analyzer & Credits
  // ================================================================

  // Analyze a playlist submission with Gemini
  app.post("/api/playlist/analyze", geminiLimiter, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'AI service not configured' });

      const { title, artist, genre, bpm, mood_tags, description } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });
      if (description) {
        const descErr = sanitizePrompt(description);
        if (descErr) return res.status(400).json({ error: descErr });
      }

      const ai = getGemini();
      if (!ai) return res.status(500).json({ error: 'Gemini AI not configured' });

      const prompt = `You are a music quality reviewer for NcSound Publishing's playlist. Analyze this track submission:

Title: "${title}"
Artist: "${artist || 'Unknown'}"
Genre: ${genre || 'Unknown'}
BPM: ${bpm || 'Unknown'}
Mood: ${(mood_tags || []).join(', ') || 'Unknown'}
Description: ${description || 'None provided'}

Rate this track 0-100 on: production_quality, originality, mixing, arrangement, commercial_potential.
Provide brief constructive feedback (2-3 sentences) on how to improve.
Also suggest 3 similar artists for reference.

Respond with ONLY a JSON object:
{
  "production_quality": 0-100,
  "originality": 0-100,
  "mixing": 0-100,
  "arrangement": 0-100,
  "commercial_potential": 0-100,
  "overall_score": 0-100,
  "feedback": "constructive feedback here",
  "similar_artists": ["artist1", "artist2", "artist3"]
}`;

      const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse analysis' });

      res.json(JSON.parse(jsonMatch[0]));
    } catch (err: any) {
      log('error', 'Playlist analysis error:', err.message);
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Submit a track to the playlist
  app.post("/api/playlist/submit", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { userId, artistName, trackTitle, genre, bpm, mood_tags, description, quality_score, quality_feedback } = req.body;
      if (!userId || !artistName || !trackTitle) return res.status(400).json({ error: 'userId, artistName, trackTitle required' });

      // Check credits (atomic-ish: read, validate, then act)
      const month = new Date().toISOString().substring(0, 7);
      const { data: credits } = await supabaseClient.from('submission_credits').select('*').eq('user_id', userId).single();
      if (credits) {
        if (credits.month !== month) {
          // Reset for new month
          await supabaseClient.from('submission_credits').update({ credits_used: 0, month }).eq('user_id', userId);
        } else if ((credits.credits_used || 0) >= (credits.monthly_limit || 3)) {
          return res.status(429).json({ error: 'Monthly submission limit reached. Upgrade for more credits.' });
        }
      }

      const { data, error } = await supabaseClient.from('playlist_submissions').insert({
        user_id: userId, artist_name: artistName, track_title: trackTitle,
        genre, bpm, mood_tags, description, quality_score, quality_feedback,
        status: quality_score && quality_score >= 50 ? 'approved' : 'pending',
      }).select().single();

      if (error) throw error;

      // Increment credits using upsert to handle concurrent requests safely
      if (credits) {
        const newUsed = (credits.month === month ? (credits.credits_used || 0) : 0) + 1;
        await supabaseClient.from('submission_credits').upsert({
          user_id: userId, credits_used: newUsed, month,
        }, { onConflict: 'user_id' });
      } else {
        await supabaseClient.from('submission_credits').insert({ user_id: userId, credits_used: 1, month });
      }

      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Get remaining credits
  app.get("/api/playlist/credits/:userId", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data } = await supabaseClient.from('submission_credits').select('*').eq('user_id', req.params.userId).single();
      const month = new Date().toISOString().substring(0, 7);
      if (!data || data.month !== month) {
        return res.json({ monthly_limit: 3, credits_used: 0, remaining: 3, month });
      }
      res.json({
        monthly_limit: data.monthly_limit,
        credits_used: data.credits_used,
        remaining: data.monthly_limit - (data.credits_used || 0),
        month: data.month,
      });
    } catch (err: any) {
      log('error', 'Playlist credits lookup failed:', err.message);
      res.status(500).json({ error: 'Credits lookup failed' });
    }
  });

  // ================================================================
  // EXCLUSIVE LICENSE OFFERS
  // ================================================================

  // Create an exclusive license offer
  app.post("/api/license/exclusive-offer", requireAdmin, async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { track_id, artist_id, licensee_name, offer_amount, pro_split, mechanical_split, publishing_split, terms } = req.body;
      if (!track_id || !artist_id || !licensee_name || !offer_amount) {
        return res.status(400).json({ error: 'track_id, artist_id, licensee_name, offer_amount required' });
      }

      const amount = parseFloat(offer_amount);
      const ncsoundCut = amount * SPLIT.NCSOUND;
      const artistPayout = amount * SPLIT.ARTIST;

      const { data, error } = await supabaseClient.from('exclusive_offers').insert({
        track_id, artist_id, licensee_name, offer_amount: amount,
        ncsound_cut: ncsoundCut, artist_payout: artistPayout,
        pro_split: pro_split || 50, mechanical_split: mechanical_split || 50,
        publishing_split: publishing_split || 50, terms,
        status: 'pending',
      }).select().single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Get exclusive offers for a track
  app.get("/api/license/exclusive-offers/:trackId", async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data } = await supabaseClient.from('exclusive_offers').select('*').eq('track_id', req.params.trackId).order('created_at', { ascending: false });
      res.json(data || []);
    } catch (err: any) {
      log('error', 'Exclusive offers lookup failed:', err.message);
      res.status(500).json({ error: 'Exclusive offers lookup failed' });
    }
  });

  // ================================================================
  // NCSOUND STORY — Graphic Novel Download
  // ================================================================
  app.get("/api/story/download", async (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>NcSound Story — Volume I</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #e5e5e5; font-family: 'Courier Prime', monospace; padding: 40px; }
  .page { max-width: 800px; margin: 0 auto 60px; padding: 40px; border: 1px solid #1a1a1a; background: #0d0d0d; position: relative; page-break-after: always; }
  h1 { font-size: 48px; text-transform: uppercase; letter-spacing: 4px; color: #fff; margin-bottom: 10px; }
  .subtitle { font-size: 32px; color: #f97316; margin-bottom: 30px; }
  .chapter-label { font-size: 11px; letter-spacing: 3px; color: #f97316; text-transform: uppercase; margin-bottom: 10px; }
  h2 { font-size: 28px; text-transform: uppercase; letter-spacing: 2px; color: #fff; margin-bottom: 20px; }
  p { font-size: 14px; line-height: 1.8; color: #aaa; margin-bottom: 16px; }
  .panel { border-left: 2px solid #f97316; padding-left: 20px; margin: 20px 0; }
  .page-num { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #1a1a1a; font-size: 11px; color: #444; }
  .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #555; }
  .covernote { color: #666; font-size: 12px; text-align: center; margin-top: 40px; }
  .divider { text-align: center; color: #f97316; margin: 30px 0; font-size: 20px; }
  @media print { body { padding: 0; } .page { border: none; page-break-after: always; } }
</style></head><body>
<div class="page">
  <h1>NcSound</h1>
  <div class="subtitle">Volume I: The Foundation</div>
  <div class="covernote">The Origin Story<br>NcSound Publishing est. 2024<br><br>Raleigh, North Carolina</div>
</div>
<div class="page">
  <div class="chapter-label">Prologue</div>
  <h2>The Foundation</h2>
  <p>Every empire starts with a single brick. NcSound Publishing was born not in a boardroom, but in the bedroom of a producer who refused to accept the limitations placed on independent artists. In Raleigh, North Carolina — a city caught between the hip-hop Mecca of New York and the trap dynasty of Atlanta — a new sound was waiting to be forged.</p>
  <p>Terrence Perry II, known in the streets and on the boards as Tap919, had spent years watching talented producers get exploited. Beats sold for pocket change. Publishing signed away for nothing. Sync placements that could change lives going to the same five major-label acts.</p>
  <p>The system wasn't broken — it was designed that way. And someone had to redesign it.</p>
  <div class="page-num">— 1 —</div>
</div>
<div class="page">
  <div class="chapter-label">Chapter I</div>
  <h2>The Beat Builder</h2>
  <p>Tap919 cut his teeth in the NC underground, building beats in FL Studio until 3 AM, layering 808s and samples into something that felt like the future. His early work caught the attention of DJ Skullator, a veteran curator with ears tuned to what's next.</p>
  <p>Together, they started building a network. Not just of producers, but of artists, engineers, videographers, and most importantly — music supervisors looking for fresh sounds.</p>
  <div class="panel">The vision was clear: create a publishing platform that treats artists like partners, not products. Non-exclusive deals. 80/20 splits in favor of the creator. And a pipeline directly to the people who place music in TV, film, and advertising.</div>
  <p>No one was doing this for the independent producer. Until now.</p>
  <div class="page-num">— 2 —</div>
</div>
<div class="page">
  <div class="chapter-label">Chapter II</div>
  <h2>The Roster</h2>
  <p>The roster grew organically. Mr. Niro (David Irby) brought raw lyricism and street narratives that demanded to be heard. A.R.T. Productions brought the hard-hitting boom bap that makes NC hip-hop distinct. Each artist added a new color to the palette.</p>
  <p>But NcSound wasn't just about collecting talent — it was about activating it. Every track uploaded to the platform became eligible for sync licensing. Every producer got access to a growing network of music supervisors. Every beat sold in the store came with automatic placement opportunity.</p>
  <p>The Roster wasn't a list. It was a movement.</p>
  <div class="page-num">— 3 —</div>
</div>
<div class="page">
  <div class="chapter-label">Chapter III</div>
  <h2>The Technology</h2>
  <p>NcSound Publishing was built from the ground up as a technology-first publishing platform. Not just a website — a complete operating system for the independent musician's career.</p>
  <p>AI-powered brief matching connects producer catalogs to supervisor needs in real-time. Automated royalty tracking aggregates income across all platforms. CWR generation streamlines PRO registration. Stripe Connect enables instant payouts. The platform handles the business so artists can focus on the music.</p>
  <p>It's publishing administration reimagined for the 21st century — where AI handles the paperwork and humans handle the creativity.</p>
  <div class="page-num">— 4 —</div>
</div>
<div class="page">
  <div class="chapter-label">Chapter IV</div>
  <h2>The Future</h2>
  <p>The story of NcSound is still being written. With a growing catalog of tracks, a network of supervisors spanning film, television, and advertising, and technology that gets smarter every day — the foundation is laid for something bigger.</p>
  <p>The goal: become the go-to publishing partner for independent producers across the Southeast and beyond. Build a catalog that competes with major publishers while keeping artist ownership intact. Prove that the independent model isn't just viable — it's superior.</p>
  <p>This isn't just a publishing company. It's proof that the streets can build their own system. Their own infrastructure. Their own future.</p>
  <p>The sound of North Carolina is about to be heard everywhere.</p>
  <div class="page-num">— 5 —</div>
</div>
<div class="page" style="text-align:center">
  <p style="font-size:24px;color:#f97316;margin-top:60px">To Be Continued...</p>
  <p style="margin-top:20px;color:#555">NcSound Publishing — Raleigh, NC</p>
  <p style="margin-top:40px;color:#444;font-size:11px">ncsound.com</p>
</div>
</body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename="ncsound-story-volume-I.html"');
    res.send(html);
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

    app.get('/api/*', (_req, res) => {
      res.status(404).json({ error: 'API endpoint not found' });
    });

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Sentry error handler must be last middleware
  if (process.env.SENTRY_DSN) Sentry.setupExpressErrorHandler(app);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
