import { ApiProperty } from '@nestjs/swagger';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants';

type PaginatedResponseDtoArgs<T> = {
  data: Array<T>;
  totalCount: number;
  page: number;
  limit: number;
};

export class PaginatedResponseDto<T> {
  @ApiProperty({
    type: Array<T>,
  })
  private data: T[];
  @ApiProperty({ default: DEFAULT_PAGE })
  private page: number;
  @ApiProperty({ default: DEFAULT_LIMIT })
  private limit: number;
  @ApiProperty()
  private pageCount: number;
  @ApiProperty()
  private totalCount: number;

  constructor({ data, totalCount, page, limit }: PaginatedResponseDtoArgs<T>) {
    this.data = data;
    this.page = page || DEFAULT_PAGE;
    this.limit = limit || DEFAULT_LIMIT;
    this.pageCount = Math.ceil(totalCount / this.limit);
    this.totalCount = totalCount;
  }
}
