# Rupsuhana — Bridal & Beauty

React Native CLI app (iOS + Android) for a bridal & beauty shop with salon booking.

## Features

- **Home** — hero carousel, categories, bestsellers, appointment banner
- **Shop** — category filters, search, price sorting
- **Product details** — quantity, wishlist, Add to Bag / Buy Now, related products
- **Bag & Checkout** — delivery address, Inside/Outside Dhaka delivery fee,
  Cash on Delivery or bKash (Send Money + Transaction ID), promo codes
- **Orders** — order confirmation, order history, status timeline, cancel
- **Book** — bridal services, date & time slot, My Appointments
- **Profile, Wishlist, Notifications, Search, Menu, Help & Support, About**
- Data (bag, wishlist, orders, appointments, profile) is saved on the device
- Deep links: `rupsuhana://product/p1`, `rupsuhana://orders`, `rupsuhana://checkout`, …

## Run

```bash
npm install
cd ios && bundle install && bundle exec pod install && cd ..
npm start            # Metro
npm run ios          # or: npm run android
```

## Before publishing

- **Store details** — set the real phone, WhatsApp, email, bKash number and
  salon address in [`src/config.ts`](src/config.ts). Delivery fees and promo
  codes are also there.
- **Products & photos** — products live in [`src/data.ts`](src/data.ts). The
  current photos are cropped from the design mockup and are low resolution;
  replace the files in `src/assets/images/` with real product photos.
- **Backend** — orders and bookings are stored only on the customer's phone.
  To receive them as the shop owner, connect `placeOrder` and `addAppointment`
  in [`src/context/StoreContext.tsx`](src/context/StoreContext.tsx) to an API
  (or a service such as Firebase).
- **App identity** — change the bundle ID (`org.reactjs.native.example.Rupsuhana`)
  and add an app icon and splash screen.

## Project structure

```
src/
  components/   UI building blocks (header, cards, tab bar, icons, logo, ui.tsx)
  screens/      One file per screen
  navigation/   Stack + tab navigator, routes, deep links
  context/      StoreContext — cart, wishlist, orders, bookings, profile
  config.ts     Store contact details, delivery fees, promo codes
  data.ts       Products, categories, services, FAQs
  theme.ts      Colours, fonts, price formatting
```
