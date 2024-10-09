import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { ApiErrors } from 'src/common/utils';
import { FilesService } from 'src/modules/files/files.service';
import { MoviesGenresService } from 'src/modules/movies-genres/movies.service';
import { FindMoviesDto } from '../dtos/find-movies.dto';
import { MovieEntity } from '../entities/movie.entity';
import { MoviesRepo } from '../movies.repo';
import { MoviesService } from '../services/movies.service';

describe('MoviesService', () => {
  let service: MoviesService;
  let moviesRepo: jest.Mocked<MoviesRepo>;
  let filesService: jest.Mocked<FilesService>;
  let moviesGenresService: jest.Mocked<MoviesGenresService>;

  beforeEach(async () => {
    const mockMoviesRepo = {
      searchableFind: jest.fn(),
    };
    const mockFilesService = {
      getTMDBFileURL: jest.fn(),
    };
    const mockMoviesGenresService = {
      isValidId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: MoviesRepo, useValue: mockMoviesRepo },
        { provide: FilesService, useValue: mockFilesService },
        { provide: MoviesGenresService, useValue: mockMoviesGenresService },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepo = module.get(MoviesRepo);
    filesService = module.get(FilesService);
    moviesGenresService = module.get(MoviesGenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMany', () => {
    it('should throw BadRequest error for invalid genre id', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
        genreIds: ['1', 'invalid'],
        title: 'Test Movie',
      };

      moviesGenresService.isValidId
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await expect(service.getMany(mockFindMoviesDto)).rejects.toThrow(
        ApiErrors.BadRequest({
          message: `${mockFindMoviesDto.genreIds[1]} is invalid genre id`,
          param: 'invalidGenreId',
        }),
      );
    });

    it('should return paginated movie results', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
        genreIds: ['1', '2'],
        title: 'Test Movie',
      };

      const uuid = randomUUID();
      const mockMovieEntity: MovieEntity = {
        id: uuid,
        isAdult: false,
        hasVideo: false,
        backdropFilePath: 'backdrop.jpg',
        posterFilePath: 'poster.jpg',
        genreIds: [1, 2],
        originalId: 123,
        originalTitle: 'Original Test Movie',
        overview: 'Test overview',
        popularity: 7.5,
        releaseDate: new Date('2023-01-01Z'),
        title: 'Test Movie',
        voteAverage: 8.0,
        voteCount: 1000,
        averageRating: '4.5',
      };

      moviesGenresService.isValidId.mockReturnValue(true);
      moviesRepo.searchableFind.mockResolvedValue({
        movies: [mockMovieEntity],
        totalCount: 1,
      });
      filesService.getTMDBFileURL.mockReturnValue(
        'http://example.com/image.jpg',
      );

      const result = await service.getMany(mockFindMoviesDto);

      expect(result).toEqual({
        data: [
          {
            id: uuid,
            isAdult: false,
            hasVideo: false,
            backdropImg: 'http://example.com/image.jpg',
            posterImg: 'http://example.com/image.jpg',
            genreIds: [1, 2],
            originalId: 123,
            originalTitle: 'Original Test Movie',
            overview: 'Test overview',
            popularity: 7.5,
            releaseDate: new Date('2023-01-01Z'),
            title: 'Test Movie',
            voteAverage: 8.0,
            voteCount: 1000,
            averageRating: 4.5,
          },
        ],
        totalCount: 1,
      });

      expect(moviesGenresService.isValidId).toHaveBeenCalledTimes(2);
      expect(moviesRepo.searchableFind).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        genreIds: [1, 2],
        title: 'Test Movie',
      });
      expect(filesService.getTMDBFileURL).toHaveBeenCalledTimes(2);
    });

    it('should return empty result when no movies found', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
      };

      moviesRepo.searchableFind.mockResolvedValue({
        movies: [],
        totalCount: 0,
      });

      const result = await service.getMany(mockFindMoviesDto);

      expect(result).toEqual({
        data: [],
        totalCount: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 10,
        limit: 5,
      };

      const mockMovies = Array(5)
        .fill(null)
        .map(
          (_, index): MovieEntity => ({
            id: randomUUID(),
            title: `Movie ${index}`,
            isAdult: false,
            hasVideo: false,
            originalId: index,
            popularity: 7.5,
            releaseDate: new Date('2023-01-01Z'),
            voteAverage: 8.0,
            voteCount: 1000,
            averageRating: '4.5',
          }),
        );

      moviesRepo.searchableFind.mockResolvedValue({
        movies: mockMovies,
        totalCount: 50,
      });

      filesService.getTMDBFileURL.mockReturnValue(
        'http://example.com/image.jpg',
      );

      const result = await service.getMany(mockFindMoviesDto);

      expect(result.data.length).toBe(5);
      expect(result.totalCount).toBe(50);
    });

    it('should filter by title correctly', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
        title: 'Avengers',
      };

      moviesRepo.searchableFind.mockResolvedValue({
        movies: [
          {
            id: randomUUID(),
            title: 'Avengers: Endgame',
            isAdult: false,
            hasVideo: false,
            originalId: 1,
            popularity: 7.5,
            releaseDate: new Date('2023-01-01Z'),
            voteAverage: 8.0,
            voteCount: 1000,
            averageRating: '4.5',
          },
        ],
        totalCount: 1,
      });

      filesService.getTMDBFileURL.mockReturnValue(
        'http://example.com/image.jpg',
      );

      await service.getMany(mockFindMoviesDto);

      expect(moviesRepo.searchableFind).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Avengers',
        }),
      );
    });

    it('should handle multiple genre ids correctly', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
        genreIds: ['1', '2', '3'],
      };

      moviesGenresService.isValidId.mockReturnValue(true);
      moviesRepo.searchableFind.mockResolvedValue({
        movies: [],
        totalCount: 0,
      });

      await service.getMany(mockFindMoviesDto);

      expect(moviesGenresService.isValidId).toHaveBeenCalledTimes(3);
      expect(moviesRepo.searchableFind).toHaveBeenCalledWith(
        expect.objectContaining({
          genreIds: [1, 2, 3],
        }),
      );
    });

    it('should return movies if genreIds is empty array', async () => {
      const mockFindMoviesDto: FindMoviesDto = {
        offset: 0,
        limit: 10,
      };

      moviesRepo.searchableFind.mockResolvedValue({
        movies: [
          {
            id: randomUUID(),
            title: 'Test Movie',
            isAdult: false,
            hasVideo: false,
            originalId: 1,
            popularity: 7.5,
            releaseDate: new Date('2023-01-01Z'),
            voteAverage: 8.0,
            voteCount: 1000,
            averageRating: '4.5',
          },
        ],
        totalCount: 1,
      });

      const result = await service.getMany(mockFindMoviesDto);

      expect(result).toMatchObject({
        data: [
          {
            id: expect.any(String),
            title: 'Test Movie',
            isAdult: false,
            hasVideo: false,
            originalId: 1,
            popularity: 7.5,
            releaseDate: new Date('2023-01-01Z'),
            voteAverage: 8.0,
            voteCount: 1000,
            averageRating: 4.5,
          },
        ],
        totalCount: 1,
      });
    });

    // Todo: add more unit tests to handle optional parameters
  });
});
