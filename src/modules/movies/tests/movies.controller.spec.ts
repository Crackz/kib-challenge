import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../services/movies.service';
import { FindMoviesDto } from '../dtos/find-movies.dto';
import { MovieDto } from '../dtos/movie.dto';
import { BadRequestException } from '@nestjs/common';
import { MoviesController } from '../movies.controller';
import { randomUUID } from 'crypto';
import { ApiErrors } from 'src/common/utils';
import { CacheModule } from '@nestjs/cache-manager';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: jest.Mocked<MoviesService>;

  beforeEach(async () => {
    const mockMoviesService = {
      getMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: MoviesService, useValue: mockMoviesService }],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    moviesService = module.get(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMany', () => {
    it('should throw errors when service throws errors', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
      };

      moviesService.getMany.mockRejectedValue(
        ApiErrors.BadRequest({
          message: 'invalid input',
          param: 'invalidInput',
        }),
      );

      await expect(controller.getMany(mockFindMoviesDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should pass all parameters to the service', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 5,
        limit: 15,
        genreIds: ['3', '4'],
        title: 'Another Movie',
      };

      moviesService.getMany.mockResolvedValue({ data: [], totalCount: 0 });

      await controller.getMany(mockFindMoviesDto);

      expect(moviesService.getMany).toHaveBeenCalledWith(mockFindMoviesDto);
    });

    it('should return paginated movie results', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
        genreIds: ['1', '2'],
        title: 'Test Movie',
      };

      const mockMovieDto: MovieDto = {
        id: randomUUID(),
        isAdult: false,
        hasVideo: false,
        backdropImg: 'http://example.com/backdrop.jpg',
        posterImg: 'http://example.com/poster.jpg',
        genreIds: [1, 2],
        originalId: 123,
        originalTitle: 'Original Test Movie',
        overview: 'Test overview',
        popularity: 7.5,
        releaseDate: new Date('2023-01-01'),
        title: 'Test Movie',
        voteAverage: 8.0,
        voteCount: 1000,
        averageRating: 4.5,
      };

      const mockServiceResponse = {
        data: [mockMovieDto],
        totalCount: 1,
      };

      moviesService.getMany.mockResolvedValue(mockServiceResponse);

      const result = await controller.getMany(mockFindMoviesDto);

      expect(result).toEqual(mockServiceResponse);
      expect(moviesService.getMany).toHaveBeenCalledWith(mockFindMoviesDto);
    });

    it('should handle empty results', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
      };

      const mockServiceResponse = {
        data: [],
        totalCount: 0,
      };

      moviesService.getMany.mockResolvedValue(mockServiceResponse);

      const result = await controller.getMany(mockFindMoviesDto);

      expect(result).toEqual(mockServiceResponse);
    });

    // TODO: add more unit tests to handle optional parameters
  });
});
