import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MOVIES_MODEL_NAME } from '../../../common/constants';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: MOVIES_MODEL_NAME })
export class MovieEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  isAdult: boolean;

  @Column()
  hasVideo: boolean;

  @Column({ nullable: true })
  backdropFilePath?: string;

  @Column({ nullable: true })
  posterFilePath?: string;

  @Column('int', { array: true, nullable: true })
  genreIds?: number[];

  @Column()
  originalId: number;

  @Column({ nullable: true })
  originalTitle?: string;

  @Column({ nullable: true })
  overview?: string;

  @Column()
  popularity: number;

  @Column({ nullable: true })
  releaseDate?: Date;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'decimal' })
  voteAverage: string;

  @Column()
  voteCount: number;

  @Column({ type: 'decimal' })
  averageRating: string;
}
