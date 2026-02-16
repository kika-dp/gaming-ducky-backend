import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlayCountAndReactions1739509800000 implements MigrationInterface {
  name = 'AddPlayCountAndReactions1739509800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add playCount column to games table if it doesn't exist
    const playCountExists = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='games' AND column_name='playCount'`,
    );

    if (playCountExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "games" ADD "playCount" integer NOT NULL DEFAULT 0`,
      );
    }

    // Create game_reactions table if it doesn't exist
    const tableExists = await queryRunner.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='game_reactions'`,
    );

    if (tableExists.length === 0) {
      await queryRunner.query(
        `CREATE TABLE "game_reactions" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "userId" character varying NOT NULL,
          "gameId" uuid NOT NULL,
          "reactionType" character varying(10) NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_game_reactions_userId_gameId" UNIQUE ("userId", "gameId"),
          CONSTRAINT "CHK_game_reactions_reactionType" CHECK ("reactionType" IN ('like', 'dislike')),
          CONSTRAINT "PK_game_reactions" PRIMARY KEY ("id")
        )`,
      );

      // Add foreign key constraint
      await queryRunner.query(
        `ALTER TABLE "game_reactions" ADD CONSTRAINT "FK_game_reactions_gameId" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "game_reactions" DROP CONSTRAINT "FK_game_reactions_gameId"`,
    );

    // Drop game_reactions table
    await queryRunner.query(`DROP TABLE "game_reactions"`);

    // Remove playCount column from games table
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "playCount"`);
  }
}
