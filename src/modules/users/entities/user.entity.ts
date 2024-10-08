import { USERS_MODEL_NAME } from 'src/common/constants';
import { BaseTimestampEntity } from 'src/common/entities/base-timestamp.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: USERS_MODEL_NAME })
export class UserEntity extends BaseTimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  token: string;
}
