import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepo } from '../../common/repos/base.repo';
import { MovieRatingEntity } from './entities/movie-rating.entity';

@Injectable()
export class MoviesRatingsRepo extends BaseRepo<MovieRatingEntity> {
  constructor(
    @InjectRepository(MovieRatingEntity)
    private repo: Repository<MovieRatingEntity>,
  ) {
    super(repo);
  }
}
