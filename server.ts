import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import 'dotenv/config';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

async function startServer() {
  // Env validation
  const requiredVars: { key: string; name: string }[] = [
    { key: 'VITE_SUPABASE_URL', name: 'Supabase URL' },
    { key: 'VITE_SUPABASE_ANON_KEY', name: 'Supabase Anon Key' },
  ];
  const missingVars = requiredVars.filter(v => !process.env[v.key]);
  if (missingVars.length > 0) {
    console.warn(`⚠ Missing env vars: ${missingVars.map(v => `${v.key} (${v.name})`).join(', ')}`);
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

  // Rate limiting — webhook is excluded (Stripe retries must not be throttled)
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

        const { beatId, title } = session.metadata || {};
        if (beatId && title) {
          await supabase.from('beat_store_orders').insert({
            product_id: beatId,
            buyer_email: session.customer_details?.email || 'unknown',
            license_type: 'lease',
            amount_paid: (session.amount_total || 0) / 100,
            stripe_payment_id: session.id,
          });
          console.log(`Order fulfilled: ${title} (session ${session.id})`);
        }
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

  // YouTube Feed — fetches latest videos and live status from a channel
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
