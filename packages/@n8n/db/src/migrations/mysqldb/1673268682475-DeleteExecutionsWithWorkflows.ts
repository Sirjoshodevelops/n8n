import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class DeleteExecutionsWithWorkflows1673268682475 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`ALTER TABLE \`${tablePrefix}execution_entity\` MODIFY workflowId INT`);

		const workflowIds = (await queryRunner.query(`
			SELECT id FROM \`${tablePrefix}workflow_entity\`
		`)) as Array<{ id: number }>;

		await queryRunner.query(
			`DELETE FROM \`${tablePrefix}execution_entity\`
			 WHERE workflowId IS NOT NULL
			 ${workflowIds.length ? `AND workflowId NOT IN (${workflowIds.map(({ id }) => id).join()})` : ''}`,
		);

		await queryRunner.query(
			`ALTER TABLE \`${tablePrefix}execution_entity\`
			 ADD CONSTRAINT \`FK_${tablePrefix}execution_entity_workflowId\`
			 FOREIGN KEY (\`workflowId\`) REFERENCES \`${tablePrefix}workflow_entity\`(\`id\`)
			 ON DELETE CASCADE`,
		);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			`ALTER TABLE \`${tablePrefix}execution_entity\`
			 DROP FOREIGN KEY \`FK_${tablePrefix}execution_entity_workflowId\``,
		);

		await queryRunner.query(
			`ALTER TABLE \`${tablePrefix}execution_entity\` MODIFY workflowId varchar(255);`,
		);
	}
}
