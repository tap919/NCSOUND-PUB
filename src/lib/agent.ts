// AI Agent System — tool-calling agent that performs tasks via natural language

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (args: Record<string, string>) => Promise<string>;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_call?: { name: string; args: Record<string, string>; result?: string };
}

export interface AgentRequest {
  messages: AgentMessage[];
  context?: {
    userId?: string;
    artistId?: string;
    role?: string;
  };
}

// Available tools the agent can use
const TOOLS: AgentTool[] = [
  {
    name: 'get_income_summary',
    description: 'Get total income across all platforms and royalties for an artist',
    parameters: {
      artist_id: { type: 'string', description: 'Artist UUID', required: true },
      period: { type: 'string', description: 'Period filter (e.g. "2024-01" or "all")' },
    },
    execute: async (args) => {
      const qs = new URLSearchParams({ artist_id: args.artist_id });
      if (args.period && args.period !== 'all') {
        qs.set('period_start', `${args.period}-01`);
        qs.set('period_end', `${args.period}-31`);
      }
      const res = await fetch(`/api/integrations/summary?${qs}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return 'No income data found.';
      const total = data.reduce((s: number, i: any) => s + (parseFloat(i.net_amount) || 0), 0);
      const platforms = [...new Set(data.map((i: any) => i.source))];
      return `Total income: $${total.toFixed(2)} across ${platforms.length} platforms (${platforms.join(', ')}). ${data.length} records found.`;
    },
  },
  {
    name: 'get_track_splits',
    description: 'Calculate royalty splits for a specific track',
    parameters: {
      track_id: { type: 'string', description: 'Track UUID', required: true },
      income: { type: 'string', description: 'Total income amount to split (optional)' },
    },
    execute: async (args) => {
      const qs = args.income ? `?income=${args.income}` : '';
      const res = await fetch(`/api/integrations/splits/${args.track_id}${qs}`);
      if (!res.ok) throw new Error('Track not found');
      const data = await res.json();
      if (!data.splits?.length) return `Track "${data.track_title}" has no writers configured.`;
      const lines = data.splits.map((s: any) =>
        `• ${s.writer_name}: ${s.writer_share}% writer ($${s.writer_payout.toFixed(2)}) + ${s.publisher_share}% publisher ($${s.publisher_payout.toFixed(2)})`
      );
      return `Splits for "${data.track_title}":\n${lines.join('\n')}\nTotal income: $${data.total_income.toFixed(2)}`;
    },
  },
  {
    name: 'generate_cwr',
    description: 'Generate a CWR (Common Works Registration) export for all active tracks',
    parameters: {},
    execute: async () => {
      const res = await fetch('/api/integrations/cwr/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return `CWR generation failed: ${data.error}`;
      return `CWR export generated: "${data.file_name}" with ${data.record_count} works. Ready for download.`;
    },
  },
  {
    name: 'get_registration_status',
    description: 'Check PRO/MLC registration status for an artist',
    parameters: {
      artist_id: { type: 'string', description: 'Artist UUID', required: true },
    },
    execute: async (args) => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      const { data: tracks } = await supabase.from('tracks').select('id,title').eq('artist_id', args.artist_id);
      if (!tracks?.length) return 'No tracks found for this artist.';
      const trackIds = tracks.map(t => t.id);
      const { data: regs } = await supabase
        .from('registrations')
        .select('*, tracks(title)')
        .in('track_id', trackIds)
        .order('created_at', { ascending: false });
      if (!regs?.length) return 'No registrations found. Tracks have not been submitted to any registry yet.';
      const byStatus: Record<string, string[]> = { registered: [], pending: [], rejected: [] };
      for (const r of regs) {
        const t = (r as any).tracks?.title || 'Unknown';
        byStatus[r.status] = byStatus[r.status] || [];
        byStatus[r.status].push(`${t} @ ${r.registry}`);
      }
      const parts: string[] = [];
      if (byStatus.registered?.length) parts.push(`✅ Registered: ${byStatus.registered.length} (${byStatus.registered.join(', ')})`);
      if (byStatus.pending?.length) parts.push(`⏳ Pending: ${byStatus.pending.length} (${byStatus.pending.join(', ')})`);
      if (byStatus.rejected?.length) parts.push(`❌ Rejected: ${byStatus.rejected.length} (${byStatus.rejected.join(', ')})`);
      return parts.join('\n') || 'No registration data found.';
    },
  },
  {
    name: 'get_catalog_stats',
    description: 'Get catalog statistics for an artist or admin',
    parameters: {
      artist_id: { type: 'string', description: 'Artist UUID (optional for admin)' },
    },
    execute: async (args) => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      let query = supabase.from('tracks').select('*', { count: 'exact', head: true });
      if (args.artist_id) query = query.eq('artist_id', args.artist_id);
      const { count } = await query;
      return `Total tracks: ${count || 0}. ${args.artist_id ? 'Artist catalog' : 'Global catalog'}.`;
    },
  },
  {
    name: 'send_notification_email',
    description: 'Send a notification email to an artist or supervisor',
    parameters: {
      to: { type: 'string', description: 'Recipient email address', required: true },
      subject: { type: 'string', description: 'Email subject line', required: true },
      message: { type: 'string', description: 'Email body text', required: true },
    },
    execute: async (args) => {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: args.to,
          subject: args.subject,
          html: `<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:24px;border:1px solid #333;max-width:600px;margin:0 auto"><p>${args.message.replace(/\n/g, '<br>')}</p></div>`,
        }),
      });
      if (!res.ok) throw new Error('Email send failed');
      return `Email sent to ${args.to} with subject "${args.subject}".`;
    },
  },
  {
    name: 'get_integration_status',
    description: 'Check which 3rd party integrations are configured and their status',
    parameters: {},
    execute: async () => {
      const res = await fetch('/api/integrations/configs');
      const configs = await res.json();
      if (!Array.isArray(configs) || configs.length === 0) return 'No integrations configured. Visit Admin > Integrations to set up API keys.';
      const byPlatform: Record<string, string[]> = {};
      for (const c of configs) {
        byPlatform[c.platform] = byPlatform[c.platform] || [];
        byPlatform[c.platform].push(c.config_key);
      }
      const lines = Object.entries(byPlatform).map(([p, keys]) => `• ${p}: ${keys.length} key(s) configured`);
      return `${Object.keys(byPlatform).length} platform(s) configured:\n${lines.join('\n')}`;
    },
  },
  {
    name: 'add_platform_income',
    description: 'Record platform income data (streams, revenue) for a track',
    parameters: {
      track_id: { type: 'string', description: 'Track UUID', required: true },
      artist_id: { type: 'string', description: 'Artist UUID', required: true },
      platform: { type: 'string', description: 'Platform name (spotify, soundcloud, bandcamp, etc.)', required: true },
      streams: { type: 'string', description: 'Number of streams' },
      gross: { type: 'string', description: 'Gross revenue amount' },
      net: { type: 'string', description: 'Net revenue amount' },
    },
    execute: async (args) => {
      const now = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/integrations/platform-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: args.track_id,
          artist_id: args.artist_id,
          platform: args.platform,
          period_start: `${now.substring(0, 7)}-01`,
          period_end: now,
          stream_count: parseInt(args.streams) || 0,
          gross_revenue: parseFloat(args.gross) || 0,
          net_revenue: parseFloat(args.net) || 0,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return `Income recorded for ${args.platform}: ${args.streams || 0} streams, $${parseFloat(args.net || '0').toFixed(2)} net.`;
    },
  },
];

