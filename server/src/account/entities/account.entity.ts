import { DeliveryArea } from '../../generated/prisma/enums.js';
import { ProductEntity } from '../../catalog/entities/catalog.entity.js';

export class AddressEntity {
  id: string;
  fullName: string;
  phone: string;
  area: DeliveryArea;
  city: string;
  line: string;
  note: string | null;
  isDefault: boolean;
  createdAt: Date;
}

export class NotificationEntity {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

export class UnreadCountEntity {
  unread: number;
}

export class WishlistEntity {
  /** Product ids, for quick "is it liked?" checks */
  productIds: string[];
  products: ProductEntity[];
}
