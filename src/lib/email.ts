// Email Service — transactional notifications via Resend

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
}

// Template types
export interface DealNotification {
  artistName: string;
  trackTitle: string;
  licenseeName: string;
  syncFee: number;
  artistPayout: number;
  dealDate: string;
}

export interface RoyaltyNotification {
  artistName: string;
  period: string;
  grossAmount: number;
  netPayout: number;
  statementUrl?: string;
}

export interface ProRegistrationNotification {
  artistName: string;
  trackTitle: string;
  registry: string;
  status: string;
  iswc?: string;
}

// Send email via API
export async function sendEmail(payload: EmailPayload): Promise<{ id: string }> {
  const res = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Email send failed' }));
    throw new Error(err.error);
  }
  return res.json();
}

// === Email Templates ===

export function dealNotificationEmail(data: DealNotification): EmailPayload {
  return {
    to: '', // caller fills recipient
    subject: `🎬 Sync Deal Placed: "${data.trackTitle}" — $${data.syncFee.toFixed(2)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border:1px solid #333;padding:32px">
        <div style="border-bottom:2px solid #f97316;padding-bottom:16px;margin-bottom:24px">
          <h1 style="font-size:18px;letter-spacing:2px;text-transform:uppercase;color:#f97316">NcSound Publishing</h1>
        </div>
        <h2 style="font-size:22px;margin:0 0 8px">Sync Deal Confirmed</h2>
        <p style="color:#aaa;margin:0 0 24px">Your track has been placed in a sync licensing deal.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#888">Track</td><td style="padding:8px 0;font-weight:bold;text-transform:uppercase">${data.trackTitle}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Licensee</td><td style="padding:8px 0">${data.licenseeName}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Date</td><td style="padding:8px 0">${data.dealDate}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Sync Fee</td><td style="padding:8px 0;font-family:monospace">$${data.syncFee.toFixed(2)}</td></tr>
          <tr><td style="padding:8px 0;color:#888;border-top:1px solid #333">Your Payout (80%)</td><td style="padding:8px 0;border-top:1px solid #333;font-family:monospace;color:#22c55e">$${data.artistPayout.toFixed(2)}</td></tr>
        </table>
        <p style="color:#555;font-size:12px;margin-top:24px">Payout will be processed within 30 days via Stripe Connect.</p>
      </div>`,
  };
}

export function royaltyStatementEmail(data: RoyaltyNotification): EmailPayload {
  return {
    to: '',
    subject: `Royalty Statement Available — ${data.period} ($${data.netPayout.toFixed(2)})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border:1px solid #333;padding:32px">
        <div style="border-bottom:2px solid #f97316;padding-bottom:16px;margin-bottom:24px">
          <h1 style="font-size:18px;letter-spacing:2px;text-transform:uppercase;color:#f97316">NcSound Publishing</h1>
        </div>
        <h2 style="font-size:22px;margin:0 0 8px">Royalty Statement</h2>
        <p style="color:#aaa;margin:0 0 24px">Your royalty statement for ${data.period} is ready.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#888">Period</td><td style="padding:8px 0">${data.period}</td></tr>
          <tr><td style="padding:8px 0;color:#888">Gross Revenue</td><td style="padding:8px 0;font-family:monospace">$${data.grossAmount.toFixed(2)}</td></tr>
          <tr><td style="padding:8px 0;color:#888;border-top:1px solid #333">Net Payout</td><td style="padding:8px 0;border-top:1px solid #333;font-family:monospace;color:#22c55e">$${data.netPayout.toFixed(2)}</td></tr>
        </table>
        ${data.statementUrl ? `<a href="${data.statementUrl}" style="display:inline-block;margin-top:24px;background:#f97316;color:#000;padding:12px 24px;font-weight:bold;font-size:12px;letter-spacing:1px;text-transform:uppercase;text-decoration:none">View Statement</a>` : ''}
      </div>`,
  };
}

export function proRegistrationEmail(data: ProRegistrationNotification): EmailPayload {
  return {
    to: '',
    subject: `PRO Registration Update — ${data.trackTitle} (${data.registry})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border:1px solid #333;padding:32px">
        <div style="border-bottom:2px solid #f97316;padding-bottom:16px;margin-bottom:24px">
          <h1 style="font-size:18px;letter-spacing:2px;text-transform:uppercase;color:#f97316">NcSound Publishing</h1>
        </div>
        <h2 style="font-size:22px;margin:0 0 8px">Registration ${data.status === 'registered' ? 'Complete' : 'Update'}</h2>
        <p style="color:#aaa;margin:0 0 24px">Registration status for <strong>${data.trackTitle}</strong> at <strong>${data.registry}</strong>.</p>
        <div style="background:#1a1a1a;border:1px solid #333;padding:16px;margin-bottom:16px">
          <p style="margin:0 0 8px"><span style="color:#888">Status:</span> ${data.status === 'registered' ? '<span style="color:#22c55e">Registered</span>' : `<span style="color:#f97316">${data.status}</span>`}</p>
          ${data.iswc ? `<p style="margin:0;color:#888">ISWC: <span style="color:#fff;font-family:monospace">${data.iswc}</span></p>` : ''}
        </div>
      </div>`,
  };
}

export function onboardingEmail(artistName: string, appUrl?: string): EmailPayload {
  const origin = appUrl || process.env.APP_URL || 'http://localhost:3000';
  return {
    to: '',
    subject: `Welcome to NcSound Publishing, ${artistName}!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border:1px solid #333;padding:32px">
        <div style="border-bottom:2px solid #f97316;padding-bottom:16px;margin-bottom:24px">
          <h1 style="font-size:18px;letter-spacing:2px;text-transform:uppercase;color:#f97316">NcSound Publishing</h1>
        </div>
        <h2 style="font-size:22px;margin:0 0 8px">Welcome, ${artistName}!</h2>
        <p style="color:#aaa;margin:0 0 24px">Your publishing administration account is active. Here's what to do next:</p>
        <ol style="color:#ccc;line-height:2">
          <li><strong style="color:#fff">Upload tracks</strong> to your catalog via the Artist Dashboard</li>
          <li><strong style="color:#fff">Set up your PRO</strong> affiliation (ASCAP/BMI/SESAC) in your profile</li>
          <li><strong style="color:#fff">Connect Stripe</strong> to receive sync licensing payouts</li>
          <li><strong style="color:#fff">Link your platforms</strong> (Spotify, SoundCloud, Bandcamp) for income tracking</li>
        </ol>
        <a href="${origin}/artist/dashboard" style="display:inline-block;margin-top:16px;background:#f97316;color:#000;padding:12px 24px;font-weight:bold;font-size:12px;letter-spacing:1px;text-transform:uppercase;text-decoration:none">Go to Dashboard</a>
      </div>`,
  };
}
