const { MigrationInterface, QueryRunner } = require('typeorm')

module.exports = class init1623489981749 {
  name = 'init1623489981749'

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "contentBody" character varying NOT NULL, "guid" character varying NOT NULL, "link" character varying NOT NULL, "title" character varying NOT NULL, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "feed" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "feedUrl" character varying NOT NULL, CONSTRAINT "PK_8a8dfd1ff306ccdf65f0b5d04b2" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "feeds_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying, "isAdmin" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_fc12b3c643ccc9e2c5a3b85af51" UNIQUE ("username"), CONSTRAINT "PK_ca81f22ea67d9df1257df35afb9" PRIMARY KEY ("id"))`,
    )
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "feeds_user"`)
    await queryRunner.query(`DROP TABLE "feed"`)
    await queryRunner.query(`DROP TABLE "article"`)
  }
}
