# Rupsuhana — Bridal & Beauty

React Native CLI app (iOS + Android) for a bridal & beauty shop with salon booking.

## Features

All data comes from the Rupsuhana API in [`../server`](../server).

- **Home**: banners, categories and bestsellers from the server
- **Shop**: category filters, search, sorting, live stock ("Sold out", "Only 3 left")
- **Product details**: description, quantity (limited to stock), wishlist, related products
- **Account**: register / sign in with phone + password, profile, change password, saved addresses
- **Bag & Checkout**: bag saved on the device; checkout gets prices, delivery fee and
  promo discount from the server, then places a real order (Cash on Delivery or bKash)
- **Orders**: order history, status timeline with dates, cancel before confirmation
- **Book**: salon services and real slot availability per day; My Appointments
- **Wishlist, Notifications** (order/booking updates), **Search, Menu, Help (FAQs), About**
- Deep links: `rupsuhana://product/<id-or-slug>`, `rupsuhana://orders`, …

## Run

```bash
npm install
cd ios && bundle install && bundle exec pod install && cd ..
npm start            # Metro
npm run ios          # or: npm run android
```

## Server address

Set in [`src/api/config.ts`](src/api/config.ts):

- iOS simulator → `http://localhost:3000`, Android emulator → `http://10.0.2.2:3000` (automatic)
- Real phone → set `DEV_HOST` to your computer's Wi-Fi IP
- Release builds → set `PRODUCTION_URL` to your deployed **HTTPS** server

## Before publishing

- Deploy the server with HTTPS and set `PRODUCTION_URL`.
- Replace the sample product photos (upload real ones via `POST /api/admin/uploads`).
- Set the real phone, WhatsApp, email and bKash number with `PATCH /api/admin/settings`.
- Change the bundle ID (`org.reactjs.native.example.Rupsuhana`), app icon and splash screen.

## Project structure

```
src/
  components/   UI building blocks (header, cards, tab bar, icons, logo, ui.tsx)
  screens/      One file per screen
  navigation/   Stack + tab navigator, routes, deep links
  api/          Server address, request helper, types, React Query hooks
  context/      AuthContext (sign-in) and CartContext (bag on the device)
  theme.ts      Colours, fonts, price formatting
```