// Process agent messages with Gemini
export async function processAgentMessage(request: AgentRequest): Promise<AgentMessage> {
  const { messages, context } = request;

  // Build system prompt describing available tools
  const toolDescriptions = TOOLS.map(t => {
    const params = Object.entries(t.parameters).map(([k, v]) =>
      `  - ${k} (${v.type})${(v as any).required ? ' [required]' : ''}: ${v.description}`
    ).join('\n');
    return `### ${t.name}\n${t.description}\nParameters:\n${params || '  (none)'}`;
  }).join('\n\n');

  const systemPrompt = `You are an AI assistant for NcSound Publishing, a music publishing administration and sync licensing platform.

You help artists and administrators manage their catalog, track income, calculate splits, generate CWR exports, check registration status, send emails, and configure integrations.

You have the following tools available:
${toolDescriptions}

When a user asks you to do something, decide which tool to call. If you need more information, ask for it. 
Respond conversationally but concisely. When you use a tool, explain what you're doing and summarize the result.

User context: ${JSON.stringify(context || {})}`;

  // Call Gemini with the conversation history + system prompt
  const geminiRes = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `${systemPrompt}\n\nConversation:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n\nASSISTANT: Decide if you need to call a tool. If yes, respond with EXACTLY: TOOL: tool_name | param1=val1 | param2=val2\nIf no tool needed, respond normally.`,
    }),
  });
  const geminiData = await geminiRes.json();
  const responseText = geminiData.text || '';

  // Check if the AI wants to call a tool
  const toolMatch = responseText.match(/TOOL:\s*(\w+)\s*\|\s*(.*)/);
  if (toolMatch) {
    const toolName = toolMatch[1];
    const argsStr = toolMatch[2];
    const tool = TOOLS.find(t => t.name === toolName);

    if (tool) {
      // Parse arguments
      const args: Record<string, string> = {};
      const argPairs = argsStr.split('|').map(s => s.trim());
      for (const pair of argPairs) {
        const eqIdx = pair.indexOf('=');
        if (eqIdx > 0) {
          const key = pair.substring(0, eqIdx).trim();
          const val = pair.substring(eqIdx + 1).trim();
          if (key) args[key] = val;
        }
      }

      try {
        const result = await tool.execute(args);
        return {
          role: 'assistant',
          content: result,
          tool_call: { name: toolName, args, result },
        };
      } catch (err: any) {
        return {
          role: 'assistant',
          content: `Error calling ${toolName}: ${err.message}`,
          tool_call: { name: toolName, args, result: `Error: ${err.message}` },
        };
      }
    }
  }

  return { role: 'assistant', content: responseText };
}

export function getToolList(): AgentTool[] {
  return TOOLS;
}
