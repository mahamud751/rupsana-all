// Shapes returned by the Rupsuhana API (see http://localhost:3000/docs).

export type Role = 'CUSTOMER' | 'ADMIN';
export type DeliveryArea = 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA';
export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';
export type PaymentMethod = 'COD' | 'BKASH';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: Role;
  createdAt: string;
};

export type AuthResponse = { accessToken: string; user: User };

export type Category = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string;
  isBestseller: boolean;
  categoryId: string;
  category: Category;
};

export type ProductDetail = Product & { related: Product[] };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type Banner = {
  id: string;
  titleTop: string;
  titleBottom: string;
  description: string;
  cta: string;
  imageUrl: string;
  categorySlug: string | null;
};

export type Settings = {
  storeName: string;
  phone: string;
  whatsapp: string;
  email: string;
  bkashNumber: string;
  salonAddress: string;
  salonHours: string;
  deliveryInside: number;
  deliveryOutside: number;
  timeSlots: string[];
  slotCapacity: number;
};

export type Faq = { id: string; question: string; answer: string };

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  area: DeliveryArea;
  city: string;
  line: string;
  note: string | null;
  isDefault: boolean;
};

export type AddressInput = Omit<Address, 'id' | 'isDefault' | 'note'> & {
  note?: string;
};

export type CartLine = { productId: string; quantity: number };

export type Quote = {
  lines: {
    productId: string;
    name: string;
    subtitle: string;
    imageUrl: string;
    price: number;
    quantity: number;
    lineTotal: number;
    stock: number;
    available: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promo: { code: string; description: string } | null;
  promoError: string | null;
  errors: string[];
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  reference: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bkashTrxId: string | null;
  shipName: string;
  shipPhone: string;
  shipArea: DeliveryArea;
  shipCity: string;
  shipLine: string;
  shipNote: string | null;
  createdAt: string;
  items: OrderItem[];
  history: { status: OrderStatus; note: string | null; createdAt: string }[];
};

export type Service = {
  id: string;
  name: string;
  durationLabel: string;
  price: number;
};

export type Availability = {
  date: string;
  slots: { slot: string; available: boolean; remaining: number }[];
};

export type Appointment = {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  slot: string;
  name: string;
  phone: string;
  note: string | null;
  status: AppointmentStatus;
  createdAt: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type Wishlist = { productIds: string[]; products: Product[] };
