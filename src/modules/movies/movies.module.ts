import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { MovieEntity } from './entities/movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesRepo } from './movies.repo';
import { MoviesSeedService } from './seeds/movies-seeder.service';
import { MoviesService } from './services/movies.service';
import { MoviesGenresModule } from '../movies-genres/movies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieEntity]),
    FilesModule,
    MoviesGenresModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService, MoviesRepo, MoviesSeedService],
  exports: [MoviesService],
})
export class MoviesModule {}
