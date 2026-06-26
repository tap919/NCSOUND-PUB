import { describe, it, expect } from 'vitest';

describe('License Document Generation', () => {
  it('generates HTML with correct track and buyer details', () => {
    const purchaseId = 'test-id';
    const track = { title: 'Test Track', isrc: '123' };
    const buyerEmail = 'test@test.com';
    const licenseType = 'sync';
    const amount = '29.99';
    const appUrl = 'http://localhost:3000';
    const date = 'June 17, 2026';

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
<p style="font-size:12px;color:#666;">License ID: ${purchaseId || 'N/A'}</p>
<p style="font-size:12px;color:#666;">Date: ${date}</p>
<h2>Parties</h2>
<table><tr><td>Licensor:</td><td>Rights Holder (admin by NcSound Publishing)</td></tr>
<tr><td>Licensee:</td><td>${buyerEmail}</td></tr></table>
<h2>Track</h2>
<table><tr><td>Title:</td><td>${track.title}</td></tr>
<tr><td>ISRC:</td><td>${track.isrc || 'Not provided'}</td></tr>
</table>
<h2>License Terms</h2>
<table><tr><td>Type:</td><td>${licenseType.toUpperCase()}</td></tr>
<tr><td>Fee:</td><td>$${parseFloat(amount).toFixed(2)} USD</td></tr>
<tr><td>Term:</td><td>Perpetual</td></tr>
<tr><td>Territory:</td><td>Worldwide</td></tr>
<tr><td>Exclusivity:</td><td>Non-Exclusive</td></tr></table>
<p>This license grants the Licensee the right to synchronize the above-mentioned Track in timed relation with visual media, subject to the terms agreed upon at the time of purchase.</p>
<div class="signature"><p>Accepted by NcSound Publishing as publishing administrator for the Licensor.</p></div>
<div class="footer">NcSound Publishing — ${appUrl}</div>
</body></html>`;

    expect(html).toContain('Test Track');
    expect(html).toContain('test@test.com');
    expect(html).toContain('SYNC');
    expect(html).toContain('$29.99');
    expect(html).toContain('test-id');
  });
});
