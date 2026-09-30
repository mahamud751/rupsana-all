export class CategoryEntity {
  id: string;
  /** URL-friendly id, e.g. "jewellery" */
  slug: string;
  name: string;
  /** Relative path (e.g. /uploads/x.jpg) or absolute URL */
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export class ProductEntity {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  /** Price in BDT (৳) */
  price: number;
  /** Original price to show as crossed out, if on sale */
  compareAtPrice: number | null;
  /** Units in stock */
  stock: number;
  imageUrl: string;
  isBestseller: boolean;
  isActive: boolean;
  categoryId: string;
  category: CategoryEntity;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductDetailEntity extends ProductEntity {
  /** Other products from the same category */
  related: ProductEntity[];
}

export class PaginatedProductsEntity {
  items: ProductEntity[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class BannerEntity {
  id: string;
  titleTop: string;
  titleBottom: string;
  description: string;
  /** Button label, e.g. "SHOP NOW" */
  cta: string;
  imageUrl: string;
  /** Category the button opens; null opens all products */
  categorySlug: string | null;
  sortOrder: number;
  isActive: boolean;
}
