import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InMemoryModule } from '../in-memory/in-memory.module';
import { MovieEntity } from './entities/movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesRepo } from './movies.repo';
import { MoviesService } from './services/movies.service';
import { MoviesSeedService } from './seeds/movies-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity]), InMemoryModule],
  controllers: [MoviesController],
  providers: [MoviesService, MoviesRepo, MoviesSeedService],
  exports: [MoviesService],
})
export class MoviesModule {}
