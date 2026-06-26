import { Router, type RequestHandler } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

interface CwrDdexRouterDeps {
  supabaseClient: SupabaseClient | null;
  requireAdmin: RequestHandler;
  sanitizeError: (err: unknown) => string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `PT${m}M${s}S`;
}

export function createCwrDdexRouter({
  supabaseClient,
  requireAdmin,
  sanitizeError,
}: CwrDdexRouterDeps): Router {
  const router = Router();

  // CWR 2.2 compliant export (streams as text/plain attachment)
  router.post('/v2/generate', requireAdmin, async (_req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { data: tracks } = await supabaseClient
        .from('tracks')
        .select('*, artists(stage_name, ipi_number), track_writers(*)')
        .eq('status', 'active');
      if (!tracks?.length) return res.status(400).json({ error: 'No active tracks' });

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const lines: string[] = [];

      // HDR + GRH records
      lines.push(
        `HDR${dateStr}${' '.repeat(40)}NcSound Publishing${' '.repeat(55)}${' '.repeat(8)}NWN${' '.repeat(49)}${' '.repeat(8)}N`
      );
      lines.push(`GRH${' '.repeat(119)}`);

      for (const t of tracks as any[]) {
        const title = (t.title || 'UNTITLED').substring(0, 50);
        const iswc = t.iswc || '';
        const isrc = t.isrc || '';

        // NWR (Work) record
        lines.push(
          [
            'NWR',
            'N',
            '00',
            'E',
            title.padEnd(50),
            iswc.padEnd(14),
            '  ',
            '00',
            '00',
            '00',
            isrc.padEnd(14),
            'N',
          ].join('')
        );

        // Writers (WRN records)
        for (const w of t.track_writers || []) {
          const writerName = (w.writer_name || '').substring(0, 30);
          const ipi = (w.ipi_number || '').substring(0, 11);
          const pro = (w.pro_affiliation || 'ASCAP').substring(0, 5);
          const ws = parseFloat(w.writer_share) || 0;
          const ps = parseFloat(w.publisher_share) || 0;
          lines.push(
            `WRN${writerName.padEnd(30)}${ipi.padEnd(11)}${pro.padEnd(5)}${String(ws).padStart(7)}${String(ps).padStart(7)}`
          );
        }
      }

      lines.push(`UTR${' '.repeat(119)}`);
      const cwr = lines.join('\r\n');
      const fileName = `ncsound-cwr-v2-${Date.now()}.txt`;

      const { data: exportRec } = await supabaseClient
        .from('cwr_exports')
        .insert({
          export_type: 'new_works',
          file_name: fileName,
          record_count: tracks.length,
          status: 'draft',
        })
        .select()
        .single();

      for (const t of tracks as any[]) {
        await supabaseClient
          .from('cwr_export_tracks')
          .insert({
            cwr_export_id: exportRec.id,
            track_id: t.id,
            transaction_type: 'NWN',
          });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(cwr);
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  // DDEX ERN 4.3 XML
  router.post('/ddex/generate', requireAdmin, async (req, res) => {
    try {
      if (!supabaseClient) return res.status(500).json({ error: 'Database not configured' });
      const { trackIds } = req.body;
      if (!trackIds?.length) return res.status(400).json({ error: 'trackIds required' });

      const { data: tracks } = await supabaseClient
        .from('tracks')
        .select('*, artists(stage_name), track_writers(*)')
        .in('id', trackIds);
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
        ${(tracks as any[])
          .map((_: any, i: number) => `<ReleaseResourceReference>T${i + 1}</ReleaseResourceReference>`)
          .join('\n        ')}
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
    } catch (err: any) {
      res.status(500).json({ error: sanitizeError(err) });
    }
  });

  return router;
}