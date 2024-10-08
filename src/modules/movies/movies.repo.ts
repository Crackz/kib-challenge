import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepo } from '../../common/repos/base.repo';
import { MovieEntity } from './entities/movie.entity';

@Injectable()
export class MoviesRepo extends BaseRepo<MovieEntity> {
  constructor(
    @InjectRepository(MovieEntity) private repo: Repository<MovieEntity>,
  ) {
    super(repo);
  }
}
