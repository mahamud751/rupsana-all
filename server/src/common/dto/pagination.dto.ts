import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  /** Page number, starting at 1 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /** Items per page (max 100) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export const paginate = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
) => ({ items, total, page, limit, pages: Math.ceil(total / limit) });
