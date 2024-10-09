import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1728417292432 implements MigrationInterface {
  private usersTableName = 'users';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const createTableQuery = `
    CREATE TABLE "${this.usersTableName}" (
      "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      "name" varchar NOT NULL,
      "email" varchar(255) UNIQUE NOT NULL,
      "token" varchar NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;

    await queryRunner.query(createTableQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.usersTableName);
  }
}
