import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoviesTable1728166097112 implements MigrationInterface {
  private moviesTableName = 'movies';
  private titleSearchIdxName = 'title_search_idx';
  public async up(queryRunner: QueryRunner): Promise<void> {
    const createTableQuery = `
    CREATE TABLE "${this.moviesTableName}" (
      "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      "isAdult" BOOLEAN NOT NULL,
      "hasVideo" BOOLEAN NOT NULL,
      "backdropFilePath" VARCHAR,
      "posterFilePath" VARCHAR,
      "genreIds" INTEGER ARRAY,
      "originalId" INTEGER NOT NULL,
      "originalTitle" VARCHAR,
      "overview" VARCHAR,
      "popularity" DECIMAL NOT NULL,
      "releaseDate" DATE,
      "title" VARCHAR,
      "voteAverage" DECIMAL NOT NULL,
      "voteCount" DECIMAL NOT NULL
    );`;

    const indexesQuery = `
      CREATE EXTENSION pg_trgm;
      CREATE EXTENSION btree_gin;
      CREATE INDEX "${this.titleSearchIdxName}" ON "${this.moviesTableName}" USING GIN (title gin_trgm_ops);
    `;
    await queryRunner.query(createTableQuery);
    await queryRunner.query(indexesQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX "${this.titleSearchIdxName}";
        DROP EXTENSION btree_gin;    
        DROP EXTENSION pg_trgm;    
    `);
    await queryRunner.dropTable(this.moviesTableName);
  }
}
