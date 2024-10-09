import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoviesFavoritesTable1728428378529
  implements MigrationInterface
{
  private readonly moviesTableName = 'movies';
  private readonly usersTableName = 'users';
  private readonly moviesFavoritesTableName = 'movies-favorites';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const createTableQuery = `
    CREATE TABLE "${this.moviesFavoritesTableName}" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES ${this.usersTableName}(id),
        "movieId" uuid NOT NULL REFERENCES ${this.moviesTableName}(id),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;

    const indexesQuery = `
        CREATE UNIQUE INDEX ON "${this.moviesFavoritesTableName}" ("movieId", "userId");
    `;
    await queryRunner.query(createTableQuery);
    await queryRunner.query(indexesQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.moviesFavoritesTableName);
  }
}
