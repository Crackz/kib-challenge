import { Module } from '@nestjs/common';
import { MoviesGenresService } from './movies.service';

@Module({
  providers: [MoviesGenresService],
  exports: [MoviesGenresService],
})
export class MoviesGenresModule {}
