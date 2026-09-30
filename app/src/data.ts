import { ImageSourcePropType } from 'react-native';

export type CategoryId =
  | 'jewellery'
  | 'makeup'
  | 'hair'
  | 'skincare'
  | 'accessories';

export type Category = {
  id: CategoryId;
  label: string;
  image: ImageSourcePropType;
};

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: CategoryId;
  image: ImageSourcePropType;
  bestseller?: boolean;
};

export type HeroSlide = {
  id: string;
  titleTop: string;
  titleBottom: string;
  description: string;
  cta: string;
  image: ImageSourcePropType;
};

const img = {
  hero: require('./assets/images/hero.jpg'),
  catJewellery: require('./assets/images/cat_jewellery.jpg'),
  catMakeup: require('./assets/images/cat_makeup.jpg'),
  catHair: require('./assets/images/cat_hair.jpg'),
  catSkincare: require('./assets/images/cat_skincare.jpg'),
  catAccessories: require('./assets/images/cat_accessories.jpg'),
  jewellery: require('./assets/images/p_jewellery.jpg'),
  lipstick: require('./assets/images/p_lipstick.jpg'),
  foundation: require('./assets/images/p_foundation.jpg'),
  hairPiece: require('./assets/images/p_hair.jpg'),
  heroJewellery: require('./assets/images/hero_jewellery.jpg'),
  heroLipstick: require('./assets/images/hero_lipstick.jpg'),
  heroHair: require('./assets/images/hero_hair.jpg'),
};

export const heroSlides: HeroSlide[] = [
  {
    id: 'bridal',
    titleTop: 'Your bridal look',
    titleBottom: 'starts here',
    description:
      'Premium bridal & beauty products\nto complete your special day',
    cta: 'SHOP NOW',
    image: img.hero,
  },
  {
    id: 'jewellery',
    titleTop: 'Royal jewellery',
    titleBottom: 'for your big day',
    description: 'Handcrafted kundan & pearl sets\nmade to be treasured',
    cta: 'EXPLORE',
    image: img.heroJewellery,
  },
  {
    id: 'makeup',
    titleTop: 'Flawless makeup',
    titleBottom: 'that lasts',
    description: 'Long-wear favourites from\nthe brands you love',
    cta: 'SHOP NOW',
    image: img.heroLipstick,
  },
  {
    id: 'hair',
    titleTop: 'Finishing touches',
    titleBottom: 'in gold & pearl',
    description: 'Bridal hair accessories\nfor every hairstyle',
    cta: 'DISCOVER',
    image: img.heroHair,
  },
];

export const categories: Category[] = [
  { id: 'jewellery', label: 'Bridal\nJewellery', image: img.catJewellery },
  { id: 'makeup', label: 'Make-up', image: img.catMakeup },
  { id: 'hair', label: 'Hair', image: img.catHair },
  { id: 'skincare', label: 'Skincare', image: img.catSkincare },
  { id: 'accessories', label: 'Accessories', image: img.catAccessories },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Royal Bridal',
    subtitle: 'Jewellery Set',
    price: 4850,
    category: 'jewellery',
    image: img.jewellery,
    bestseller: true,
  },
  {
    id: 'p2',
    name: 'MAC Matte',
    subtitle: 'Lipstick – Mehr',
    price: 3200,
    category: 'makeup',
    image: img.lipstick,
    bestseller: true,
  },
  {
    id: 'p3',
    name: 'Estée Lauder',
    subtitle: 'Double Wear Foundation',
    price: 6500,
    category: 'makeup',
    image: img.foundation,
    bestseller: true,
  },
  {
    id: 'p4',
    name: 'Bridal Hair',
    subtitle: 'Accessory',
    price: 1250,
    category: 'hair',
    image: img.hairPiece,
    bestseller: true,
  },
  {
    id: 'p5',
    name: 'Kundan Choker',
    subtitle: 'with Tikka',
    price: 3950,
    category: 'jewellery',
    image: img.catJewellery,
  },
  {
    id: 'p6',
    name: 'Bridal Glow',
    subtitle: 'Skincare Serum',
    price: 2400,
    category: 'skincare',
    image: img.catSkincare,
  },
  {
    id: 'p7',
    name: 'Golden Pearl',
    subtitle: 'Clutch Bag',
    price: 2850,
    category: 'accessories',
    image: img.catAccessories,
  },
  {
    id: 'p8',
    name: 'Pearl Bloom',
    subtitle: 'Hair Pin Set',
    price: 950,
    category: 'hair',
    image: img.catHair,
  },
  {
    id: 'p9',
    name: 'Makeup Essentials',
    subtitle: 'Bridal Kit',
    price: 5400,
    category: 'makeup',
    image: img.catMakeup,
  },
];

export const bridalServices = [
  { id: 's1', name: 'Bridal Makeup', duration: '3 hrs', price: 15000 },
  { id: 's2', name: 'Engagement Look', duration: '2 hrs', price: 8000 },
  { id: 's3', name: 'Holud / Mehndi Look', duration: '2 hrs', price: 7000 },
  { id: 's4', name: 'Hair Styling', duration: '1 hr', price: 3500 },
  { id: 's5', name: 'Consultation', duration: '30 min', price: 0 },
];

export const timeSlots = [
  '10:00 AM',
  '11:30 AM',
  '1:00 PM',
  '2:30 PM',
  '4:00 PM',
  '5:30 PM',
];

export const getProduct = (id: string) => products.find(p => p.id === id);

export const categoryDescriptions: Record<CategoryId, string> = {
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

export const faqs = [
  {
    q: 'How long does delivery take?',
    a: 'Inside Dhaka: 1–3 days. Outside Dhaka: 3–5 days. We deliver across all 64 districts of Bangladesh.',
  },
  {
    q: 'Is Cash on Delivery available?',
    a: 'Yes. You can pay in cash when your order arrives. You can also pay in advance with bKash.',
  },
  {
    q: 'Can I return or exchange a product?',
    a: 'Unused items in original packaging can be exchanged within 3 days of delivery. Makeup and skincare cannot be returned once opened, for hygiene reasons.',
  },
  {
    q: 'How do bridal appointments work?',
    a: 'Choose a service, date and time in the Book tab. Our team will call you to confirm your appointment and discuss your look.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Yes, you can cancel from My Orders while the order has not yet been confirmed. After that, please contact us.',
  },
];
