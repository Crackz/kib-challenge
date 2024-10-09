import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NodeEnvironment,
  USER1_AUTH_TOKEN,
  USER2_AUTH_TOKEN,
  USER3_AUTH_TOKEN,
} from 'src/common/constants';
import { EnvironmentVariables } from 'src/common/env/environment-variables';
import { UsersRepo } from '../users.repo';

@Injectable()
export class UsersSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeedService.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly usersRepo: UsersRepo,
  ) {}

  private async shouldSeed(): Promise<boolean> {
    const count = await this.usersRepo.count();
    return count > 0 ? false : true;
  }

  async onApplicationBootstrap() {
    const isDevelopmentEnvironment =
      this.configService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT;
    if (!isDevelopmentEnvironment) {
      return;
    }

    const shouldSeed = await this.shouldSeed();
    if (!shouldSeed) {
      return;
    }

    await this.run();
  }

  async run(): Promise<void> {
    await this.usersRepo.insert([
      {
        name: 'User 1',
        email: 'user1@test.com',
        token: USER1_AUTH_TOKEN,
      },
      {
        name: 'User 2',
        email: 'user2@test.com',
        token: USER2_AUTH_TOKEN,
      },
      {
        name: 'User 3',
        email: 'user3@test.com',
        token: USER3_AUTH_TOKEN,
      },
    ]);

    this.logger.verbose(
      `Inserted 3 dummy users with tokens ${USER1_AUTH_TOKEN}, ${USER2_AUTH_TOKEN}, ${USER3_AUTH_TOKEN}`,
    );
  }
}
