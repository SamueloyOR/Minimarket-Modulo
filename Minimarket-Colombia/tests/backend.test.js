import request from 'supertest';
import { describe, it, expect } from 'vitest';

const { app } = await import('../src/app.js');

describe('API base modules', () => {
  it('exposes a health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('exposes the orders API route with auth protection', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('exposes the users API route with auth protection', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});
