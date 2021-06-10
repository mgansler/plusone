import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUserEmail1623235927068 implements MigrationInterface {
  name = 'addUserEmail1623235927068'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feeds_user" ADD "email" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feeds_user" DROP COLUMN "email"`)
  }
}
