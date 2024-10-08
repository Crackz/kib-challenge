import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants';

export class PaginationDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
