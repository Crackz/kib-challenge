import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/constants';
import { ApiOkPaginatedResponse } from 'src/common/decorators/api-ok-paginated-response';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { FindMoviesDto } from './dtos/find-movies.dto';
import { MovieDto } from './dtos/movie.dto';
import { MoviesService } from './services/movies.service';
import { OpenApi } from 'src/common/utils';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @ApiOkPaginatedResponse(MovieDto)
  @ApiUnprocessableEntityResponse(
    OpenApi.getApiUnprocessableEntityErrorOpts('Invalid query params'),
  )
  @ApiBadRequestResponse(
    OpenApi.getApiErrorOpts({
      message: '{genreId} is invalid genre id',
      param: 'invalidGenreId',
    }),
  )
  @UseInterceptors(CacheInterceptor)
  @Get('/')
  async getMany(
    @Query() query: FindMoviesDto,
  ): Promise<PaginatedResponseDto<MovieDto>> {
    query.page = query.page || DEFAULT_PAGE;
    query.limit = query.limit || DEFAULT_LIMIT;

    const { data, totalCount } = await this.moviesService.getMany(query);
    return new PaginatedResponseDto({
      data,
      totalCount,
      limit: query.limit,
      page: query.page,
    });
  }
}
