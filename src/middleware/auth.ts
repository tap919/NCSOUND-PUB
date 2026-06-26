import type { Request, Response, NextFunction } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createRequireAdmin(supabaseClient: SupabaseClient | null) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const adminApiKey = process.env.ADMIN_API_KEY;
    if (adminApiKey && req.headers['x-api-key'] === adminApiKey) {
      console.warn(`[AUTH] Admin API key used from ${req.ip} at ${new Date().toISOString()}`);
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!supabaseClient) {
      return res.status(500).json({ error: 'Auth service not configured' });
    }

    const token = authHeader.slice(7);
    const { data, error } = await supabaseClient.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const appRole = data.user.app_metadata?.role;
    if (appRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  };
}
