import { Router, type RequestHandler } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

interface IntegrationsRouterDeps {
  supabaseClient: SupabaseClient | null;
  requireAdmin: RequestHandler;
  sanitizeError: (err: unknown) => string;
  getSupabase: () => Promise<SupabaseClient>;
  isAllowedUrl: (url: string) => boolean;
}

export function createIntegrationsRouter({
  requireAdmin,
  sanitizeError,
  getSupabase,
}: IntegrationsRouterDeps): Router {
  const router = Router();

  // Upsert integration config
  router.post('/config', requireAdmin, async (req, res) => {
    try {
      const { platform, config_key, config_value, artist_id } = req.body;
      if (!platform || !config_key || !config_value) {
        return res.status(400).json({ error: 'platform, config_key, and config_value required' });
      }
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('integration_configs')
        .upsert(
          {
            platform,
            config_key,
            config_value,
            artist_id: artist_id || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'platform,config_key,artist_id' }
        )
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // List configs
  router.get('/configs', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      let query = supabase.from('integration_configs').select('*').order('platform');
      if (req.query.platform) query = query.eq('platform', req.query.platform as string);
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Delete config
  router.delete('/config/:id', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('integration_configs').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Income summary
  router.get('/summary', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { artist_id, period_start, period_end } = req.query;
      let query = supabase.from('income_summary').select('*');
      if (artist_id) query = query.eq('artist_id', artist_id as string);
      if (period_start) query = query.gte('period_start', period_start as string);
      if (period_end) query = query.lte('period_end', period_end as string);
      query = query.order('period_start', { ascending: false }).limit(100);
      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Per-track income
  router.get('/track/:trackId', requireAdmin, async (req, res) => {
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

  // Manual platform income
  router.post('/platform-income', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const {
        track_id,
        artist_id,
        platform,
        period_start,
        period_end,
        stream_count,
        download_count,
        gross_revenue,
        net_revenue,
        currency,
        metadata,
      } = req.body;
      if (!track_id || !artist_id || !platform || !period_start || !period_end) {
        return res
          .status(400)
          .json({ error: 'track_id, artist_id, platform, period_start, period_end required' });
      }
      const { data, error } = await supabase
        .from('platform_income')
        .upsert(
          {
            track_id,
            artist_id,
            platform,
            period_start,
            period_end,
            stream_count: stream_count || 0,
            download_count: download_count || 0,
            gross_revenue: gross_revenue || 0,
            net_revenue: net_revenue || 0,
            currency: currency || 'USD',
            metadata: metadata || {},
            synced_at: new Date().toISOString(),
          },
          { onConflict: 'track_id,platform,period_start,period_end' }
        )
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Royalty collection
  router.post('/royalty-collection', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const {
        artist_id,
        collection_entity,
        period_start,
        period_end,
        source_type,
        gross_amount,
        net_amount,
        fee_amount,
        currency,
        statement_url,
        notes,
      } = req.body;
      if (!artist_id || !collection_entity || !period_start || !period_end) {
        return res
          .status(400)
          .json({ error: 'artist_id, collection_entity, period_start, period_end required' });
      }
      const { data, error } = await supabase
        .from('royalty_collections')
        .insert({
          artist_id,
          collection_entity,
          period_start,
          period_end,
          source_type: source_type || 'other',
          gross_amount: gross_amount || 0,
          net_amount: net_amount || 0,
          fee_amount: fee_amount || 0,
          currency: currency || 'USD',
          statement_url,
          notes,
        })
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Split calculation
  router.get('/splits/:trackId', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const incomeAmount = req.query.income ? parseFloat(req.query.income as string) : 0;

      const { data: track, error: trackErr } = await supabase
        .from('tracks')
        .select('*, track_writers(*)')
        .eq('id', req.params.trackId)
        .single();
      if (trackErr) throw trackErr;

      const trackTitle = track.title;
      const writers = track.track_writers || [];
      const splits = (writers as any[]).map((w: any) => {
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

      res.json({
        track_id: req.params.trackId,
        track_title: trackTitle,
        total_income: incomeAmount,
        splits,
      });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Spotify OAuth + sync
  router.post('/spotify/sync', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: configs } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('platform', 'spotify');
      const clientId = configs?.find((c: any) => c.config_key === 'client_id')?.config_value;
      const clientSecret = configs?.find((c: any) => c.config_key === 'client_secret')?.config_value;
      if (!clientId || !clientSecret) {
        return res
          .status(400)
          .json({ error: 'Spotify credentials not configured. Add client_id and client_secret in Integrations tab.' });
      }

      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
        body: 'grant_type=client_credentials',
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok)
        throw new Error(`Spotify auth failed: ${tokenData.error_description || tokenData.error}`);

      res.json({ message: 'Spotify connected successfully. Token acquired.', records: 0 });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // SoundCloud sync
  router.post('/soundcloud/sync', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: configs } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('platform', 'soundcloud');
      const clientId = configs?.find((c: any) => c.config_key === 'client_id')?.config_value;
      if (!clientId) return res.status(400).json({ error: 'SoundCloud client_id not configured' });
      res.json({ message: 'SoundCloud integration configured.', records: 0 });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Bandcamp sync
  router.post('/bandcamp/sync', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: configs } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('platform', 'bandcamp');
      const bandcampUrl =
        configs?.find((c: any) => c.config_key === 'bandcamp_url')?.config_value ||
        'https://ncsound.bandcamp.com';

      const response = await fetch(`${bandcampUrl}/music`);
      if (!response.ok) throw new Error(`Bandcamp page returned ${response.status}`);
      res.json({ message: `Bandcamp page reachable at ${bandcampUrl}`, records: 0 });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // CWR generate — uploads to Supabase Storage and returns a signed URL
  router.post('/cwr/generate', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data: tracks, error: tErr } = await supabase
        .from('tracks')
        .select('*, artists(stage_name), track_writers(*)')
        .eq('status', 'active');
      if (tErr) throw tErr;

      if (!tracks || tracks.length === 0) {
        return res.status(400).json({ error: 'No active tracks to export' });
      }

      const cwrLines: string[] = [];
      cwrLines.push(
        'HDR',
        `NcSound Publishing CWR Export ${new Date().toISOString().split('T')[0]}`,
        '',
        ''
      );
      let recordCount = 0;

      for (const t of tracks as any[]) {
        recordCount++;
        const isrc = t.isrc || '';
        const title = (t.title || '').substring(0, 50);
        const artistName = (t.artists?.stage_name || 'Unknown').substring(0, 50);
        const writers = (t.track_writers || [])
          .map((w: any) => w.writer_name)
          .join(', ')
          .substring(0, 80);

        cwrLines.push(
          `NWN\t${isrc}\t${title}\t${artistName}\t${writers}\t${t.genre || ''}\t${t.duration || ''}`
        );
      }

      const cwrContent = cwrLines.join('\n');
      const fileName = `ncsound-cwr-${Date.now()}.txt`;

      const { data: exportRec, error: eErr } = await supabase
        .from('cwr_exports')
        .insert({
          export_type: 'new_works',
          file_name: fileName,
          record_count: recordCount,
          status: 'draft',
        })
        .select()
        .single();
      if (eErr) throw eErr;

      for (const t of tracks as any[]) {
        await supabase.from('cwr_export_tracks').insert({
          cwr_export_id: exportRec.id,
          track_id: t.id,
          transaction_type: 'NWN',
        });
      }

      const bucketName = 'cwr-exports';
      const filePathInStorage = `cwr/${exportRec.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePathInStorage, cwrContent, { contentType: 'text/plain', upsert: true });
      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePathInStorage, 3600);
      if (signedUrlError) throw signedUrlError;

      res.json({
        id: exportRec.id,
        file_name: fileName,
        record_count: recordCount,
        signed_url: signedUrlData.signedUrl,
      });
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // CWR list
  router.get('/cwr/exports', requireAdmin, async (req, res) => {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('cwr_exports')
        .select('*, cwr_export_tracks(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // Placeholder sync handlers for other platforms
  const SYNC_PLATFORMS = [
    'ascap',
    'bmi',
    'sesac',
    'soundexchange',
    'songtrust',
    'hfa',
    'tuneregistry',
    'apple_music',
  ];
  for (const pf of SYNC_PLATFORMS) {
    router.post(`/${pf}/sync`, async (req, res) => {
      res.json({
        message: `${pf.toUpperCase()} integration configured. Manual statement entry available in dashboard.`,
        records: 0,
      });
    });
  }

  return router;
}