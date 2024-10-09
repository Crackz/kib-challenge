import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NodeEnvironment } from './common/constants';
import { EnvironmentVariables } from './common/env/environment-variables';
import { validateEnvironmentVariables } from './common/env/validation';
import { envFilePaths } from './config';
import { typeormConfig } from './config/typeorm';
import { MoviesFavoritesModule } from './modules/movies-favorites/movies-favorites.module';
import { MoviesRatingsModule } from './modules/movies-ratings/movies-ratings.module';
import { MoviesModule } from './modules/movies/movies.module';
import { UsersModule } from './modules/users/users.module';
import { RedisStore, redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
      load: [typeormConfig],
      validate: validateEnvironmentVariables,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('typeorm');
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => {
        const store = await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        });
        return {
          store: store as RedisStore & CacheStore,
          // !Note:
          // find movies response would take on average 66 kb with a limit of 1000 cached response
          // it would take on around 66 mb to cache 1000 find movies responses
          max: 1000,
        };
      },
    }),
    UsersModule,
    MoviesModule,
    MoviesRatingsModule,
    MoviesFavoritesModule,
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}
  async onModuleInit() {
    if (
      this.configService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT ||
      this.configService.get('NODE_ENV') === NodeEnvironment.TESTING
    ) {
      await this.dataSource.runMigrations();
      this.logger.log('Migrations are executed');
    }
  }
}
