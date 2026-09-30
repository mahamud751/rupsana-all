// Store settings. Replace the placeholder contact details with the real
// business numbers before publishing the app.
export const storeConfig = {
  name: 'Rupsuhana Bridal & Beauty',
  phone: '+8801XXXXXXXXX',
  whatsapp: '8801XXXXXXXXX',
  email: 'hello@rupsuhana.com',
  bkashNumber: '01XXXXXXXXX',
  salonAddress: 'House 00, Road 00, Dhanmondi, Dhaka',
  salonHours: 'Sat – Thu, 10:00 AM – 8:00 PM',
};

export const deliveryFees = {
  inside: 70,
  outside: 130,
} as const;

export type DeliveryArea = keyof typeof deliveryFees;

export type PromoCode = {
  code: string;
  label: string;
  percentOff?: number;
  freeDelivery?: boolean;
};

export const promoCodes: PromoCode[] = [
  { code: 'BRIDE10', label: '10% off your order', percentOff: 10 },
  { code: 'FREESHIP', label: 'Free delivery', freeDelivery: true },
];
