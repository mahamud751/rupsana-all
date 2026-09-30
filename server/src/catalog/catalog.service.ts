import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { paginate } from '../common/dto/pagination.dto.js';
import {
  AdminProductQueryDto,
  CreateBannerDto,
  CreateCategoryDto,
  CreateProductDto,
  UpdateBannerDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from './dto/catalog.dto.js';

const withCategory = { category: true } as const;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Categories ----------

  listCategories(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  // ---------- Products ----------

  async listProducts(query: AdminProductQueryDto) {
    const { page = 1, limit = 20, category, q, bestseller, sort } = query;
    const where: Prisma.ProductWhereInput = {
      ...(query.includeInactive
        ? {}
        : { isActive: true, category: { isActive: true } }),
      ...(category ? { category: { slug: category } } : {}),
      ...(bestseller ? { isBestseller: true } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { subtitle: { contains: q, mode: 'insensitive' } },
              { category: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === 'price_asc'
        ? [{ price: 'asc' }]
        : sort === 'price_desc'
          ? [{ price: 'desc' }]
          : sort === 'newest'
            ? [{ createdAt: 'desc' }]
            : [{ isBestseller: 'desc' }, { createdAt: 'asc' }];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        include: withCategory,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginate(items, total, page, limit);
  }

  /** Looks a product up by id or slug, with related products. */
  async getProduct(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        OR: [
          { slug: idOrSlug },
          ...(isUuid(idOrSlug) ? [{ id: idOrSlug }] : []),
        ],
      },
      include: withCategory,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const related = await this.prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: withCategory,
      take: 6,
    });
    return { ...product, related };
  }

  createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto, include: withCategory });
  }

  updateProduct(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: withCategory,
    });
  }

  /** Products referenced by past orders are hidden rather than deleted. */
  archiveProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: withCategory,
    });
  }

  // ---------- Banners ----------

  listBanners(includeInactive = false) {
    return this.prisma.banner.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  createBanner(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  updateBanner(id: string, dto: UpdateBannerDto) {
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
