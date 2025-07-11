import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class CommunityNodes1652254514002 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			`CREATE TABLE ${tablePrefix}installed_packages (` +
				'"packageName" VARCHAR(214) NOT NULL,' +
				'"installedVersion" VARCHAR(50) NOT NULL,' +
				'"authorName" VARCHAR(70) NULL,' +
				'"authorEmail" VARCHAR(70) NULL,' +
				'"createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
				'"updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
				`CONSTRAINT "PK_${tablePrefix}08cc9197c39b028c1e9beca225940576fd1a5804" PRIMARY KEY ("packageName")` +
				');',
		);

		await queryRunner.query(
			`CREATE TABLE ${tablePrefix}installed_nodes (` +
				'"name" VARCHAR(200) NOT NULL, ' +
				'"type" VARCHAR(200) NOT NULL, ' +
				'"latestVersion" integer NOT NULL DEFAULT 1, ' +
				'"package" VARCHAR(241) NOT NULL, ' +
				`CONSTRAINT "PK_${tablePrefix}8ebd28194e4f792f96b5933423fc439df97d9689" PRIMARY KEY ("name"), ` +
				`CONSTRAINT "FK_${tablePrefix}73f857fc5dce682cef8a99c11dbddbc969618951" FOREIGN KEY ("package") REFERENCES ${tablePrefix}installed_packages ("packageName") ON DELETE CASCADE ON UPDATE CASCADE ` +
				');',
		);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`DROP TABLE "${tablePrefix}installed_nodes"`);
		await queryRunner.query(`DROP TABLE "${tablePrefix}installed_packages"`);
	}
}
