import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizePhone } from '../common/utils.js';
import { CreateAddressDto, UpdateAddressDto } from './dto/account.dto.js';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Addresses ----------

  addresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const count = await this.prisma.address.count({ where: { userId } });
    const isDefault = dto.isDefault ?? count === 0;
    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: { ...dto, phone: normalizePhone(dto.phone), userId, isDefault },
      });
    });
  }

  async updateAddress(userId: string, id: string, dto: UpdateAddressDto) {
    await this.ownAddress(userId, id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id },
        data: {
          ...dto,
          phone: dto.phone ? normalizePhone(dto.phone) : undefined,
        },
      });
    });
  }

  async deleteAddress(userId: string, id: string) {
    const address = await this.ownAddress(userId, id);
    await this.prisma.address.delete({ where: { id } });
    // Keep a default address if any remain.
    if (address.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
      if (next) {
        await this.prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
    return { success: true };
  }

  private async ownAddress(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  // ---------- Wishlist ----------

  async wishlist(userId: string) {
    const rows = await this.prisma.wishlistItem.findMany({
      where: { userId, product: { isActive: true } },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      productIds: rows.map((r) => r.productId),
      products: rows.map((r) => r.product),
    };
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
    return this.wishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return this.wishlist(userId);
  }

  // ---------- Notifications ----------

  notifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        title: true,
        body: true,
        read: true,
        createdAt: true,
      },
    });
  }

  async unreadCount(userId: string) {
    return {
      unread: await this.prisma.notification.count({
        where: { userId, read: false },
      }),
    };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { unread: 0 };
  }
}
