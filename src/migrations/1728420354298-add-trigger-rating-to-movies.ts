import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTriggerRatingToMovies1728420354298
  implements MigrationInterface
{
  private readonly moviesTableName = 'movies';
  private readonly moviesRatingTableName = 'movies-ratings';
  private readonly averageRatingAttributeName = 'averageRating';
  private readonly averageRatingTriggerFunName = 'updateMovieAverageRating';
  private readonly insertAverageRatingTriggerName =
    'insertAverageRatingTriggerName';
  public async up(queryRunner: QueryRunner): Promise<void> {
    const addAverageRatingToMoviesQuery = `
        ALTER TABLE "${this.moviesTableName}" ADD COLUMN "${this.averageRatingAttributeName}" DECIMAL(3, 2) DEFAULT 0;
    `;
    const triggerQuery = `
        -- Create Trigger Function
        CREATE FUNCTION "${this.averageRatingTriggerFunName}"()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE "${this.moviesTableName}"
            SET "${this.averageRatingAttributeName}" = (
                SELECT AVG(rating)
                FROM "${this.moviesRatingTableName}"
                WHERE "movieId" = NEW."movieId"
            )
            WHERE "id" = NEW."movieId";
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger for INSERT
        CREATE TRIGGER "${this.insertAverageRatingTriggerName}"
        AFTER INSERT ON "${this.moviesRatingTableName}"
        FOR EACH ROW
        EXECUTE FUNCTION "${this.averageRatingTriggerFunName}"();
    `;

    await queryRunner.query(addAverageRatingToMoviesQuery);
    await queryRunner.query(triggerQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const removeAverageRatingFromMoviesQuery = `
        ALTER TABLE "${this.moviesTableName}" DROP COLUMN "${this.averageRatingAttributeName}"
    `;

    const dropTriggerQuery = `
        DROP TRIGGER "${this.insertAverageRatingTriggerName}" ON "${this.moviesRatingTableName}";
        DROP FUNCTION "${this.averageRatingTriggerFunName}"();
    `;

    await queryRunner.query(removeAverageRatingFromMoviesQuery);
    await queryRunner.query(dropTriggerQuery);
  }
}
