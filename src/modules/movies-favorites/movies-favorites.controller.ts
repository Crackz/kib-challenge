import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { API_KEY_TOKEN } from 'src/common/constants';
import { Principal } from 'src/common/models/principal.model';
import { OpenApi } from 'src/common/utils';
import { CurrentPrincipal } from '../auth/decorators/principal.decorator';
import { TokenAuthGuard } from '../auth/guards/auth.guard';
import { MoviesFavoritesService } from './movies-favorites.service';

@ApiSecurity(API_KEY_TOKEN)
@ApiTags('Movies Favorites')
@ApiUnauthorizedResponse(OpenApi.getApiUnauthorizedResponseErrorOpts())
@ApiNotFoundResponse(
  OpenApi.getApiErrorOpts({ message: 'Movie not found', param: 'movieId' }),
)
@Controller('movies/:movieId/favorite')
export class MoviesFavoritesController {
  constructor(
    private readonly moviesFavoritesService: MoviesFavoritesService,
  ) {}

  @ApiNoContentResponse(OpenApi.getApiNoContentResponseErrorOpts())
  @UseGuards(TokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/')
  async rate(
    @Param('movieId') movieId: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<void> {
    await this.moviesFavoritesService.favorite(movieId, principal.user);
  }
}
