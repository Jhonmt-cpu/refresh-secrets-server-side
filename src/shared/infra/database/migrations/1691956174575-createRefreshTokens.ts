import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokens1691956174575 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        refresh_token UUID PRIMARY KEY,
        user_id INTEGER NOT NULL,
        next_token UUID,
        expires_in TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (next_token) REFERENCES refresh_tokens(refresh_token) ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS refresh_tokens;
    `);
  }
}
