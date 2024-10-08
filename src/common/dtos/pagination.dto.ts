import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../constants';

export class PaginationDto {
  @ApiPropertyOptional({ default: DEFAULT_OFFSET })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
