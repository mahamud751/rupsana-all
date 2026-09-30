import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/auth.decorator.js';
import { CatalogService } from './catalog.service.js';
import {
  AdminProductQueryDto,
  CreateBannerDto,
  CreateCategoryDto,
  CreateProductDto,
  ProductQueryDto,
  UpdateBannerDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from './dto/catalog.dto.js';
import {
  BannerEntity,
  CategoryEntity,
  PaginatedProductsEntity,
  ProductDetailEntity,
  ProductEntity,
} from './entities/catalog.entity.js';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List active categories' })
  categories(): Promise<CategoryEntity[]> {
    return this.catalog.listCategories();
  }

  @Get('products')
  @ApiOperation({ summary: 'List, filter, search and sort products' })
  products(@Query() query: ProductQueryDto): Promise<PaginatedProductsEntity> {
    return this.catalog.listProducts({ ...query, includeInactive: false });
  }

  @Get('products/:idOrSlug')
  @ApiOperation({
    summary: 'Get one product (by id or slug) with related products',
  })
  product(@Param('idOrSlug') idOrSlug: string): Promise<ProductDetailEntity> {
    return this.catalog.getProduct(idOrSlug);
  }

  @Get('banners')
  @ApiOperation({ summary: 'Home screen hero banners' })
  banners(): Promise<BannerEntity[]> {
    return this.catalog.listBanners();
  }
}

@ApiTags('Admin · Catalog')
@AdminOnly()
@Controller('admin')
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all categories, including hidden ones' })
  categories(): Promise<CategoryEntity[]> {
    return this.catalog.listCategories(true);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a category' })
  createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.catalog.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.catalog.updateCategory(id, dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'List products, optionally including hidden ones' })
  products(
    @Query() query: AdminProductQueryDto,
  ): Promise<PaginatedProductsEntity> {
    return this.catalog.listProducts(query);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a product' })
  createProduct(@Body() dto: CreateProductDto): Promise<ProductEntity> {
    return this.catalog.createProduct(dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update a product (price, stock, image, …)' })
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.catalog.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Hide a product (kept for order history)' })
  archiveProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductEntity> {
    return this.catalog.archiveProduct(id);
  }

  @Get('banners')
  @ApiOperation({ summary: 'List all banners' })
  banners(): Promise<BannerEntity[]> {
    return this.catalog.listBanners(true);
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create a banner' })
  createBanner(@Body() dto: CreateBannerDto): Promise<BannerEntity> {
    return this.catalog.createBanner(dto);
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update a banner' })
  updateBanner(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBannerDto,
  ): Promise<BannerEntity> {
    return this.catalog.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete a banner' })
  deleteBanner(@Param('id', ParseUUIDPipe) id: string): Promise<BannerEntity> {
    return this.catalog.deleteBanner(id);
  }
}
