import type { User } from '@n8n/db';
import type { ExecutionEntity } from '@n8n/db';
import { Container, Service } from '@n8n/di';
import { mock } from 'jest-mock-extended';
import { DirectedGraph, WorkflowExecute } from 'n8n-core';
import * as core from 'n8n-core';
import type {
	IExecuteData,
	INode,
	IRun,
	ITaskData,
	IWaitingForExecution,
	IWaitingForExecutionSource,
	IWorkflowBase,
	IWorkflowExecutionDataProcess,
	StartNodeData,
	IWorkflowExecuteAdditionalData,
} from 'n8n-workflow';
import { Workflow, type ExecutionError } from 'n8n-workflow';
import PCancelable from 'p-cancelable';

import { ActiveExecutions } from '@/active-executions';
import config from '@/config';
import { ExecutionNotFoundError } from '@/errors/execution-not-found-error';
import { CredentialsPermissionChecker } from '@/executions/pre-execution-checks';
import { ManualExecutionService } from '@/manual-execution.service';
import { Telemetry } from '@/telemetry';
import * as WorkflowExecuteAdditionalData from '@/workflow-execute-additional-data';
import { WorkflowRunner } from '@/workflow-runner';
import { mockInstance } from '@test/mocking';
import { createExecution } from '@test-integration/db/executions';
import { createUser } from '@test-integration/db/users';
import { createWorkflow } from '@test-integration/db/workflows';
import * as testDb from '@test-integration/test-db';
import { setupTestServer } from '@test-integration/utils';

let owner: User;
let runner: WorkflowRunner;
setupTestServer({ endpointGroups: [] });

mockInstance(Telemetry);

beforeAll(async () => {
	owner = await createUser({ role: 'global:owner' });

	runner = Container.get(WorkflowRunner);
});

afterAll(() => {
	jest.restoreAllMocks();
});

beforeEach(async () => {
	await testDb.truncate(['WorkflowEntity', 'SharedWorkflow']);
	jest.clearAllMocks();
});

describe('processError', () => {
	let workflow: IWorkflowBase;
	let execution: ExecutionEntity;
	let hooks: core.ExecutionLifecycleHooks;

	const watcher = mock<{ workflowExecuteAfter: () => Promise<void> }>();

	beforeEach(async () => {
		jest.clearAllMocks();
		workflow = await createWorkflow({}, owner);
		execution = await createExecution({ status: 'success', finished: true }, workflow);
		hooks = new core.ExecutionLifecycleHooks('webhook', execution.id, workflow);
		hooks.addHandler('workflowExecuteAfter', watcher.workflowExecuteAfter);
	});

	test('processError should return early in Bull stalled edge case', async () => {
		const workflow = await createWorkflow({}, owner);
		const execution = await createExecution(
			{
				status: 'success',
				finished: true,
			},
			workflow,
		);
		config.set('executions.mode', 'queue');
		await runner.processError(
			new Error('test') as ExecutionError,
			new Date(),
			'webhook',
			execution.id,
			hooks,
		);
		expect(watcher.workflowExecuteAfter).toHaveBeenCalledTimes(0);
	});

	test('processError should return early if the error is `ExecutionNotFoundError`', async () => {
		const workflow = await createWorkflow({}, owner);
		const execution = await createExecution({ status: 'success', finished: true }, workflow);
		await runner.processError(
			new ExecutionNotFoundError(execution.id),
			new Date(),
			'webhook',
			execution.id,
			hooks,
		);
		expect(watcher.workflowExecuteAfter).toHaveBeenCalledTimes(0);
	});

	test('processError should process error', async () => {
		const workflow = await createWorkflow({}, owner);
		const execution = await createExecution(
			{
				status: 'success',
				finished: true,
			},
			workflow,
		);
		await Container.get(ActiveExecutions).add(
			{ executionMode: 'webhook', workflowData: workflow },
			execution.id,
		);
		config.set('executions.mode', 'regular');
		await runner.processError(
			new Error('test') as ExecutionError,
			new Date(),
			'webhook',
			execution.id,
			hooks,
		);
		expect(watcher.workflowExecuteAfter).toHaveBeenCalledTimes(1);
	});
});

