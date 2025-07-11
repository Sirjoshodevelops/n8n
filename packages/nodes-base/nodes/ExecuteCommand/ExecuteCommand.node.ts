import { exec } from 'child_process';
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export interface IExecReturnData {
	exitCode: number;
	error?: Error;
	stderr: string;
	stdout: string;
}

/**
 * Promisifiy exec manually to also get the exit code
 *
 */
async function execPromise(command: string): Promise<IExecReturnData> {
	const returnData: IExecReturnData = {
		error: undefined,
		exitCode: 0,
		stderr: '',
		stdout: '',
	};

	return await new Promise((resolve, _reject) => {
		exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
			returnData.stdout = stdout.trim();
			returnData.stderr = stderr.trim();

			if (error) {
				returnData.error = error;
			}

			resolve(returnData);
		}).on('exit', (code) => {
			returnData.exitCode = code || 0;
		});
	});
}

export class ExecuteCommand implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Execute Command',
		name: 'executeCommand',
		icon: 'fa:terminal',
		iconColor: 'crimson',
		group: ['transform'],
		version: 1,
		description: 'Executes a command on the host',
		defaults: {
			name: 'Execute Command',
			color: '#886644',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Execute Once',
				name: 'executeOnce',
				type: 'boolean',
				default: true,
				description: 'Whether to execute only once instead of once for each entry',
			},
			{
				displayName: 'Command',
				name: 'command',
				typeOptions: {
					rows: 5,
				},
				type: 'string',
				default: '',
				placeholder: 'echo "test"',
				description: 'The command to execute',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let items = this.getInputData();

		let command: string;
		const executeOnce = this.getNodeParameter('executeOnce', 0) as boolean;

		if (executeOnce) {
			items = [items[0]];
		}

		const returnItems: INodeExecutionData[] = [];
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				command = this.getNodeParameter('command', itemIndex) as string;

				const { error, exitCode, stdout, stderr } = await execPromise(command);

				if (error !== undefined) {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex });
				}

				returnItems.push({
					json: {
						exitCode,
						stderr,
						stdout,
					},
					pairedItem: {
						item: itemIndex,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnItems.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnItems];
	}
}
