import { HttpStatus, Injectable } from '@nestjs/common';
import { MoviesService } from '../movies/services/movies.service';
import { UserEntity } from '../users/entities/user.entity';
import { MoviesFavoritesRepo } from './movies-favorites.repo';

@Injectable()
export class MoviesFavoritesService {
  constructor(
    private readonly moviesFavoritesRepo: MoviesFavoritesRepo,
    private readonly moviesService: MoviesService,
  ) {}

  async favorite(movieId: string, currentUser: UserEntity) {
    const movie = await this.moviesService.checkExist(movieId, {
      statusCode: HttpStatus.NOT_FOUND,
      param: 'movieId',
    });

    await this.moviesFavoritesRepo.upsert(
      {
        movieId: movie.id,
        userId: currentUser.id,
      },
      ['movieId', 'userId'],
    );
  }
}
