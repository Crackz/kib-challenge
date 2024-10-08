import { HttpStatus, Injectable } from '@nestjs/common';
import { MoviesService } from '../movies/services/movies.service';
import { MoviesRatingsRepo } from './movies-ratings.repo';
import { UserEntity } from '../users/entities/user.entity';
import { ApiErrors } from 'src/common/utils';
import { CreateMovieRatingDto } from './dtos/create-movie-rating.dto';

@Injectable()
export class MoviesRatingsService {
  constructor(
    private readonly moviesRatingsRepo: MoviesRatingsRepo,
    private readonly moviesService: MoviesService,
  ) {}

  private async checkMoveRatingExist(movieId: string, userId: string) {
    const movieRating = await this.moviesRatingsRepo.findOne({
      userId,
      movieId,
    });

    if (movieRating) {
      throw ApiErrors.BadRequest({
        message: 'you have already rated this movie',
        param: 'alreadyRated',
      });
    }
  }

  async rate(
    movieId: string,
    createMovieRatingDto: CreateMovieRatingDto,
    currentUser: UserEntity,
  ) {
    const movie = await this.moviesService.checkExist(movieId, {
      statusCode: HttpStatus.NOT_FOUND,
      param: 'movieId',
    });

    await this.checkMoveRatingExist(movie.id, currentUser.id);

    await this.moviesRatingsRepo.create({
      movieId: movie.id,
      userId: currentUser.id,
      ...createMovieRatingDto,
    });
  }
}
