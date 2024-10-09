import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../constants';

type PaginatedResponseDtoArgs<T> = {
  data: Array<T>;
  totalCount: number;
  offset: number;
  limit: number;
};

export class PaginatedResponseDto<T> {
  @ApiProperty({
    type: Array<T>,
  })
  private data: T[];
  @ApiProperty({ default: DEFAULT_OFFSET })
  private offset: number;
  @ApiProperty({ default: DEFAULT_LIMIT })
  private limit: number;
  @ApiProperty()
  private pageCount: number;
  @ApiProperty()
  private totalCount: number;

  constructor({
    data,
    totalCount,
    offset,
    limit,
  }: PaginatedResponseDtoArgs<T>) {
    this.data = data;
    this.offset = offset || DEFAULT_OFFSET;
    this.limit = limit || DEFAULT_LIMIT;
    this.pageCount = Math.ceil(totalCount / this.limit);
    this.totalCount = totalCount;
  }
}
