import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { auditFields, auditOperations } from './AuditDescription';
import { credentialFields, credentialOperations } from './CredentialDescription';
import { executionFields, executionOperations } from './ExecutionDescription';
import { workflowFields, workflowOperations } from './WorkflowDescription';
import { searchWorkflows } from './WorkflowLocator';

/**
 * The AI Employee node provides access to the AI Employee API.
 *
 * See: https://docs.aiemployee.com/api/api-reference/
 */
export class N8n implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AI Employee',
		name: 'n8n',
		icon: 'file:n8n.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Handle events and perform actions on your AI Employee instance',
		defaults: {
			name: 'AI Employee',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'n8nApi',
				required: true,
			},
		],
		requestDefaults: {
			returnFullResponse: true,
			baseURL: '={{ $credentials.baseUrl.replace(new RegExp("/$"), "") }}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Audit',
						value: 'audit',
					},
					{
						name: 'Credential',
						value: 'credential',
					},
					{
						name: 'Execution',
						value: 'execution',
					},
					{
						name: 'Workflow',
						value: 'workflow',
					},
				],
				default: 'workflow',
			},

			...auditOperations,
			...auditFields,

			...credentialOperations,
			...credentialFields,

			...executionOperations,
			...executionFields,

			...workflowOperations,
			...workflowFields,
		],
	};

	methods = {
		listSearch: {
			// Provide workflows search capability for the workflow resourceLocator
			searchWorkflows,
		},
	};
}
