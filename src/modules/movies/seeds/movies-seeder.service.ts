import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeEnvironment } from 'src/common/constants';
import { EnvironmentVariables } from 'src/common/env/environment-variables';
import { DeepWritable } from 'src/common/types/writable';
import { MoviesRepo } from '../movies.repo';
import * as moviesJSONArr from './data/movies.json';
import { TmdbMovie } from '../interfaces/movies-scrapper.interface';
import { MovieEntity } from '../entities/movie.entity';

@Injectable()
export class MoviesSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MoviesSeedService.name);
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly moviesRepoRepo: MoviesRepo,
  ) {}

  private async shouldSeed(): Promise<boolean> {
    const count = await this.moviesRepoRepo.count();
    return count > 0 ? false : true;
  }

  private mapToEntity(movie: TmdbMovie): DeepWritable<MovieEntity> {
    return {
      backdropFilePath: movie.backdrop_path,
      genreIds: movie.genre_ids,
      hasVideo: movie.video,
      isAdult: movie.adult,
      originalId: movie.id,
      originalTitle: movie.original_title,
      overview: movie.overview,
      popularity: movie.popularity,
      posterFilePath: movie.poster_path,
      releaseDate: movie.release_date ? new Date(movie.release_date) : null,
      title: movie.title,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      averageRating: '0',
    };
  }

  async onApplicationBootstrap() {
    const isDevelopmentEnvironment =
      this.configService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT;
    if (!isDevelopmentEnvironment) {
      return;
    }

    const shouldSeed = await this.shouldSeed();
    if (!shouldSeed) {
      return;
    }

    await this.run();
  }

  async run(): Promise<void> {
    let insertedMovies = 0;
    let numOfMoviesPerInsert = 2000;
    for (
      let i = 0;
      i < (moviesJSONArr as TmdbMovie[]).length;
      i += numOfMoviesPerInsert
    ) {
      const movies = (moviesJSONArr as TmdbMovie[]).slice(
        i,
        i + numOfMoviesPerInsert,
      );
      const creatableMovies = movies.map((m) => this.mapToEntity(m));
      await this.moviesRepoRepo.insert(creatableMovies);
      insertedMovies += movies.length;
      this.logger.verbose(`Inserted ${insertedMovies} movies`);
    }
  }
}
