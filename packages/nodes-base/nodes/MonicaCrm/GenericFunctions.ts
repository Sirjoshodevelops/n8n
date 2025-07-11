import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	JsonObject,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import type { LoaderGetResponse } from './types';

export async function monicaCrmApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	const credentials = await this.getCredentials<{
		apiToken: string;
		environment: string;
		domain: string;
	}>('monicaCrmApi');

	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	let baseUrl = 'https://app.monicahq.com';

	if (credentials.environment === 'selfHosted') {
		baseUrl = credentials.domain;
	}

	const options: IRequestOptions = {
		headers: {
			Authorization: `Bearer ${credentials.apiToken}`,
		},
		method,
		body,
		qs,
		uri: `${baseUrl}/api${endpoint}`,
		json: true,
	};

	if (!Object.keys(body).length) {
		delete options.body;
	}

	if (!Object.keys(qs).length) {
		delete options.qs;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function monicaCrmApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	{ forLoader }: { forLoader: boolean } = { forLoader: false },
) {
	const returnAll = this.getNodeParameter('returnAll', 0, false) as boolean;
	const limit = this.getNodeParameter('limit', 0, 0) as number;

	let totalItems = 0;
	qs.page = 1;
	qs.limit = 100;

	let responseData;
	const returnData: IDataObject[] = [];

	do {
		responseData = await monicaCrmApiRequest.call(this, method, endpoint, body, qs);
		returnData.push(...(responseData.data as IDataObject[]));

		if (!forLoader && !returnAll && returnData.length > limit) {
			return returnData.slice(0, limit);
		}
		qs.page++;
		totalItems = responseData.meta.total;
	} while (totalItems > returnData.length);

	return returnData;
}

/**
 * Get day, month, and year from the n8n UI datepicker.
 */
export const getDateParts = (date: string) => date.split('T')[0].split('-').map(Number).reverse();

export const toOptions = (response: LoaderGetResponse) =>
	response.data.map(({ id, name }) => ({ value: id, name }));
