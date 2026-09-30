import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StoreService } from '../store/store.service.js';
import { Prisma } from '../generated/prisma/client.js';
import {
  DeliveryArea,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../generated/prisma/enums.js';
import { paginate } from '../common/dto/pagination.dto.js';
import { normalizePhone, orderRef } from '../common/utils.js';
import {
  AdminOrderQueryDto,
  CartItemDto,
  CreateOrderDto,
  CreatePromoDto,
  QuoteDto,
  UpdateOrderStatusDto,
  UpdatePromoDto,
} from './dto/orders.dto.js';

type Db = Prisma.TransactionClient | PrismaService;

const orderInclude = {
  items: true,
  history: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderInclude;

/** Which statuses an admin may move an order to from each status. */
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_MESSAGE: Record<OrderStatus, string> = {
  PLACED: 'has been placed. We will call you to confirm it.',
  CONFIRMED: 'has been confirmed and is being prepared.',
  SHIPPED: 'is on the way!',
  DELIVERED: 'has been delivered. Thank you for shopping with us!',
  CANCELLED: 'has been cancelled.',
};

const withRef = <T extends { number: number }>(order: T) => ({
  ...order,
  reference: orderRef(order.number),
});

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: StoreService,
  ) {}

  // ---------- Pricing ----------

  /**
   * Prices a cart from the database: current prices, stock, delivery fee and
   * promo discount. The app shows this at checkout; placing an order re-runs
   * it inside the transaction so totals can never be tampered with.
   */
  async quote(dto: QuoteDto, db: Db = this.prisma) {
    const items = mergeItems(dto.items);
    const products = await db.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const errors: string[] = [];

    const lines = items.map((item) => {
      const p = products.find((x) => x.id === item.productId);
      if (!p || !p.isActive) {
        errors.push('Some items in your bag are no longer available.');
        return {
          productId: item.productId,
          name: p?.name ?? 'Unavailable product',
          subtitle: p?.subtitle ?? '',
          imageUrl: p?.imageUrl ?? '',
          price: p?.price ?? 0,
          quantity: item.quantity,
          lineTotal: 0,
          stock: 0,
          available: false,
        };
      }
      const available = p.stock >= item.quantity;
      if (!available) {
        errors.push(
          p.stock === 0
            ? `${p.name} ${p.subtitle} is out of stock.`
            : `Only ${p.stock} of ${p.name} ${p.subtitle} left in stock.`,
        );
      }
      return {
        productId: p.id,
        name: p.name,
        subtitle: p.subtitle,
        imageUrl: p.imageUrl,
        price: p.price,
        quantity: item.quantity,
        lineTotal: p.price * item.quantity,
        stock: p.stock,
        available,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const settings = await this.store.settings();
    let deliveryFee =
      dto.area === DeliveryArea.INSIDE_DHAKA
        ? settings.deliveryInside
        : settings.deliveryOutside;

    let discount = 0;
    let promo: { code: string; description: string } | null = null;
    let promoError: string | null = null;
    if (dto.promoCode?.trim()) {
      const code = dto.promoCode.trim().toUpperCase();
      const found = await db.promoCode.findUnique({ where: { code } });
      if (!found || !found.isActive) {
        promoError = 'This promo code is not valid.';
      } else if (found.expiresAt && found.expiresAt < new Date()) {
        promoError = 'This promo code has expired.';
      } else if (
        found.usageLimit !== null &&
        found.usedCount >= found.usageLimit
      ) {
        promoError = 'This promo code has reached its usage limit.';
      } else if (subtotal < found.minSubtotal) {
        promoError = `Add ৳${found.minSubtotal - subtotal} more to use this code.`;
      } else {
        promo = { code: found.code, description: found.description };
        if (found.percentOff) {
          discount = Math.round((subtotal * found.percentOff) / 100);
        }
        if (found.amountOff) {
          discount = Math.min(subtotal, discount + found.amountOff);
        }
        if (found.freeDelivery) {
          deliveryFee = 0;
        }
      }
    }

    return {
      lines,
      subtotal,
      deliveryFee,
      discount,
      total: Math.max(0, subtotal + deliveryFee - discount),
      promo,
      promoError,
      errors: [...new Set(errors)],
    };
  }

  // ---------- Customer ----------

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const q = await this.quote(
        { items: dto.items, area: dto.address.area, promoCode: dto.promoCode },
        tx,
      );
      if (q.errors.length) {
        throw new BadRequestException(q.errors.join(' '));
      }
      if (dto.promoCode?.trim() && q.promoError) {
        throw new BadRequestException(q.promoError);
      }

      // Reserve stock; the "stock >= quantity" condition prevents overselling
      // when two customers check out at the same time.
      for (const line of q.lines) {
        const { count } = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (count === 0) {
          throw new BadRequestException(
            `${line.name} ${line.subtitle} just went out of stock.`,
          );
        }
      }
      if (q.promo) {
        await tx.promoCode.update({
          where: { code: q.promo.code },
          data: { usedCount: { increment: 1 } },
        });
      }

      const address = {
        ...dto.address,
        phone: normalizePhone(dto.address.phone),
      };
      const created = await tx.order.create({
        data: {
          userId,
          subtotal: q.subtotal,
          deliveryFee: q.deliveryFee,
          discount: q.discount,
          total: q.total,
          promoCode: q.promo?.code,
          paymentMethod: dto.paymentMethod,
          bkashTrxId:
            dto.paymentMethod === PaymentMethod.BKASH
              ? dto.bkashTrxId?.toUpperCase()
              : null,
          shipName: address.fullName.trim(),
          shipPhone: address.phone,
          shipArea: address.area,
          shipCity: address.city.trim(),
          shipLine: address.line.trim(),
          shipNote: address.note?.trim() || null,
          items: {
            create: q.lines.map((l) => ({
              productId: l.productId,
              name: l.name,
              subtitle: l.subtitle,
              imageUrl: l.imageUrl,
              price: l.price,
              quantity: l.quantity,
            })),
          },
          history: { create: { status: OrderStatus.PLACED } },
        },
        include: orderInclude,
      });

      if (dto.saveAddress) {
        await this.rememberAddress(tx, userId, address);
      }
      await tx.notification.create({
        data: {
          userId,
          title: 'Order placed',
          body: `Your order ${orderRef(created.number)} ${STATUS_MESSAGE.PLACED}`,
        },
      });
      return created;
    });
    return withRef(order);
  }

  async listMine(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(withRef);
  }

  async getMine(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: orderInclude,
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return withRef(order);
  }

  async cancelMine(userId: string, id: string) {
    const order = await this.getMine(userId, id);
    if (order.status !== OrderStatus.PLACED) {
      throw new BadRequestException(
        'This order has already been confirmed. Please contact us to cancel it.',
      );
    }
    return this.changeStatus(
      order.id,
      OrderStatus.CANCELLED,
      'Cancelled by customer',
    );
  }

  // ---------- Admin ----------

  async adminList(query: AdminOrderQueryDto) {
    const { page = 1, limit = 20, status, q } = query;
    const number = q ? parseInt(q.replace(/\D/g, ''), 10) : NaN;
    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              ...(Number.isFinite(number) ? [{ number }] : []),
              { shipPhone: { contains: normalizePhone(q) || q } },
              { shipName: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          ...orderInclude,
          user: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginate(items.map(withRef), total, page, limit);
  }

  async adminGet(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        ...orderInclude,
        user: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return withRef(order);
  }

  async adminUpdateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (!NEXT_STATUS[order.status].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot change an order from ${order.status} to ${dto.status}.`,
      );
    }
    return this.changeStatus(id, dto.status, dto.note);
  }

  async adminUpdatePayment(id: string, paymentStatus: PaymentStatus) {
    await this.prisma.order.update({ where: { id }, data: { paymentStatus } });
    return this.adminGet(id);
  }

  /** Applies a status change with its side effects (stock, payment, notice). */
  private async changeStatus(id: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });
      if (status === OrderStatus.CANCELLED) {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        if (current.promoCode) {
          await tx.promoCode.updateMany({
            where: { code: current.promoCode, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }
      }
      const paymentStatus =
        status === OrderStatus.DELIVERED &&
        current.paymentMethod === PaymentMethod.COD
          ? PaymentStatus.PAID
          : status === OrderStatus.CANCELLED &&
              current.paymentStatus === PaymentStatus.PAID
            ? PaymentStatus.REFUNDED
            : undefined;

      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          paymentStatus,
          history: { create: { status, note } },
        },
        include: orderInclude,
      });
      await tx.notification.create({
        data: {
          userId: current.userId,
          title: `Order ${status.toLowerCase()}`,
          body: `Your order ${orderRef(current.number)} ${STATUS_MESSAGE[status]}`,
        },
      });
      return updated;
    });
    return withRef(order);
  }

  private async rememberAddress(
    tx: Prisma.TransactionClient,
    userId: string,
    a: CreateOrderDto['address'],
  ) {
    const existing = await tx.address.findFirst({
      where: {
        userId,
        line: a.line.trim(),
        city: a.city.trim(),
        phone: a.phone,
      },
    });
    await tx.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    const data = {
      fullName: a.fullName.trim(),
      phone: a.phone,
      area: a.area,
      city: a.city.trim(),
      line: a.line.trim(),
      note: a.note?.trim() || null,
      isDefault: true,
    };
    if (existing) {
      await tx.address.update({ where: { id: existing.id }, data });
    } else {
      await tx.address.create({ data: { ...data, userId } });
    }
  }

  // ---------- Promo codes (admin) ----------

  listPromos() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createPromo(dto: CreatePromoDto) {
    return this.prisma.promoCode.create({ data: dto });
  }

  updatePromo(code: string, dto: UpdatePromoDto) {
    const { code: _ignored, ...data } = dto;
    return this.prisma.promoCode.update({ where: { code }, data });
  }
}

/** Combines duplicate product lines from the app's cart. */
function mergeItems(items: CartItemDto[]) {
  const map = new Map<string, number>();
  for (const i of items) {
    map.set(i.productId, (map.get(i.productId) ?? 0) + i.quantity);
  }
  return [...map].map(([productId, quantity]) => ({ productId, quantity }));
}
