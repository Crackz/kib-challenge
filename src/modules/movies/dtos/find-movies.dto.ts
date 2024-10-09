import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { IsNotBlank } from 'src/common/validators/is-not-blank.validator';

export class FindMoviesDto extends PaginationDto {
  // !NOTE: this is will be used for full text search on movies titles only
  // TODO: to create a sophisticated search, we should use elastic search to support fuzzy search and
  // to also include multiple field search without impacting the performance
  @IsOptional()
  @IsString()
  @IsNotBlank()
  title?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsNotBlank({ each: true })
  @Transform((params) => {
    if (!Array.isArray(params.value)) {
      return [params.value];
    }

    return params.value;
  })
  genreIds?: string[];
}
