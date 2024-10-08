import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MoviesService } from './services/movies.service';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}
}
