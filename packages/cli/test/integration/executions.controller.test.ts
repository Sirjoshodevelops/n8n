import type { User } from '@n8n/db';

import { ConcurrencyControlService } from '@/concurrency/concurrency-control.service';
import { WaitTracker } from '@/wait-tracker';

import { createSuccessfulExecution, getAllExecutions } from './shared/db/executions';
import { createTeamProject, linkUserToProject } from './shared/db/projects';
import { createMember, createOwner } from './shared/db/users';
import { createWorkflow, shareWorkflowWithUsers } from './shared/db/workflows';
import * as testDb from './shared/test-db';
import { setupTestServer } from './shared/utils';
import { mockInstance } from '../shared/mocking';

mockInstance(WaitTracker);
mockInstance(ConcurrencyControlService, {
	// @ts-expect-error Private property
	isEnabled: false,
});

const testServer = setupTestServer({ endpointGroups: ['executions'] });

let owner: User;
let member: User;

const saveExecution = async ({ belongingTo }: { belongingTo: User }) => {
	const workflow = await createWorkflow({}, belongingTo);
	return await createSuccessfulExecution(workflow);
};

beforeEach(async () => {
	await testDb.truncate(['ExecutionEntity', 'WorkflowEntity', 'SharedWorkflow']);
	testServer.license.reset();
	owner = await createOwner();
	member = await createMember();
});

describe('GET /executions', () => {
	test('only returns executions of shared workflows if sharing is enabled', async () => {
		const workflow = await createWorkflow({}, owner);
		await shareWorkflowWithUsers(workflow, [member]);
		await createSuccessfulExecution(workflow);

		const response1 = await testServer.authAgentFor(member).get('/executions').expect(200);
		expect(response1.body.data.count).toBe(0);

		testServer.license.enable('feat:sharing');

		const response2 = await testServer.authAgentFor(member).get('/executions').expect(200);
		expect(response2.body.data.count).toBe(1);
	});

	test('should return a scopes array for each execution', async () => {
		testServer.license.enable('feat:sharing');
		const workflow = await createWorkflow({}, owner);
		await shareWorkflowWithUsers(workflow, [member]);
		await createSuccessfulExecution(workflow);

		const response = await testServer.authAgentFor(member).get('/executions').expect(200);
		expect(response.body.data.results[0].scopes).toContain('workflow:execute');
	});
});

describe('GET /executions/:id', () => {
	test('project viewers can view executions for workflows in the project', async () => {
		// if sharing is not enabled, we're only returning the executions of
		// personal workflows
		testServer.license.enable('feat:sharing');

		const teamProject = await createTeamProject();
		await linkUserToProject(member, teamProject, 'project:viewer');

		const workflow = await createWorkflow({}, teamProject);
		const execution = await createSuccessfulExecution(workflow);

		const response = await testServer.authAgentFor(member).get(`/executions/${execution.id}`);

		expect(response.statusCode).toBe(200);
		expect(response.body.data).toBeDefined();
	});

	test('only returns executions of shared workflows if sharing is enabled', async () => {
		const workflow = await createWorkflow({}, owner);
		await shareWorkflowWithUsers(workflow, [member]);
		const execution = await createSuccessfulExecution(workflow);

		await testServer.authAgentFor(member).get(`/executions/${execution.id}`).expect(404);

		testServer.license.enable('feat:sharing');

		const response = await testServer
			.authAgentFor(member)
			.get(`/executions/${execution.id}`)
			.expect(200);

		expect(response.body.data.id).toBe(execution.id);
	});
});

describe('POST /executions/delete', () => {
	test('should hard-delete an execution', async () => {
		await saveExecution({ belongingTo: owner });

		const response = await testServer.authAgentFor(owner).get('/executions').expect(200);

		expect(response.body.data.count).toBe(1);

		const [execution] = response.body.data.results;

		await testServer
			.authAgentFor(owner)
			.post('/executions/delete')
			.send({ ids: [execution.id] })
			.expect(200);

		const executions = await getAllExecutions();

		expect(executions).toHaveLength(0);
	});
});
