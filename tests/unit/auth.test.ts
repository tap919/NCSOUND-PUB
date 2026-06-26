import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequireAdmin } from '../../src/middleware/auth';

type HeaderMap = Record<string, string>;
type Mw = (req: any, res: any, next: any) => any;

interface MockReq {
  headers: HeaderMap;
  ip?: string;
}
interface MockRes {
  statusCode: number;
  body: unknown;
  headers: HeaderMap;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function makeRes(): MockRes {
  const status = vi.fn();
  const json = vi.fn();
  const res: MockRes = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status,
    json,
  };
  (status as any).mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  (json as any).mockImplementation((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return res;
}

function makeReq(headers: HeaderMap = {}, ip = '127.0.0.1'): MockReq {
  return { headers, ip };
}

// Cast helper: our middleware only calls `auth.getUser(token)` so a partial mock is sufficient.
function asSupabase(mock: object): any {
  return mock;
}

async function runMw(mw: Mw, req: MockReq, res: MockRes) {
  const next = vi.fn();
  await mw(req, res, next);
  return next;
}

describe('createRequireAdmin middleware', () => {
  const originalEnv = process.env;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    warnSpy.mockRestore();
  });

  it('returns a function (middleware)', () => {
    const mw = createRequireAdmin(null);
    expect(typeof mw).toBe('function');
  });

  describe('with ADMIN_API_KEY set', () => {
    it('allows request when X-API-Key matches', async () => {
      process.env.ADMIN_API_KEY = 'secret-admin-key';
      const mw = createRequireAdmin(null);
      const req = makeReq({ 'x-api-key': 'secret-admin-key' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).toHaveBeenCalledOnce();
      expect(res.statusCode).toBe(200);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('rejects request when X-API-Key does not match', async () => {
      process.env.ADMIN_API_KEY = 'secret-admin-key';
      const mw = createRequireAdmin(null);
      const req = makeReq({ 'x-api-key': 'wrong-key' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Authentication required' });
    });

    it('falls through to bearer flow when X-API-Key is absent', async () => {
      process.env.ADMIN_API_KEY = 'secret-admin-key';
      const mw = createRequireAdmin(null);
      const req = makeReq({});
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
    });
  });

  describe('without ADMIN_API_KEY', () => {
    beforeEach(() => {
      delete process.env.ADMIN_API_KEY;
    });

    it('returns 401 when no Authorization header is present', async () => {
      const mw = createRequireAdmin(null);
      const req = makeReq({});
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Authentication required' });
    });

    it('returns 401 when Authorization does not start with "Bearer "', async () => {
      const mw = createRequireAdmin(null);
      const req = makeReq({ authorization: 'Basic abc123' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
    });

    it('returns 500 when supabase client is null and a bearer token is supplied', async () => {
      const mw = createRequireAdmin(null);
      const req = makeReq({ authorization: 'Bearer some.jwt.token' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Auth service not configured' });
    });

    it('returns 401 when Supabase getUser returns an error', async () => {
      const fakeSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } }),
        },
      };
      const mw = createRequireAdmin(asSupabase(fakeSupabase));
      const req = makeReq({ authorization: 'Bearer bad.token' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired token' });
    });

    it('returns 403 when token is valid but user is not admin', async () => {
      const fakeSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'u1', app_metadata: { role: 'artist' } } },
            error: null,
          }),
        },
      };
      const mw = createRequireAdmin(asSupabase(fakeSupabase));
      const req = makeReq({ authorization: 'Bearer good.token' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: 'Admin access required' });
    });

    it('returns 403 when app_metadata is missing', async () => {
      const fakeSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'u2', app_metadata: {} } },
            error: null,
          }),
        },
      };
      const mw = createRequireAdmin(asSupabase(fakeSupabase));
      const req = makeReq({ authorization: 'Bearer good.token' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
    });

    it('calls next() when user has admin role', async () => {
      const fakeSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin1', app_metadata: { role: 'admin' } } },
            error: null,
          }),
        },
      };
      const mw = createRequireAdmin(asSupabase(fakeSupabase));
      const req = makeReq({ authorization: 'Bearer admin.token' });
      const res = makeRes();
      const next = await runMw(mw, req, res);
      expect(next).toHaveBeenCalledOnce();
      expect(res.statusCode).toBe(200);
    });

    it('strips exactly 7 characters ("Bearer ") from the auth header before getUser', async () => {
      const getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'a', app_metadata: { role: 'admin' } } },
        error: null,
      });
      const fakeSupabase = { auth: { getUser } };
      const mw = createRequireAdmin(asSupabase(fakeSupabase));
      const req = makeReq({ authorization: 'Bearer XYZ-token-123' });
      const res = makeRes();
      await runMw(mw, req, res);
      expect(getUser).toHaveBeenCalledWith('XYZ-token-123');
    });
  });
});