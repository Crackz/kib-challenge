import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from '../movies/movies.module';
import { UsersModule } from '../users/users.module';
import { MovieRatingEntity } from './entities/movie-rating.entity';
import { MoviesRatingsController } from './movies-ratings.controller';
import { MoviesRatingsRepo } from './movies-ratings.repo';
import { MoviesRatingsService } from './movies-ratings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieRatingEntity]),
    UsersModule,
    MoviesModule,
  ],
  controllers: [MoviesRatingsController],
  providers: [MoviesRatingsService, MoviesRatingsRepo],
  exports: [MoviesRatingsService],
})
export class MoviesRatingsModule {}
