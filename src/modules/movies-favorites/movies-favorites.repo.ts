import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepo } from '../../common/repos/base.repo';
import { MovieFavoriteEntity } from './entities/movie-favorite.entity';

@Injectable()
export class MoviesFavoritesRepo extends BaseRepo<MovieFavoriteEntity> {
  constructor(
    @InjectRepository(MovieFavoriteEntity)
    private repo: Repository<MovieFavoriteEntity>,
  ) {
    super(repo);
  }
}
