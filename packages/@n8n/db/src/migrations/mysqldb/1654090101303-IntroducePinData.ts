import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class IntroducePinData1654090101303 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`ALTER TABLE \`${tablePrefix}workflow_entity\` ADD \`pinData\` json`);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			`ALTER TABLE \`${tablePrefix}workflow_entity\` DROP COLUMN \`pinData\``,
		);
	}
}
