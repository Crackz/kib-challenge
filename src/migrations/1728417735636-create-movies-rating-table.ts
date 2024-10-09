import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoviesRatingTable1728417735636
  implements MigrationInterface
{
  private readonly moviesTableName = 'movies';
  private readonly usersTableName = 'users';
  private readonly moviesRatingsTableName = 'movies-ratings';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const createTableQuery = `
    CREATE TABLE "${this.moviesRatingsTableName}" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES ${this.usersTableName}(id),
        "movieId" uuid NOT NULL REFERENCES ${this.moviesTableName}(id),
        "rating" DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
        "review" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;

    const indexesQuery = `
        CREATE UNIQUE INDEX ON "${this.moviesRatingsTableName}" ("movieId", "userId");
    `;
    await queryRunner.query(createTableQuery);
    await queryRunner.query(indexesQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.moviesRatingsTableName);
  }
}
