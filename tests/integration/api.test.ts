import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

function createTestApp(enableRateLimit = true) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  if (enableRateLimit) {
    const apiLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => false,
    });
    app.use('/api/', apiLimiter);
  }

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.post('/api/checkout', (req, res) => {
    const { beatId, title, priceStr } = req.body;
    if (!beatId || !title || !priceStr) {
      return res.status(400).json({ error: 'beatId, title, and priceStr are required' });
    }
    res.json({ url: 'https://checkout.stripe.com/test', id: 'cs_test_123' });
  });

  return app;
}

describe('API Health Check', () => {
  const app = createTestApp(false);
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/health returns valid JSON', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});

describe('API Checkout Route', () => {
  const app = createTestApp(false);
  it('POST /api/checkout with valid body returns 200', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ beatId: 'uuid', title: 'Test Beat', priceStr: '1.00' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
  });

  it('POST /api/checkout with missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ beatId: 'uuid' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/checkout with empty body returns 400', async () => {
    const res = await request(app).post('/api/checkout').send({});
    expect(res.status).toBe(400);
  });
});

describe('API Rate Limiting', () => {
  const app = createTestApp(true);
  it('returns rate limiting headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });
});

describe('API Error Handling', () => {
  const app = createTestApp(false);
  it('POST to non-existent route returns 404', async () => {
    const res = await request(app).post('/api/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET to checkout route returns 404', async () => {
    const res = await request(app).get('/api/checkout');
    expect(res.status).toBe(404);
  });
});
