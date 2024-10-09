import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EnvironmentVariables } from 'src/common/env/environment-variables';
import { sleep } from 'src/common/utils';
import {
  TmdbDiscoverResponse,
  TmdbMovie,
} from '../interfaces/movies-scrapper.interface';
import * as fs from 'node:fs/promises';

@Injectable()
export class MoviesScrapperService implements OnModuleInit {
  private tmdbApiKey: string;
  private tmdbMoviesDiscoverUrl: string;
  private readonly moviesPerPage = 20;
  // Note: Tmdb API QPS limit is around 50 requests per second (lower it to be respectful)
  private readonly maxRequestsPerSecond = 30;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.tmdbApiKey = this.configService.get('TMDB_API_KEY');
    this.tmdbMoviesDiscoverUrl = `${this.configService.get('TMDB_API_URL')}/discover/movie`;
  }

  // Fetch a single page of movies
  private async fetchMoviesPage(
    page: number,
    retries = 3,
  ): Promise<TmdbMovie[]> {
    try {
      const response = await axios.get<TmdbDiscoverResponse>(
        this.tmdbMoviesDiscoverUrl,
        {
          params: {
            api_key: this.tmdbApiKey,
            page: page,
          },
        },
      );
      return response.data.results;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying... (${retries} retries left)`);
        await sleep(1000); // Wait for 1 second before retrying
        return this.fetchMoviesPage(page, retries - 1);
      } else {
        throw new Error(`Failed to fetch page ${page}: ${error}`);
      }
    }
  }

  private async fetchMovies(totalMovies: number): Promise<TmdbMovie[]> {
    if (totalMovies < this.moviesPerPage) {
      throw new Error(
        'Due to the TMDb API limits, you can not fetch lower than 20 movies at a time.',
      );
    }

    const totalPages = Math.ceil(totalMovies / this.moviesPerPage);
    const allMovies: TmdbMovie[] = [];

    for (let i = 1; i <= totalPages; i += this.maxRequestsPerSecond) {
      const pagePromises = [];

      // Collect promises for up to requestsPerSecond at a time
      for (
        let j = 0;
        j < this.maxRequestsPerSecond && i + j <= totalPages;
        j++
      ) {
        console.log('Requesting Page: ', i + j);
        pagePromises.push(this.fetchMoviesPage(i + j));
      }

      // Wait for all the pages in the current batch to resolve
      const moviesBatch = await Promise.all(pagePromises);

      // Flatten the results and add to the main list
      moviesBatch.forEach((batch) => allMovies.push(...batch));

      // Sleep for 1 second to respect the requestsPerSecond rate limit
      await sleep(1000);
    }

    return allMovies;
  }

  async onModuleInit() {
    // !Note: all data is stored in memory at some point instead of writing to disk
    // It's about 6MB for 10K Movies so I'm skipping this step! Just to save time
    const totalMovies = 10000;
    const movies = await this.fetchMovies(totalMovies);
    const moviesFileName = 'movies.json';
    const moviesDirPath = `${__dirname}/../../../../../src/modules/movies/seeds/data`;
    await fs.mkdir(moviesDirPath, { recursive: true });
    await fs.writeFile(
      `${moviesDirPath}/${moviesFileName}`,
      JSON.stringify(movies),
    );
  }
}
