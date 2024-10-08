import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Principal } from 'src/common/models/principal.model';
import { OpenApi } from 'src/common/utils';
import { CurrentPrincipal } from '../auth/decorators/principal.decorator';
import { CreateMovieRatingDto } from './dtos/create-movie-rating.dto';
import { MoviesRatingsService } from './movies-ratings.service';
import { TokenAuthGuard } from '../auth/guards/auth.guard';
import { API_KEY_TOKEN } from 'src/common/constants';

@ApiSecurity(API_KEY_TOKEN)
@ApiTags('Movies Ratings')
@ApiUnauthorizedResponse(OpenApi.getApiUnauthorizedResponseErrorOpts())
@Controller('movies/:movieId/ratings')
export class MoviesRatingsController {
  constructor(private readonly moviesRatingsService: MoviesRatingsService) {}

  @ApiUnprocessableEntityResponse(OpenApi.getApiUnprocessableEntityErrorOpts())
  @ApiBadRequestResponse(
    OpenApi.getApiErrorOpts({
      message: 'you have already rated this movie',
      param: 'alreadyRated',
    }),
  )
  @ApiNoContentResponse(OpenApi.getApiNoContentResponseErrorOpts())
  @UseGuards(TokenAuthGuard)
  @Post('/')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rate(
    @Param('movieId') movieId: string,
    @Body() createMovieRatingDto: CreateMovieRatingDto,
    @CurrentPrincipal() principal: Principal,
  ): Promise<void> {
    await this.moviesRatingsService.rate(
      movieId,
      createMovieRatingDto,
      principal.user,
    );
  }
}
