import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { BaseRepo } from '../../common/repos/base.repo';
import { MovieEntity } from './entities/movie.entity';

@Injectable()
export class MoviesRepo extends BaseRepo<MovieEntity> {
  constructor(
    @InjectRepository(MovieEntity) private repo: Repository<MovieEntity>,
  ) {
    super(repo);
  }

  async searchableFind(filter: {
    offset: number;
    limit: number;
    title?: string;
    genreIds?: number[];
  }): Promise<{ movies: MovieEntity[]; totalCount: number }> {
    const filterQuery: FindOptionsWhere<MovieEntity> = {};

    if (filter.title) {
      filterQuery.title = ILike(`%${filter.title}%`);
    }

    if (filter.genreIds && filter.genreIds.length > 0) {
      filterQuery.genreIds = ArrayContains(filter.genreIds);
    }

    const movies = await this.repo.find({
      where: filterQuery,
      // TODO: add index on popularity to improve performance
      order: { popularity: 'DESC' },
      skip: filter.offset,
      take: filter.limit,
    });

    const totalCount = await this.repo.count({ where: filterQuery });

    return {
      movies,
      totalCount,
    };
  }
}
