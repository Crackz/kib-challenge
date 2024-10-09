import { HttpStatus, INestApplication, ShutdownSignal } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EnvironmentVariables } from 'src/common/env/environment-variables';
import { HttpExceptionsFilter } from 'src/common/filters/http-exceptions.filter';
import { DefaultValidationPipe } from 'src/common/pipes/default-validation.pipe';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { MoviesRepo } from '../src/modules/movies/movies.repo';
import { TestUtils } from './shared/test-utils';
import { DeepWritable } from 'src/common/types/writable';
import { MovieEntity } from 'src/modules/movies/entities/movie.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let cacheManager: Cache;
  let moviesRepo: MoviesRepo;
  let configService: ConfigService<EnvironmentVariables>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new DefaultValidationPipe());
    app.useGlobalFilters(new HttpExceptionsFilter());
    app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);

    dataSource = app.get<DataSource>(getDataSourceToken());
    cacheManager = app.get<Cache>(CACHE_MANAGER);
    moviesRepo = app.get<MoviesRepo>(MoviesRepo);

    configService = app.get<ConfigService<EnvironmentVariables>>(ConfigService);

    await app.listen(configService.get('SERVER_PORT'));
  });

  afterEach(async () => {
    await Promise.all([
      TestUtils.clearAllDbTables(dataSource),
      TestUtils.clearAllInMemoryDB(cacheManager),
    ]);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/movies (GET)', () => {
    it('should throw unprocessable entity error if limit is invalid', async () => {
      await request(app.getHttpServer())
        .get('/v1/movies?limit=invalid')
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should throw unprocessable entity error if offset is invalid', async () => {
      await request(app.getHttpServer())
        .get('/v1/movies?offset=invalid')
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should throw BadRequest error if genre id is invalid', async () => {
      await request(app.getHttpServer())
        .get('/v1/movies?genreIds=invalid')
        .expect(HttpStatus.BAD_REQUEST);
    });

    // TODO: add more tests for invalid query params

    it('should return an empty list when no movies exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/movies')
        .expect(HttpStatus.OK);

      expect(response.body.data).toEqual([]);
      expect(response.body.totalCount).toBe(0);
    });

    it('should return a list of movies with default pagination', async () => {
      const testMovies: DeepWritable<MovieEntity>[] = [
        {
          title: 'Movie 1',
          originalTitle: 'Movie 1',
          overview: 'This is a test movie',
          popularity: 1000,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [1, 2],
          originalId: 12345,
          averageRating: '4.5',
        },
        {
          title: 'Movie 2',
          originalTitle: 'Movie 2',
          overview: 'This is a test movie',
          popularity: 90,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [6, 5],
          originalId: 12345,
          averageRating: '2.5',
        },
        {
          title: 'Movie 3',
          originalTitle: 'Movie 3',
          overview: 'This is a test movie',
          popularity: 1,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [2, 8],
          originalId: 12345,
          averageRating: '1.5',
        },
      ];

      await moviesRepo.insert(testMovies);

      const response = await request(app.getHttpServer())
        .get('/v1/movies')
        .send();

      expect(response.body.data.length).toBe(3);
      expect(response.body.totalCount).toBe(3);
      expect(response.body.data[0].title).toBe('Movie 1');
      expect(response.body.data[1].title).toBe('Movie 2');
      expect(response.body.data[2].title).toBe('Movie 3');
    });

    it('should filter movies by title', async () => {
      // Create some test movies
      const testMovies: DeepWritable<MovieEntity>[] = [
        {
          title: 'Movie1',
          originalTitle: 'Movie 1',
          overview: 'This is a test movie',
          popularity: 100,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [1, 2],
          originalId: 12345,
          averageRating: '4.5',
        },
        {
          title: 'Movie2',
          originalTitle: 'Movie 2',
          overview: 'This is a test movie',
          popularity: 90,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [6, 5],
          originalId: 12345,
          averageRating: '2.5',
        },
        {
          title: 'Movie3',
          originalTitle: 'Movie 3',
          overview: 'This is a test movie',
          popularity: 30,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [2, 8],
          originalId: 12345,
          averageRating: '1.5',
        },
      ];
      await Promise.all(testMovies.map((movie) => moviesRepo.create(movie)));

      const response = await request(app.getHttpServer())
        .get('/v1/movies?title=Movie1')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.totalCount).toBe(1);
      expect(response.body.data[0].title).toBe('Movie1');
    });

    it('should filter movies by genre', async () => {
      // Create some test movies with genres
      const testMovies: DeepWritable<MovieEntity>[] = [
        {
          title: 'Movie1',
          originalTitle: 'Movie 1',
          overview: 'This is a test movie',
          popularity: 100,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [28, 12],
          originalId: 12345,
          averageRating: '4.5',
        },
        {
          title: 'Movie2',
          originalTitle: 'Movie 2',
          overview: 'This is a test movie',
          popularity: 90,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [35, 80, 99],
          originalId: 12345,
          averageRating: '2.5',
        },
        {
          title: 'Movie3',
          originalTitle: 'Movie 3',
          overview: 'This is a test movie',
          popularity: 30,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [18, 35],
          originalId: 12345,
          averageRating: '1.5',
        },
      ];
      await Promise.all(testMovies.map((movie) => moviesRepo.create(movie)));

      const response = await request(app.getHttpServer())
        .get('/v1/movies?genreIds=35')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(2);
      expect(response.body.totalCount).toBe(2);
      expect(response.body.data[0].title).toBe('Movie2');
      expect(response.body.data[1].title).toBe('Movie3');
    });

    it('should paginate results correctly', async () => {
      // Create 20 test movies
      const testMovies = Array.from({ length: 20 }, (_, i) => ({
        title: `Movie ${i + 1}`,
        popularity: 100 - i,
        originalTitle: 'Movie',
        overview: 'This is a test movie',
        releaseDate: new Date('2023-01-01'),
        voteAverage: '7.5',
        voteCount: 1000,
        isAdult: false,
        hasVideo: true,
        backdropFilePath: '/backdrop.jpg',
        posterFilePath: '/poster.jpg',
        genreIds: [18, 35],
        originalId: 12345,
        averageRating: '1.5',
      }));

      await Promise.all(testMovies.map((movie) => moviesRepo.create(movie)));

      const response = await request(app.getHttpServer())
        .get('/v1/movies?limit=5')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(5);
      expect(response.body.totalCount).toBe(20);

      for (let i = 0; i < 5; i++) {
        expect(response.body.data[i].title).toBe(`Movie ${i + 1}`);
      }
    });

    it('should order movies by popularity', async () => {
      const testMovies: DeepWritable<MovieEntity>[] = [
        {
          title: 'Movie1',
          originalTitle: 'Movie 1',
          overview: 'This is a test movie',
          popularity: 20,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [28, 12],
          originalId: 12345,
          averageRating: '4.5',
        },
        {
          title: 'Movie2',
          originalTitle: 'Movie 2',
          overview: 'This is a test movie',
          popularity: 90,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [35, 80, 99],
          originalId: 12345,
          averageRating: '2.5',
        },
        {
          title: 'Movie3',
          originalTitle: 'Movie 3',
          overview: 'This is a test movie',
          popularity: 30,
          releaseDate: new Date('2023-01-01'),
          voteAverage: '7.5',
          voteCount: 1000,
          isAdult: false,
          hasVideo: true,
          backdropFilePath: '/backdrop.jpg',
          posterFilePath: '/poster.jpg',
          genreIds: [18, 35],
          originalId: 12345,
          averageRating: '1.5',
        },
      ];
      await Promise.all(testMovies.map((movie) => moviesRepo.create(movie)));

      const response = await request(app.getHttpServer())
        .get('/v1/movies')
        .expect(HttpStatus.OK);

      expect(response.body.data[0].title).toBe('Movie2');
      expect(response.body.data[1].title).toBe('Movie3');
      expect(response.body.data[2].title).toBe('Movie1');
    });

    it('should return movies with correct DTO structure', async () => {
      const testMovie: DeepWritable<MovieEntity> = {
        title: 'Test Movie',
        originalTitle: 'Original Test Movie',
        overview: 'This is a test movie overview',
        popularity: 100,
        releaseDate: new Date('2023-01-01'),
        voteAverage: '7.5',
        voteCount: 1000,
        isAdult: false,
        hasVideo: true,
        backdropFilePath: '/backdrop.jpg',
        posterFilePath: '/poster.jpg',
        genreIds: [28, 12],
        originalId: 12345,
        averageRating: '4.5',
      };

      await moviesRepo.create(testMovie);
      const response = await request(app.getHttpServer())
        .get('/v1/movies')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(1);
      const movieDto = response.body.data[0];

      expect(movieDto).toHaveProperty('id');
      expect(movieDto).toHaveProperty('title', 'Test Movie');
      expect(movieDto).toHaveProperty('originalTitle', 'Original Test Movie');
      expect(movieDto).toHaveProperty(
        'overview',
        'This is a test movie overview',
      );
      expect(movieDto).toHaveProperty('popularity', 100);
      expect(movieDto).toHaveProperty(
        'releaseDate',
        '2022-12-31T23:00:00.000Z',
      );
      expect(movieDto).toHaveProperty('voteAverage', 7.5);
      expect(movieDto).toHaveProperty('voteCount', 1000);
      expect(movieDto).toHaveProperty('isAdult', false);
      expect(movieDto).toHaveProperty('hasVideo', true);
      expect(movieDto).toHaveProperty(
        'backdropImg',
        'https://image.tmdb.org/t/p/original/backdrop.jpg',
      );
      expect(movieDto).toHaveProperty(
        'posterImg',
        'https://image.tmdb.org/t/p/original/poster.jpg',
      );
      expect(movieDto).toHaveProperty('genreIds', [28, 12]);
      expect(movieDto).toHaveProperty('originalId', 12345);
      expect(movieDto).toHaveProperty('averageRating', 4.5);
    });

    it('should handle null values in movie DTO', async () => {
      const testMovie: DeepWritable<MovieEntity> = {
        title: 'Null Test Movie',
        originalTitle: null,
        overview: null,
        popularity: 50,
        releaseDate: null,
        voteAverage: '2.5',
        voteCount: 1000,
        isAdult: false,
        hasVideo: false,
        backdropFilePath: null,
        posterFilePath: null,
        genreIds: [],
        originalId: 67890,
        averageRating: '0',
      };

      await moviesRepo.create(testMovie);

      const response = await request(app.getHttpServer())
        .get('/v1/movies')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(1);
      const movieDto = response.body.data[0];

      expect(movieDto).toHaveProperty('id');
      expect(movieDto).toHaveProperty('title', 'Null Test Movie');
      expect(movieDto).toHaveProperty('originalTitle', null);
      expect(movieDto).toHaveProperty('overview', null);
      expect(movieDto).toHaveProperty('popularity', 50);
      expect(movieDto).toHaveProperty('releaseDate', null);
      expect(movieDto).toHaveProperty('voteAverage', 2.5);
      expect(movieDto).toHaveProperty('voteCount', 1000);
      expect(movieDto).toHaveProperty('isAdult', false);
      expect(movieDto).toHaveProperty('hasVideo', false);
      expect(movieDto).toHaveProperty('backdropImg', null);
      expect(movieDto).toHaveProperty('posterImg', null);
      expect(movieDto).toHaveProperty('genreIds', []);
      expect(movieDto).toHaveProperty('originalId', 67890);
      expect(movieDto).toHaveProperty('averageRating', 0);
    });

    it('should return correct data types for movie properties', async () => {
      const testMovie: DeepWritable<MovieEntity> = {
        title: 'Type Test Movie',
        originalTitle: 'Original Type Test Movie',
        overview: 'This is a test movie for data types',
        popularity: 75.5,
        releaseDate: new Date('2023-06-15Z'),
        voteAverage: '8.7',
        voteCount: 5000,
        isAdult: true,
        hasVideo: false,
        backdropFilePath: '/backdrop_type_test.jpg',
        posterFilePath: '/poster_type_test.jpg',
        genreIds: [18, 28, 53],
        originalId: 24680,
        averageRating: '4.2',
      };

      await moviesRepo.create(testMovie);

      const response = await request(app.getHttpServer())
        .get('/v1/movies')
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBe(1);
      const movieDto = response.body.data[0];

      expect(typeof movieDto.id).toBe('string');
      expect(typeof movieDto.title).toBe('string');
      expect(typeof movieDto.originalTitle).toBe('string');
      expect(typeof movieDto.overview).toBe('string');
      expect(typeof movieDto.popularity).toBe('number');
      expect(typeof movieDto.releaseDate).toBe('string');
      expect(typeof movieDto.voteAverage).toBe('number');
      expect(typeof movieDto.voteCount).toBe('number');
      expect(typeof movieDto.isAdult).toBe('boolean');
      expect(typeof movieDto.hasVideo).toBe('boolean');
      expect(typeof movieDto.backdropImg).toBe('string');
      expect(typeof movieDto.posterImg).toBe('string');
      expect(Array.isArray(movieDto.genreIds)).toBe(true);
      expect(typeof movieDto.originalId).toBe('number');
      expect(typeof movieDto.averageRating).toBe('number');
    });
  });
});
