/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { apiRequest, apiRequestAllItems, downloadRecordAttachments } from './GenericFunctions';
import { operationFields } from './OperationDescription';

export class NocoDB implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NocoDB',
		name: 'nocoDb',
		icon: 'file:nocodb.svg',
		group: ['input'],
		version: [1, 2, 3],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read, update, write and delete data from NocoDB',
		defaults: {
			name: 'NocoDB',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'nocoDb',
				required: true,
				displayOptions: {
					show: {
						authentication: ['nocoDb'],
					},
				},
			},
			{
				name: 'nocoDbApiToken',
				required: true,
				displayOptions: {
					show: {
						authentication: ['nocoDbApiToken'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Token',
						value: 'nocoDbApiToken',
					},
					{
						name: 'User Token',
						value: 'nocoDb',
					},
				],
				default: 'nocoDb',
			},
			{
				displayName: 'API Version',
				name: 'version',
				type: 'options',
				isNodeSetting: true,
				options: [
					{
						name: 'Before v0.90.0',
						value: 1,
					},
					{
						name: 'v0.90.0 Onwards',
						value: 2,
					},
					{
						name: 'v0.200.0 Onwards',
						value: 3,
					},
				],
				displayOptions: {
					show: {
						'@version': [1],
					},
				},
				default: 1,
			},
			{
				displayName: 'API Version',
				name: 'version',
				type: 'options',
				isNodeSetting: true,
				options: [
					{
						name: 'Before v0.90.0',
						value: 1,
					},
					{
						name: 'v0.90.0 Onwards',
						value: 2,
					},
					{
						name: 'v0.200.0 Onwards',
						value: 3,
					},
				],
				displayOptions: {
					show: {
						'@version': [2],
					},
				},
				default: 2,
			},
			{
				displayName: 'API Version',
				name: 'version',
				type: 'options',
				isNodeSetting: true,
				options: [
					{
						name: 'Before v0.90.0',
						value: 1,
					},
					{
						name: 'v0.90.0 Onwards',
						value: 2,
					},
					{
						name: 'v0.200.0 Onwards',
						value: 3,
					},
				],
				displayOptions: {
					show: {
						'@version': [3],
					},
				},
				default: 3,
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Row',
						value: 'row',
					},
				],
				default: 'row',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['row'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a row',
						action: 'Create a row',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a row',
						action: 'Delete a row',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Retrieve a row',
						action: 'Get a row',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Retrieve many rows',
						action: 'Get many rows',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a row',
						action: 'Update a row',
					},
				],
				default: 'get',
			},
			...operationFields,
		],
	};

	methods = {
		loadOptions: {
			async getWorkspaces(this: ILoadOptionsFunctions) {
				try {
					const requestMethod = 'GET';
					const endpoint = '/api/v1/workspaces/';
					const responseData = await apiRequest.call(this, requestMethod, endpoint, {}, {});
					return responseData.list.map((i: IDataObject) => ({ name: i.title, value: i.id }));
				} catch (e) {
					return [{ name: 'No Workspace', value: 'none' }];
				}
			},
			async getBases(this: ILoadOptionsFunctions) {
				const version = this.getNodeParameter('version', 0) as number;
				const workspaceId = this.getNodeParameter('workspaceId', 0) as string;
				try {
					if (workspaceId && workspaceId !== 'none') {
						const requestMethod = 'GET';
						const endpoint = `/api/v1/workspaces/${workspaceId}/bases/`;
						const responseData = await apiRequest.call(this, requestMethod, endpoint, {}, {});
						return responseData.list.map((i: IDataObject) => ({ name: i.title, value: i.id }));
					} else {
						const requestMethod = 'GET';
						const endpoint = version === 3 ? '/api/v2/meta/bases/' : '/api/v1/db/meta/projects/';
						const responseData = await apiRequest.call(this, requestMethod, endpoint, {}, {});
						return responseData.list.map((i: IDataObject) => ({ name: i.title, value: i.id }));
					}
				} catch (e) {
					throw new NodeOperationError(
						this.getNode(),
						new Error(`Error while fetching ${version === 3 ? 'bases' : 'projects'}!`, {
							cause: e,
						}),
						{
							level: 'warning',
						},
					);
				}
			},
			// This only supports using the Base ID
			async getTables(this: ILoadOptionsFunctions) {
				const version = this.getNodeParameter('version', 0) as number;
				const baseId = this.getNodeParameter('projectId', 0) as string;
				if (baseId) {
					try {
						const requestMethod = 'GET';
						const endpoint =
							version === 3
								? `/api/v2/meta/bases/${baseId}/tables`
								: `/api/v1/db/meta/projects/${baseId}/tables`;
						const responseData = await apiRequest.call(this, requestMethod, endpoint, {}, {});
						return responseData.list.map((i: IDataObject) => ({ name: i.title, value: i.id }));
					} catch (e) {
						throw new NodeOperationError(
							this.getNode(),
							new Error('Error while fetching tables!', { cause: e }),
							{
								level: 'warning',
							},
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`No  ${version === 3 ? 'base' : 'project'} selected!`,
						{
							level: 'warning',
						},
					);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		let responseData;

		const version = this.getNodeParameter('version', 0) as number;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		let returnAll = false;
		let requestMethod: IHttpRequestMethods = 'GET';

		let qs: IDataObject = {};

		let endPoint = '';

		const baseId = this.getNodeParameter('projectId', 0) as string;
		const table = this.getNodeParameter('table', 0) as string;

		if (resource === 'row') {
			if (operation === 'create') {
				requestMethod = 'POST';

				if (version === 1) {
					endPoint = `/nc/${baseId}/api/v1/${table}/bulk`;
				} else if (version === 2) {
					endPoint = `/api/v1/db/data/bulk/noco/${baseId}/${table}`;
				} else if (version === 3) {
					endPoint = `/api/v2/tables/${table}/records`;
				}

				const body: IDataObject[] = [];

				for (let i = 0; i < items.length; i++) {
					const newItem: IDataObject = {};
					const dataToSend = this.getNodeParameter('dataToSend', i) as
						| 'defineBelow'
						| 'autoMapInputData';

					if (dataToSend === 'autoMapInputData') {
						const incomingKeys = Object.keys(items[i].json);
						const rawInputsToIgnore = this.getNodeParameter('inputsToIgnore', i) as string;
						const inputDataToIgnore = rawInputsToIgnore.split(',').map((c) => c.trim());
						for (const key of incomingKeys) {
							if (inputDataToIgnore.includes(key)) continue;
							newItem[key] = items[i].json[key];
						}
					} else {
						const fields = this.getNodeParameter('fieldsUi.fieldValues', i, []) as Array<{
							fieldName: string;
							binaryData: boolean;
							fieldValue?: string;
							binaryProperty?: string;
						}>;

						for (const field of fields) {
							if (!field.binaryData) {
								newItem[field.fieldName] = field.fieldValue;
							} else if (field.binaryProperty) {
								const binaryPropertyName = field.binaryProperty;
								const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
								const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

								const formData = {
									file: {
										value: dataBuffer,
										options: {
											filename: binaryData.fileName,
											contentType: binaryData.mimeType,
										},
									},
									json: JSON.stringify({
										api: 'xcAttachmentUpload',
										project_id: baseId,
										dbAlias: 'db',
										args: {},
									}),
								};

								let postUrl = '';
								if (version === 1) {
									postUrl = '/dashboard';
								} else if (version === 2) {
									postUrl = '/api/v1/db/storage/upload';
								} else if (version === 3) {
									postUrl = '/api/v2/storage/upload';
								}

								responseData = await apiRequest.call(
									this,
									'POST',
									postUrl,
									{},
									version === 3 ? { base_id: baseId } : { project_id: baseId },
									undefined,
									{
										formData,
									},
								);
								newItem[field.fieldName] = JSON.stringify(
									Array.isArray(responseData) ? responseData : [responseData],
								);
							}
						}
					}
					body.push(newItem);
				}
				try {
					responseData = await apiRequest.call(this, requestMethod, endPoint, body, qs);

					if (version === 3) {
						for (let i = body.length - 1; i >= 0; i--) {
							body[i] = { ...body[i], ...responseData[i] };
						}

						returnData.push(...body);
					} else {
						// Calculate ID manually and add to return data
						let id = responseData[0];
						for (let i = body.length - 1; i >= 0; i--) {
							body[i].id = id--;
						}

						returnData.push(...body);
					}
				} catch (error) {
					if (this.continueOnFail()) {
						returnData.push({ error: error.toString() });
					}
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
			}

			if (operation === 'delete') {
				requestMethod = 'DELETE';
				let primaryKey = 'id';

				if (version === 1) {
					endPoint = `/nc/${baseId}/api/v1/${table}/bulk`;
				} else if (version === 2) {
					endPoint = `/api/v1/db/data/bulk/noco/${baseId}/${table}`;

					primaryKey = this.getNodeParameter('primaryKey', 0) as string;
					if (primaryKey === 'custom') {
						primaryKey = this.getNodeParameter('customPrimaryKey', 0) as string;
					}
				} else if (version === 3) {
					endPoint = `/api/v2/tables/${table}/records`;

					primaryKey = this.getNodeParameter('primaryKey', 0) as string;
					if (primaryKey === 'custom') {
						primaryKey = this.getNodeParameter('customPrimaryKey', 0) as string;
					}
				}

				const body: IDataObject[] = [];

				for (let i = 0; i < items.length; i++) {
					const id = this.getNodeParameter('id', i) as string;
					body.push({ [primaryKey]: id });
				}

				try {
					responseData = (await apiRequest.call(this, requestMethod, endPoint, body, qs)) as any[];
					if (version === 1) {
						returnData.push(...items.map((item) => item.json));
					} else if (version === 2) {
						returnData.push(
							...responseData.map((result: number, index: number) => {
								if (result === 0) {
									const errorMessage = `The row with the ID "${body[index].id}" could not be deleted. It probably doesn't exist.`;
									if (this.continueOnFail()) {
										return { error: errorMessage };
									}
									throw new NodeApiError(
										this.getNode(),
										{ message: errorMessage },
										{ message: errorMessage, itemIndex: index },
									);
								}
								return {
									success: true,
								};
							}),
						);
					} else if (version === 3) {
						returnData.push(...responseData);
					}
				} catch (error) {
					if (this.continueOnFail()) {
						returnData.push({ error: error.toString() });
					}
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
			}

			if (operation === 'getAll') {
				const data = [];
				const downloadAttachments = this.getNodeParameter('downloadAttachments', 0) as boolean;
				try {
					for (let i = 0; i < items.length; i++) {
						requestMethod = 'GET';

						if (version === 1) {
							endPoint = `/nc/${baseId}/api/v1/${table}`;
						} else if (version === 2) {
							endPoint = `/api/v1/db/data/noco/${baseId}/${table}`;
						} else if (version === 3) {
							endPoint = `/api/v2/tables/${table}/records`;
						}

						returnAll = this.getNodeParameter('returnAll', 0);
						qs = this.getNodeParameter('options', i, {});

						if (qs.sort) {
							const properties = (qs.sort as IDataObject).property as Array<{
								field: string;
								direction: string;
							}>;
							qs.sort = properties
								.map((prop) => `${prop.direction === 'asc' ? '' : '-'}${prop.field}`)
								.join(',');
						}

						if (qs.fields) {
							qs.fields = (qs.fields as IDataObject[]).join(',');
						}

						if (returnAll) {
							responseData = await apiRequestAllItems.call(this, requestMethod, endPoint, {}, qs);
						} else {
							qs.limit = this.getNodeParameter('limit', 0);
							responseData = await apiRequest.call(this, requestMethod, endPoint, {}, qs);
							if (version === 2 || version === 3) {
								responseData = responseData.list;
							}
						}

						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(responseData as IDataObject),
							{ itemData: { item: i } },
						);
						returnData.push(...executionData);

						if (downloadAttachments) {
							const downloadFieldNames = (
								this.getNodeParameter('downloadFieldNames', 0) as string
							).split(',');
							const response = await downloadRecordAttachments.call(
								this,
								responseData as IDataObject[],
								downloadFieldNames,
								[{ item: i }],
							);
							data.push(...response);
						}
					}

					if (downloadAttachments) {
						return [data];
					}
				} catch (error) {
					if (this.continueOnFail()) {
						returnData.push({ json: { error: error.toString() } });
					} else {
						throw error;
					}
				}

				return [returnData as INodeExecutionData[]];
			}

			if (operation === 'get') {
				requestMethod = 'GET';
				const newItems: INodeExecutionData[] = [];

				for (let i = 0; i < items.length; i++) {
					try {
						const id = this.getNodeParameter('id', i) as string;

						if (version === 1) {
							endPoint = `/nc/${baseId}/api/v1/${table}/${id}`;
						} else if (version === 2) {
							endPoint = `/api/v1/db/data/noco/${baseId}/${table}/${id}`;
						} else if (version === 3) {
							endPoint = `/api/v2/tables/${table}/records/${id}`;
						}

						responseData = await apiRequest.call(this, requestMethod, endPoint, {}, qs);

						if (version === 2) {
							if (Object.keys(responseData as IDataObject).length === 0) {
								// Get did fail
								const errorMessage = `The row with the ID "${id}" could not be queried. It probably doesn't exist.`;
								if (this.continueOnFail()) {
									newItems.push({ json: { error: errorMessage } });
									continue;
								}
								throw new NodeApiError(
									this.getNode(),
									{ message: errorMessage },
									{ message: errorMessage, itemIndex: i },
								);
							}
						}

						const downloadAttachments = this.getNodeParameter('downloadAttachments', i) as boolean;

						if (downloadAttachments) {
							const downloadFieldNames = (
								this.getNodeParameter('downloadFieldNames', i) as string
							).split(',');
							const data = await downloadRecordAttachments.call(
								this,
								[responseData as IDataObject],
								downloadFieldNames,
								[{ item: i }],
							);
							const newItem = {
								binary: data[0].binary,
								json: {},
							};

							const executionData = this.helpers.constructExecutionMetaData(
								[newItem] as INodeExecutionData[],
								{ itemData: { item: i } },
							);

							newItems.push(...executionData);
						} else {
							const executionData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(responseData as IDataObject),
								{ itemData: { item: i } },
							);

							newItems.push(...executionData);
						}
					} catch (error) {
						if (this.continueOnFail()) {
							const executionData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray({ error: error.toString() }),
								{ itemData: { item: i } },
							);

							newItems.push(...executionData);
							continue;
						}
						throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
					}
				}
				return [newItems];
			}

			if (operation === 'update') {
				requestMethod = 'PATCH';
				let primaryKey = 'id';

				if (version === 1) {
					endPoint = `/nc/${baseId}/api/v1/${table}/bulk`;
					requestMethod = 'PUT';
				} else if (version === 2) {
					endPoint = `/api/v1/db/data/bulk/noco/${baseId}/${table}`;

					primaryKey = this.getNodeParameter('primaryKey', 0) as string;
					if (primaryKey === 'custom') {
						primaryKey = this.getNodeParameter('customPrimaryKey', 0) as string;
					}
				} else if (version === 3) {
					endPoint = `/api/v2/tables/${table}/records`;
				}

				const body: IDataObject[] = [];

				for (let i = 0; i < items.length; i++) {
					const id = version === 3 ? null : (this.getNodeParameter('id', i) as string);
					const newItem: IDataObject = version === 3 ? {} : { [primaryKey]: id };
					const dataToSend = this.getNodeParameter('dataToSend', i) as
						| 'defineBelow'
						| 'autoMapInputData';

					if (dataToSend === 'autoMapInputData') {
						const incomingKeys = Object.keys(items[i].json);
						const rawInputsToIgnore = this.getNodeParameter('inputsToIgnore', i) as string;
						const inputDataToIgnore = rawInputsToIgnore.split(',').map((c) => c.trim());
						for (const key of incomingKeys) {
							if (inputDataToIgnore.includes(key)) continue;
							newItem[key] = items[i].json[key];
						}
					} else {
						const fields = this.getNodeParameter('fieldsUi.fieldValues', i, []) as Array<{
							fieldName: string;
							binaryData: boolean;
							fieldValue?: string;
							binaryProperty?: string;
						}>;

						for (const field of fields) {
							if (!field.binaryData) {
								newItem[field.fieldName] = field.fieldValue;
							} else if (field.binaryProperty) {
								const binaryPropertyName = field.binaryProperty;
								const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
								const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

								const formData = {
									file: {
										value: dataBuffer,
										options: {
											filename: binaryData.fileName,
											contentType: binaryData.mimeType,
										},
									},
									json: JSON.stringify({
										api: 'xcAttachmentUpload',
										project_id: baseId,
										dbAlias: 'db',
										args: {},
									}),
								};
								let postUrl = '';
								if (version === 1) {
									postUrl = '/dashboard';
								} else if (version === 2) {
									postUrl = '/api/v1/db/storage/upload';
								} else if (version === 3) {
									postUrl = '/api/v2/storage/upload';
								}

								responseData = await apiRequest.call(
									this,
									'POST',
									postUrl,
									{},
									version === 3 ? { base_id: baseId } : { project_id: baseId },
									undefined,
									{
										formData,
									},
								);
								newItem[field.fieldName] = JSON.stringify(
									Array.isArray(responseData) ? responseData : [responseData],
								);
							}
						}
					}
					body.push(newItem);
				}

				try {
					responseData = (await apiRequest.call(this, requestMethod, endPoint, body, qs)) as any[];

					if (version === 1) {
						returnData.push(...body);
					} else if (version === 2) {
						returnData.push(
							...responseData.map((result: number, index: number) => {
								if (result === 0) {
									const errorMessage = `The row with the ID "${body[index].id}" could not be updated. It probably doesn't exist.`;
									if (this.continueOnFail()) {
										return { error: errorMessage };
									}
									throw new NodeApiError(
										this.getNode(),
										{ message: errorMessage },
										{ message: errorMessage, itemIndex: index },
									);
								}
								return {
									success: true,
								};
							}),
						);
					} else if (version === 3) {
						for (let i = body.length - 1; i >= 0; i--) {
							body[i] = { ...body[i], ...responseData[i] };
						}

						returnData.push(...body);
					}
				} catch (error) {
					if (this.continueOnFail()) {
						returnData.push({ error: error.toString() });
					}
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}
