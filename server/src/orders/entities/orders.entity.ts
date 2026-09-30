import {
  DeliveryArea,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../generated/prisma/enums.js';

export class QuoteLineEntity {
  productId: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  /** Current price (BDT) */
  price: number;
  quantity: number;
  lineTotal: number;
  /** Units currently in stock */
  stock: number;
  /** False if the product is hidden or does not have enough stock */
  available: boolean;
}

export class QuotePromoEntity {
  code: string;
  description: string;
}

export class QuoteEntity {
  lines: QuoteLineEntity[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promo: QuotePromoEntity | null;
  /** Why the promo code was rejected, if it was */
  promoError: string | null;
  /** Problems that block checkout (e.g. out of stock) */
  errors: string[];
}

export class OrderItemEntity {
  id: string;
  productId: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export class OrderHistoryEntity {
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
}

export class OrderEntity {
  id: string;
  /** Human-friendly reference, e.g. RS-000012 */
  reference: string;
  number: number;
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
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemEntity[];
  history: OrderHistoryEntity[];
}

export class OrderCustomerEntity {
  id: string;
  name: string;
  phone: string;
}

export class AdminOrderEntity extends OrderEntity {
  user: OrderCustomerEntity;
}

export class PaginatedOrdersEntity {
  items: AdminOrderEntity[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class PromoCodeEntity {
  code: string;
  description: string;
  percentOff: number | null;
  amountOff: number | null;
  freeDelivery: boolean;
  minSubtotal: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}
