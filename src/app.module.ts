import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NodeEnvironment } from './common/constants';
import { EnvironmentVariables } from './common/env/environment-variables';
import { validateEnvironmentVariables } from './common/env/validation';
import { envFilePaths } from './config';
import { typeormConfig } from './config/typeorm';
import { MoviesModule } from './modules/movies/movies.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from './modules/users/users.module';
import { MoviesRatingsModule } from './modules/movies-ratings/movies-ratings.module';
import { MoviesFavoritesModule } from './modules/movies-favorites/movies-favorites.module';

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
    CacheModule.register({
      isGlobal: true,
      // !Note:
      // find movies response would take on average 66 kb with a limit of 1000 cached response
      // it would take on around 66 mb to cache 1000 find movies responses
      max: 1000,
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
