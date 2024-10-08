import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../common/env/environment-variables';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  // TODO: Create a type for size attribute
  // TODO: TMDB configurations should be loaded from DB then cached so we can change it without redeploying (Ignored to save time)
  getTMDBFileURL(filePath: string, size = 'original'): string {
    return `${this.configService.get('TMDB_IMAGE_BASE_URL')}/${size}${filePath}`;
  }
}
