import { BaseTimestampEntity } from 'src/common/entities/base-timestamp.entity';
import { MovieEntity } from 'src/modules/movies/entities/movie.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MOVIES_RATING_MODEL_NAME } from '../../../common/constants';

@Entity({ name: MOVIES_RATING_MODEL_NAME })
export class MovieRatingEntity extends BaseTimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'decimal' })
  rating: number;

  @Column({ nullable: true })
  review?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  movieId: string;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  readonly user: UserEntity;

  @ManyToOne(() => MovieEntity, (movie) => movie.id, {
    onDelete: 'CASCADE',
  })
  readonly movie: MovieEntity;
}
