import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const toBool = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

export class ProductQueryDto extends PaginationQueryDto {
  /** Category slug, e.g. "makeup" */
  @IsOptional()
  @IsString()
  category?: string;

  /** Search in name and subtitle */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  /** Only bestsellers */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  bestseller?: boolean;

  @IsOptional()
  @IsIn(['featured', 'price_asc', 'price_desc', 'newest'])
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest' = 'featured';
}

export class AdminProductQueryDto extends ProductQueryDto {
  /** Include hidden (inactive) products */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  includeInactive?: boolean;
}

export class CreateCategoryDto {
  @Matches(SLUG, {
    message: 'slug must be lowercase letters, numbers and dashes',
  })
  slug: string;

  @IsString()
  @MinLength(2)
  name: string;

  /** Relative path from POST /api/admin/uploads, or absolute URL */
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CreateProductDto {
  @Matches(SLUG, {
    message: 'slug must be lowercase letters, numbers and dashes',
  })
  slug: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  subtitle: string;

  @IsString()
  description: string;

  /** Price in BDT */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPrice?: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  imageUrl: string;

  /** Category id (uuid) */
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class CreateBannerDto {
  @IsString()
  titleTop: string;

  @IsString()
  titleBottom: string;

  @IsString()
  description: string;

  @IsString()
  @MaxLength(20)
  cta: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
