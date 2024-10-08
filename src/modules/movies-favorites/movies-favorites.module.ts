import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from '../movies/movies.module';
import { UsersModule } from '../users/users.module';
import { MovieFavoriteEntity } from './entities/movie-favorite.entity';
import { MoviesFavoritesController } from './movies-favorites.controller';
import { MoviesFavoritesRepo } from './movies-favorites.repo';
import { MoviesFavoritesService } from './movies-favorites.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieFavoriteEntity]),
    UsersModule,
    MoviesModule,
  ],
  controllers: [MoviesFavoritesController],
  providers: [MoviesFavoritesService, MoviesFavoritesRepo],
  exports: [MoviesFavoritesService],
})
export class MoviesFavoritesModule {}
