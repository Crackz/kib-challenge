import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from '../entities/base.entity';
import { DeepWritable } from '../types/writable';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

export abstract class BaseRepo<T extends BaseEntity> {
  constructor(private readonly baseRepo: Repository<T>) {}

  async find(
    query?: FindManyOptions<T>['where'],
    opts = {} as { order?: FindManyOptions<T>['order'] },
  ): Promise<T[]> {
    return await this.baseRepo.find({ where: query, ...opts });
  }

  async findOne(
    query?: FindOneOptions<T>['where'],
    opts = {} as { order?: FindManyOptions<T>['order'] },
  ): Promise<T | null> {
    return await this.baseRepo.findOne({ where: query, ...opts });
  }

  async findById<TId extends string | number = string>(
    id: string,
  ): Promise<T | null> {
    return await this.baseRepo.findOne({
      where: { id } as FindOptionsWhere<T & { id: TId }>,
    });
  }

  async findByIdAndUpdate<TId extends string | number = string>(
    id: TId,
    updatedData: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this.baseRepo.update(id, updatedData);
  }

  async create(data: DeepWritable<T>): Promise<T> {
    return await this.baseRepo.save(data as DeepPartial<T>);
  }

  async upsert(
    data: QueryDeepPartialEntity<T>,
    conflictPaths: (keyof T & string)[],
  ): Promise<InsertResult> {
    return await this.baseRepo.upsert(data, conflictPaths);
  }

  async insert(data: DeepWritable<T>[]): Promise<void> {
    await this.baseRepo.insert(data as QueryDeepPartialEntity<T>);
  }

  async update(
    findQuery: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this.baseRepo.update(findQuery, data);
  }

  async deleteById<TId extends string | number = string>(id: TId) {
    await this.baseRepo.delete({ id } as FindOptionsWhere<T & { id: TId }>);
  }

  async count(): Promise<number> {
    return await this.baseRepo.count();
  }
}
