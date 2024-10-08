export class MovieDto {
  id: string;
  isAdult: boolean;
  hasVideo: boolean;
  backdropImg?: string;
  posterImg?: string;
  genreIds?: number[];
  originalId: number;
  originalTitle?: string;
  overview?: string;
  popularity: number;
  releaseDate?: Date;
  title?: string;
  voteAverage: number;
  voteCount: number;
  averageRating: number;
}
