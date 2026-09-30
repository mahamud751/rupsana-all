# Rupsuhana API

Backend for the Rupsuhana Bridal & Beauty app — **NestJS 12 + Prisma 7 + PostgreSQL**,
with Swagger docs.

## Quick start

```bash
cp .env.example .env          # then set DATABASE_URL and JWT_SECRET
npm install                   # also generates the Prisma client
createdb rupsuhana            # or create the database any other way
npm run db:migrate            # create tables
npm run db:seed               # sample catalog, settings, admin + demo users
npm run start:dev             # http://localhost:3000
```

- API base: `http://localhost:3000/api`
- **Swagger docs: http://localhost:3000/docs** (JSON at `/docs/json`)
- Images: served from `uploads/` at `http://localhost:3000/uploads/...`

### Seeded accounts

| Role     | Phone         | Password   |
|----------|---------------|------------|
| Admin    | `01700000000` | `admin123` |
| Customer | `01711111111` | `123456`   |

Change the admin password (`PATCH /api/auth/me/password`) before going live.

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Run with auto-reload |
| `npm run build` / `npm run start:prod` | Production build / run |
| `npm run db:migrate` | Create/apply migrations after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Insert sample data (safe to re-run) |
| `npm run db:reset` | **Delete all data**, re-migrate and re-seed |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run test:e2e` | End-to-end API tests (needs the seeded database) |

## What the API covers

| Area | Endpoints |
|---|---|
| **Auth** | Register / login with phone + password (JWT), profile, change password |
| **Catalog** | Categories, products (filter, search, sort, pagination, related), home banners |
| **Orders** | Server-side price **quote** (stock, delivery fee, promo), place order (reserves stock atomically), my orders, cancel before confirmation |
| **Salon** | Services, slot availability per day (capacity per slot), book / cancel appointments |
| **Account** | Saved addresses (default), wishlist, notifications (unread count, mark read) |
| **Store** | Contact details, delivery fees, booking slots, FAQs |
| **Admin** (role `ADMIN`) | Manage products, categories, banners, services, FAQs, promo codes, settings; update order status (PLACED → CONFIRMED → SHIPPED → DELIVERED / CANCELLED) and payment status; manage appointments; upload images |

Business rules worth knowing:

- Prices are integers in BDT. The app never sends prices — the server always
  recalculates totals from the database.
- Stock is decremented when an order is placed and restored if it is cancelled.
- Cash-on-delivery orders are marked **PAID** automatically when delivered.
  bKash orders stay **PENDING** until an admin verifies the Transaction ID and
  sets `paymentStatus` to `PAID`.
- Every order/appointment status change creates a notification for the customer.

## Project structure

```
prisma/
  schema.prisma     Database models
  migrations/       SQL migrations
  seed.ts           Sample data
src/
  auth/             Register, login, JWT strategy, profile
  catalog/          Categories, products, banners (+ admin)
  orders/           Quote, orders, promo codes (+ admin)
  salon/            Services, availability, appointments (+ admin)
  account/          Addresses, wishlist, notifications
  store/            Settings and FAQs (+ admin)
  uploads/          Admin image upload
  common/           Guards, decorators, filters, helpers
  prisma/           PrismaService
uploads/            Stored images
```
