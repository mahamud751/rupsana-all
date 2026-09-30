import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const descriptions = {
  jewellery:
    'Handcrafted with gold-tone kundan, pearls and ruby-red stones. Designed to complete your bridal look, with a comfortable fit for long ceremonies.',
  makeup:
    'Long-wearing, camera-ready finish that stays fresh through every ritual, from holud to reception. Buildable coverage for a flawless bridal glow.',
  hair: 'Delicate gold and pearl detailing that holds your hairstyle securely. Perfect for buns, braids and open hair on your special day.',
  skincare:
    'Gentle, nourishing formula to prep your skin before the big day. Leaves skin soft, radiant and ready for makeup.',
  accessories:
    'An elegant finishing touch with intricate embellishment, sized to carry your bridal essentials in style.',
};

async function main() {
  // Store settings (single row)
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'Rupsuhana Bridal & Beauty',
      phone: '+8801XXXXXXXXX',
      whatsapp: '8801XXXXXXXXX',
      email: 'hello@rupsuhana.com',
      bkashNumber: '01XXXXXXXXX',
      salonAddress: 'House 00, Road 00, Dhanmondi, Dhaka',
      salonHours: 'Sat – Thu, 10:00 AM – 8:00 PM',
      deliveryInside: 70,
      deliveryOutside: 130,
      timeSlots: [
        '10:00 AM',
        '11:30 AM',
        '1:00 PM',
        '2:30 PM',
        '4:00 PM',
        '5:30 PM',
      ],
      slotCapacity: 2,
    },
  });

  // Categories
  const categories = [
    {
      slug: 'jewellery',
      name: 'Bridal Jewellery',
      imageUrl: '/uploads/cat_jewellery.jpg',
    },
    { slug: 'makeup', name: 'Make-up', imageUrl: '/uploads/cat_makeup.jpg' },
    { slug: 'hair', name: 'Hair', imageUrl: '/uploads/cat_hair.jpg' },
    {
      slug: 'skincare',
      name: 'Skincare',
      imageUrl: '/uploads/cat_skincare.jpg',
    },
    {
      slug: 'accessories',
      name: 'Accessories',
      imageUrl: '/uploads/cat_accessories.jpg',
    },
  ];
  const catId: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, sortOrder: i },
    });
    catId[c.slug] = row.id;
  }

  // Products
  const products = [
    {
      slug: 'royal-bridal-jewellery-set',
      name: 'Royal Bridal',
      subtitle: 'Jewellery Set',
      price: 4850,
      cat: 'jewellery',
      image: 'p_jewellery.jpg',
      best: true,
      stock: 25,
    },
    {
      slug: 'mac-matte-lipstick-mehr',
      name: 'MAC Matte',
      subtitle: 'Lipstick – Mehr',
      price: 3200,
      cat: 'makeup',
      image: 'p_lipstick.jpg',
      best: true,
      stock: 40,
    },
    {
      slug: 'estee-lauder-double-wear',
      name: 'Estée Lauder',
      subtitle: 'Double Wear Foundation',
      price: 6500,
      cat: 'makeup',
      image: 'p_foundation.jpg',
      best: true,
      stock: 30,
    },
    {
      slug: 'bridal-hair-accessory',
      name: 'Bridal Hair',
      subtitle: 'Accessory',
      price: 1250,
      cat: 'hair',
      image: 'p_hair.jpg',
      best: true,
      stock: 50,
    },
    {
      slug: 'kundan-choker-with-tikka',
      name: 'Kundan Choker',
      subtitle: 'with Tikka',
      price: 3950,
      cat: 'jewellery',
      image: 'cat_jewellery.jpg',
      best: false,
      stock: 15,
    },
    {
      slug: 'bridal-glow-serum',
      name: 'Bridal Glow',
      subtitle: 'Skincare Serum',
      price: 2400,
      cat: 'skincare',
      image: 'cat_skincare.jpg',
      best: false,
      stock: 35,
    },
    {
      slug: 'golden-pearl-clutch',
      name: 'Golden Pearl',
      subtitle: 'Clutch Bag',
      price: 2850,
      cat: 'accessories',
      image: 'cat_accessories.jpg',
      best: false,
      stock: 12,
    },
    {
      slug: 'pearl-bloom-hair-pins',
      name: 'Pearl Bloom',
      subtitle: 'Hair Pin Set',
      price: 950,
      cat: 'hair',
      image: 'cat_hair.jpg',
      best: false,
      stock: 60,
    },
    {
      slug: 'makeup-essentials-bridal-kit',
      name: 'Makeup Essentials',
      subtitle: 'Bridal Kit',
      price: 5400,
      cat: 'makeup',
      image: 'cat_makeup.jpg',
      best: false,
      stock: 20,
    },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle,
        description: descriptions[p.cat as keyof typeof descriptions],
        price: p.price,
        stock: p.stock,
        imageUrl: `/uploads/${p.image}`,
        isBestseller: p.best,
        categoryId: catId[p.cat],
      },
    });
  }

  // Home banners
  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({
      data: [
        {
          titleTop: 'Your bridal look',
          titleBottom: 'starts here',
          description:
            'Premium bridal & beauty products\nto complete your special day',
          cta: 'SHOP NOW',
          imageUrl: '/uploads/hero.jpg',
          sortOrder: 0,
        },
        {
          titleTop: 'Royal jewellery',
          titleBottom: 'for your big day',
          description: 'Handcrafted kundan & pearl sets\nmade to be treasured',
          cta: 'EXPLORE',
          imageUrl: '/uploads/hero_jewellery.jpg',
          categorySlug: 'jewellery',
          sortOrder: 1,
        },
        {
          titleTop: 'Flawless makeup',
          titleBottom: 'that lasts',
          description: 'Long-wear favourites from\nthe brands you love',
          cta: 'SHOP NOW',
          imageUrl: '/uploads/hero_lipstick.jpg',
          categorySlug: 'makeup',
          sortOrder: 2,
        },
        {
          titleTop: 'Finishing touches',
          titleBottom: 'in gold & pearl',
          description: 'Bridal hair accessories\nfor every hairstyle',
          cta: 'DISCOVER',
          imageUrl: '/uploads/hero_hair.jpg',
          categorySlug: 'hair',
          sortOrder: 3,
        },
      ],
    });
  }

  // Salon services
  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: [
        {
          name: 'Bridal Makeup',
          durationLabel: '3 hrs',
          price: 15000,
          sortOrder: 0,
        },
        {
          name: 'Engagement Look',
          durationLabel: '2 hrs',
          price: 8000,
          sortOrder: 1,
        },
        {
          name: 'Holud / Mehndi Look',
          durationLabel: '2 hrs',
          price: 7000,
          sortOrder: 2,
        },
        {
          name: 'Hair Styling',
          durationLabel: '1 hr',
          price: 3500,
          sortOrder: 3,
        },
        {
          name: 'Consultation',
          durationLabel: '30 min',
          price: 0,
          sortOrder: 4,
        },
      ],
    });
  }

  // FAQs
  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: 'How long does delivery take?',
          answer:
            'Inside Dhaka: 1–3 days. Outside Dhaka: 3–5 days. We deliver across all 64 districts of Bangladesh.',
          sortOrder: 0,
        },
        {
          question: 'Is Cash on Delivery available?',
          answer:
            'Yes. You can pay in cash when your order arrives. You can also pay in advance with bKash.',
          sortOrder: 1,
        },
        {
          question: 'Can I return or exchange a product?',
          answer:
            'Unused items in original packaging can be exchanged within 3 days of delivery. Makeup and skincare cannot be returned once opened, for hygiene reasons.',
          sortOrder: 2,
        },
        {
          question: 'How do bridal appointments work?',
          answer:
            'Choose a service, date and time in the Book tab. Our team will call you to confirm your appointment and discuss your look.',
          sortOrder: 3,
        },
        {
          question: 'Can I cancel my order?',
          answer:
            'Yes, you can cancel from My Orders until the order is confirmed. After that, please contact us.',
          sortOrder: 4,
        },
      ],
    });
  }

  // Promo codes
  await prisma.promoCode.upsert({
    where: { code: 'BRIDE10' },
    update: {},
    create: {
      code: 'BRIDE10',
      description: '10% off your order',
      percentOff: 10,
    },
  });
  await prisma.promoCode.upsert({
    where: { code: 'FREESHIP' },
    update: {},
    create: {
      code: 'FREESHIP',
      description: 'Free delivery',
      freeDelivery: true,
      minSubtotal: 2000,
    },
  });

  // Admin account — change this password after first login.
  await prisma.user.upsert({
    where: { phone: '01700000000' },
    update: {},
    create: {
      name: 'Rupsuhana Admin',
      phone: '01700000000',
      email: 'admin@rupsuhana.com',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('admin123', 10),
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
