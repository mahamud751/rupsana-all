import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/**
 * End-to-end checks against the local database (run `npm run db:seed` first).
 * Creates a throwaway customer and removes it afterwards.
 */
describe('Rupsuhana API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  const phone = `019${String(Date.now()).slice(-8)}`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { items: true },
      });
      for (const o of orders) {
        if (o.status !== 'CANCELLED') {
          for (const i of o.items) {
            await prisma.product.update({
              where: { id: i.productId },
              data: { stock: { increment: i.quantity } },
            });
          }
        }
      }
      await prisma.order.deleteMany({ where: { userId: user.id } });
      await prisma.appointment.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('lists categories and products', async () => {
    const cats = await request(app.getHttpServer()).get('/api/categories').expect(200);
    expect(cats.body.length).toBeGreaterThan(0);
    const products = await request(app.getHttpServer())
      .get('/api/products?bestseller=true')
      .expect(200);
    expect(products.body.items.every((p: { isBestseller: boolean }) => p.isBestseller)).toBe(true);
  });

  it('registers and signs in', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'E2E Tester', phone, password: 'secret1' })
      .expect(201);
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ phone, password: 'secret1' })
      .expect(200);
    token = res.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('rejects invalid input', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'X', phone: '123', password: '1' })
      .expect(400);
    expect(res.body.message.length).toBe(3);
  });

  it('quotes, places and cancels an order, restoring stock', async () => {
    const list = await request(app.getHttpServer()).get('/api/products').expect(200);
    const product = list.body.items[0];
    const items = [{ productId: product.id, quantity: 2 }];

    const quote = await request(app.getHttpServer())
      .post('/api/orders/quote')
      .send({ items, area: 'INSIDE_DHAKA', promoCode: 'BRIDE10' })
      .expect(200);
    expect(quote.body.subtotal).toBe(product.price * 2);
    expect(quote.body.discount).toBe(Math.round(product.price * 2 * 0.1));

    const order = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items,
        paymentMethod: 'COD',
        promoCode: 'BRIDE10',
        address: {
          fullName: 'E2E Tester',
          phone,
          area: 'INSIDE_DHAKA',
          city: 'Dhaka',
          line: 'House 1, Road 1, Dhanmondi',
        },
      })
      .expect(201);
    expect(order.body.total).toBe(quote.body.total);
    expect(order.body.reference).toMatch(/^RS-\d{6}$/);

    const after = await request(app.getHttpServer())
      .get(`/api/products/${product.id}`)
      .expect(200);
    expect(after.body.stock).toBe(product.stock - 2);

    await request(app.getHttpServer())
      .post(`/api/orders/${order.body.id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const restored = await request(app.getHttpServer())
      .get(`/api/products/${product.id}`)
      .expect(200);
    expect(restored.body.stock).toBe(product.stock);
  });

  it('requires sign-in for orders', async () => {
    await request(app.getHttpServer()).get('/api/orders').expect(401);
  });

  it('blocks customers from admin endpoints', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
