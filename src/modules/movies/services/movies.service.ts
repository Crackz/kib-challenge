import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);
}
