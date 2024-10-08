import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.dto';
import { MovieDto } from '../dtos/movie.dto';
import { MoviesRepo } from '../movies.repo';
import { FindMoviesDto } from '../dtos/find-movies.dto';
import { MovieEntity } from '../entities/movie.entity';
import { FilesService } from 'src/modules/files/files.service';
import { MoviesGenresService } from 'src/modules/movies-genres/movies.service';
import { ApiErrors } from 'src/common/utils';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class MoviesService {
  constructor(
    private readonly moviesRepo: MoviesRepo,
    private readonly filesService: FilesService,
    private readonly moviesGenresService: MoviesGenresService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private checkValidGenres(genreIds?: string[]): number[] {
    if (!genreIds) {
      return [];
    }

    const validGenreIds: number[] = [];
    for (const genreId of genreIds) {
      if (!this.moviesGenresService.isValidId(genreId)) {
        throw ApiErrors.BadRequest({
          message: `${genreId} is invalid genre id`,
          param: 'invalidGenreId',
        });
      }
      validGenreIds.push(+genreId);
    }

    return validGenreIds;
  }

  private mapToDto(movie: MovieEntity): MovieDto {
    return {
      id: movie.id,
      isAdult: movie.isAdult,
      hasVideo: movie.hasVideo,
      backdropImg: this.filesService.getTMDBFileURL(movie.backdropFilePath),
      posterImg: this.filesService.getTMDBFileURL(movie.posterFilePath),
      genreIds: movie.genreIds,
      originalId: movie.originalId,
      originalTitle: movie.originalTitle,
      overview: movie.overview,
      popularity: movie.popularity,
      releaseDate: movie.releaseDate,
      title: movie.title,
      voteAverage: movie.voteAverage,
      voteCount: movie.voteCount,
    };
  }

  async getMany(
    findMoviesDto: FindMoviesDto,
  ): Promise<PaginatedResult<MovieDto>> {
    const validGenreIds = this.checkValidGenres(findMoviesDto.genreIds);

    const { movies, totalCount } = await this.moviesRepo.searchableFind({
      offset: 0,
      limit: 100,
      genreIds: validGenreIds,
      title: findMoviesDto.title,
    });

    return {
      data: movies.map((movie) => this.mapToDto(movie)),
      totalCount,
    };
  }
}
