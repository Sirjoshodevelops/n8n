import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	JsonObject,
	IRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function humanticAiApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,

	body: any = {},
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	try {
		const credentials = await this.getCredentials('humanticAiApi');
		let options = {
			headers: {
				'Content-Type': 'application/json',
			},
			method,
			qs,
			body,
			uri: `https://api.humantic.ai/v1${resource}`,
			json: true,
		} satisfies IRequestOptions;

		options = Object.assign({}, options, option);
		options.qs.apikey = credentials.apiKey;

		if (Object.keys(options.body as IDataObject).length === 0) {
			delete options.body;
		}

		const response = await this.helpers.request(options);

		if (response.data && response.data.status === 'error') {
			throw new NodeApiError(this.getNode(), response.data as JsonObject);
		}

		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
