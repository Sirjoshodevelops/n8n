import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
	IRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function salesmateApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	resource: string,

	body: any = {},
	qs: IDataObject = {},
	uri?: string,
	_option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('salesmateApi');

	const options: IRequestOptions = {
		headers: {
			sessionToken: credentials.sessionToken,
			'x-linkname': credentials.url,
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body,
		uri: uri || `https://apis.salesmate.io${resource}`,
		json: true,
	};
	if (!Object.keys(body as IDataObject).length) {
		delete options.body;
	}
	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function salesmateApiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	resource: string,

	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];

	let responseData;
	query.pageNo = 1;
	query.rows = 25;
	do {
		responseData = await salesmateApiRequest.call(this, method, resource, body, query);
		returnData.push.apply(returnData, responseData[propertyName].data as IDataObject[]);
		query.pageNo++;
	} while (
		responseData[propertyName].totalPages !== undefined &&
		query.pageNo <= responseData[propertyName].totalPages
	);

	return returnData;
}

export function validateJSON(json: string | undefined): any {
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = undefined;
	}
	return result;
}

/**
 * Converts data from the Salesmate format into a simple object
 *
 */
export function simplifySalesmateData(data: IDataObject[]): IDataObject {
	const returnData: IDataObject = {};

	for (const item of data) {
		returnData[item.fieldName as string] = item.value;
	}

	return returnData;
}