describe('run', () => {
	it('uses recreateNodeExecutionStack to create a partial execution if a triggerToStartFrom with data is sent', async () => {
		// ARRANGE
		const activeExecutions = Container.get(ActiveExecutions);
		jest.spyOn(activeExecutions, 'add').mockResolvedValue('1');
		jest.spyOn(activeExecutions, 'attachWorkflowExecution').mockReturnValueOnce();
		const permissionChecker = Container.get(CredentialsPermissionChecker);
		jest.spyOn(permissionChecker, 'check').mockResolvedValueOnce();

		jest.spyOn(WorkflowExecute.prototype, 'processRunExecutionData').mockReturnValueOnce(
			new PCancelable(() => {
				return mock<IRun>();
			}),
		);

		jest.spyOn(Workflow.prototype, 'getNode').mockReturnValueOnce(mock<INode>());
		jest.spyOn(DirectedGraph, 'fromWorkflow').mockReturnValueOnce(new DirectedGraph());
		const recreateNodeExecutionStackSpy = jest
			.spyOn(core, 'recreateNodeExecutionStack')
			.mockReturnValueOnce({
				nodeExecutionStack: mock<IExecuteData[]>(),
				waitingExecution: mock<IWaitingForExecution>(),
				waitingExecutionSource: mock<IWaitingForExecutionSource>(),
			});

		const data = mock<IWorkflowExecutionDataProcess>({
			triggerToStartFrom: { name: 'trigger', data: mock<ITaskData>() },

			workflowData: { nodes: [] },
			executionData: undefined,
			startNodes: [mock<StartNodeData>()],
			destinationNode: undefined,
		});

		// ACT
		await runner.run(data);

		// ASSERT
		expect(recreateNodeExecutionStackSpy).toHaveBeenCalled();
	});

	it('does not use recreateNodeExecutionStack to create a partial execution if a triggerToStartFrom without data is sent', async () => {
		// ARRANGE
		const activeExecutions = Container.get(ActiveExecutions);
		jest.spyOn(activeExecutions, 'add').mockResolvedValue('1');
		jest.spyOn(activeExecutions, 'attachWorkflowExecution').mockReturnValueOnce();
		const permissionChecker = Container.get(CredentialsPermissionChecker);
		jest.spyOn(permissionChecker, 'check').mockResolvedValueOnce();

		jest.spyOn(WorkflowExecute.prototype, 'processRunExecutionData').mockReturnValueOnce(
			new PCancelable(() => {
				return mock<IRun>();
			}),
		);

		const recreateNodeExecutionStackSpy = jest.spyOn(core, 'recreateNodeExecutionStack');

		const data = mock<IWorkflowExecutionDataProcess>({
			triggerToStartFrom: { name: 'trigger', data: undefined },

			workflowData: { nodes: [] },
			executionData: undefined,
			startNodes: [mock<StartNodeData>()],
			destinationNode: undefined,
		});

		// ACT
		await runner.run(data);

		// ASSERT
		expect(recreateNodeExecutionStackSpy).not.toHaveBeenCalled();
	});

	it('run partial execution with additional data', async () => {
		// ARRANGE
		const activeExecutions = Container.get(ActiveExecutions);
		jest.spyOn(activeExecutions, 'add').mockResolvedValue('1');
		jest.spyOn(activeExecutions, 'attachWorkflowExecution').mockReturnValueOnce();
		const permissionChecker = Container.get(CredentialsPermissionChecker);
		jest.spyOn(permissionChecker, 'check').mockResolvedValueOnce();
		jest.spyOn(WorkflowExecute.prototype, 'processRunExecutionData').mockReturnValueOnce(
			new PCancelable(() => {
				return mock<IRun>();
			}),
		);

		jest.spyOn(Workflow.prototype, 'getNode').mockReturnValueOnce(mock<INode>());
		jest.spyOn(DirectedGraph, 'fromWorkflow').mockReturnValueOnce(new DirectedGraph());

		const additionalData = mock<IWorkflowExecuteAdditionalData>();
		jest.spyOn(WorkflowExecuteAdditionalData, 'getBase').mockResolvedValue(additionalData);
		jest.spyOn(ManualExecutionService.prototype, 'runManually');
		jest.spyOn(core, 'recreateNodeExecutionStack').mockReturnValueOnce({
			nodeExecutionStack: mock<IExecuteData[]>(),
			waitingExecution: mock<IWaitingForExecution>(),
			waitingExecutionSource: mock<IWaitingForExecutionSource>(),
		});

		const data = mock<IWorkflowExecutionDataProcess>({
			triggerToStartFrom: { name: 'trigger', data: mock<ITaskData>() },

			workflowData: { nodes: [] },
			executionData: undefined,
			startNodes: [mock<StartNodeData>()],
			destinationNode: undefined,
			runData: {
				trigger: [mock<ITaskData>({ executionIndex: 7 })],
				otherNode: [mock<ITaskData>({ executionIndex: 8 }), mock<ITaskData>({ executionIndex: 9 })],
			},
			userId: 'mock-user-id',
		});

		// ACT
		await runner.run(data);

		// ASSERT
		expect(WorkflowExecuteAdditionalData.getBase).toHaveBeenCalledWith(
			data.userId,
			undefined,
			undefined,
		);
		expect(ManualExecutionService.prototype.runManually).toHaveBeenCalledWith(
			data,
			expect.any(Workflow),
			additionalData,
			'1',
			undefined,
		);
	});
});

describe('enqueueExecution', () => {
	const setupQueue = jest.fn();
	const addJob = jest.fn();

	@Service()
	class MockScalingService {
		setupQueue = setupQueue;

		addJob = addJob;
	}

	beforeAll(() => {
		jest.mock('@/scaling/scaling.service', () => ({
			ScalingService: MockScalingService,
		}));
	});

	afterAll(() => {
		jest.unmock('@/scaling/scaling.service');
	});

	it('should setup queue when scalingService is not initialized', async () => {
		const activeExecutions = Container.get(ActiveExecutions);
		jest.spyOn(activeExecutions, 'attachWorkflowExecution').mockReturnValue();
		jest.spyOn(runner, 'processError').mockResolvedValue();
		const data = mock<IWorkflowExecutionDataProcess>({
			workflowData: { nodes: [] },
			executionData: undefined,
		});
		const error = new Error('stop for test purposes');

		// mock a rejection to stop execution flow before we create the PCancelable promise,
		// so that Jest does not move on to tear down the suite until the PCancelable settles
		addJob.mockRejectedValueOnce(error);

		// @ts-expect-error Private method
		await expect(runner.enqueueExecution('1', data)).rejects.toThrowError(error);

		expect(setupQueue).toHaveBeenCalledTimes(1);
	});
});
