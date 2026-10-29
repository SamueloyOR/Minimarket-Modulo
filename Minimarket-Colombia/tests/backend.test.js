import request from 'supertest';
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

const { app } = await import('../src/app.js');

describe('API base modules', () => {
  it('exposes a health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rejects an invalid product id', async () => {
    const res = await request(app).get('/api/products/not-an-object-id');
    expect(res.status).toBe(400);
  });

  it('exposes the orders API route with auth protection', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('exposes the users API route with auth protection', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('protects inventory movements with authentication', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.status).toBe(401);
  });

  it('serves the inventory page at its admin dashboard route', async () => {
    const res = await request(app).get('/inventory');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Gestión de inventario');
  });

  it('rejects a negative entry cost before changing stock', async () => {
    const token = jwt.sign({ id: '507f1f77bcf86cd799439011', rol: 'admin' }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/api/inventory/entry')
      .set('Authorization', `Bearer ${token}`)
      .send({ producto: '507f1f77bcf86cd799439012', cantidad: 1, costoUnitario: -1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/costo unitario/i);
  });
});
