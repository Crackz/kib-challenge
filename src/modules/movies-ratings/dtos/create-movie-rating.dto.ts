import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsNotBlank } from 'src/common/validators/is-not-blank.validator';

export class CreateMovieRatingDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @IsNotBlank()
  review?: string;
}
