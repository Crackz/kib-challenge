import { IsDefined, IsEnum, IsNumber, IsString } from 'class-validator';
import { NodeEnvironment } from '../constants';

export class EnvironmentVariables {
  // External Environment Variables

  @IsDefined()
  @IsEnum(NodeEnvironment)
  NODE_ENV: typeof NodeEnvironment;

  // Server

  @IsDefined()
  @IsNumber()
  SERVER_PORT: number;

  // Database

  @IsDefined()
  @IsString()
  DATABASE_NAME: string;

  @IsDefined()
  @IsString()
  DATABASE_HOST: string;

  @IsDefined()
  @IsNumber()
  DATABASE_PORT: number;

  @IsDefined()
  @IsString()
  DATABASE_USERNAME: string;

  @IsDefined()
  @IsString()
  DATABASE_PASSWORD: string;

  // Redis
  @IsDefined()
  @IsString()
  REDIS_HOST: string;

  @IsDefined()
  @IsNumber()
  REDIS_PORT: number;

  // TMDB
  @IsDefined()
  @IsString()
  TMDB_API_URL: string;

  @IsDefined()
  @IsString()
  TMDB_IMAGE_BASE_URL: string;

  @IsDefined()
  @IsString()
  TMDB_API_KEY: string;
}
