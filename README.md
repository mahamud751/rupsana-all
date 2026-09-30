# Rupsuhana — Bridal & Beauty

```
rupsana/
├── app/      React Native CLI app (iOS + Android)
└── server/   NestJS + Prisma + PostgreSQL API with Swagger docs
```

## Run everything locally

**1. Server** (needs PostgreSQL running)

```bash
cd server
cp .env.example .env        # set DATABASE_URL + JWT_SECRET
npm install
npm run db:migrate
npm run db:seed
npm run start:dev           # API http://localhost:3000/api · Docs http://localhost:3000/docs
```

**2. App**

```bash
cd app
npm install
cd ios && bundle exec pod install && cd ..   # iOS only, first time
npm start                                    # Metro
npm run android                              # or: npm run ios
```

The app finds the server automatically on the iOS simulator (`localhost`) and
Android emulator (`10.0.2.2`). For a real phone, set your computer's Wi-Fi IP in
[`app/src/api/config.ts`](app/src/api/config.ts).

**Sign in to try it:** `01711111111` / `123456` (customer) ·
`01700000000` / `admin123` (admin, for Swagger admin endpoints).

See [`server/README.md`](server/README.md) and [`app/README.md`](app/README.md) for details.
