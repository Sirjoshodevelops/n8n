import { snakeCase } from 'change-case';
import { createHash } from 'crypto';
import omit from 'lodash/omit';
import type {
	ICredentialDataDecryptedObject,
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

import type { ICouponLine, IFeeLine, ILineItem, IShoppingLine } from './OrderInterface';

export async function woocommerceApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	resource: string,

	body: any = {},
	qs: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('wooCommerceApi');

	let options: IRequestOptions = {
		method,
		qs,
		body,
		uri: uri || `${credentials.url}/wp-json/wc/v3${resource}`,
		json: true,
	};

	if (!Object.keys(body as IDataObject).length) {
		delete options.form;
	}
	options = Object.assign({}, options, option);
	return await this.helpers.requestWithAuthentication.call(this, 'wooCommerceApi', options);
}

export async function woocommerceApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,

	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];

	let responseData;
	let uri: string | undefined;
	query.per_page = 100;
	do {
		responseData = await woocommerceApiRequest.call(this, method, endpoint, body, query, uri, {
			resolveWithFullResponse: true,
		});
		const links = responseData.headers.link.split(',');
		const nextLink = links.find((link: string) => link.indexOf('rel="next"') !== -1);
		if (nextLink) {
			uri = nextLink.split(';')[0].replace(/<(.*)>/, '$1');
		}
		returnData.push.apply(returnData, responseData.body as IDataObject[]);
	} while (responseData.headers.link?.includes('rel="next"'));

	return returnData;
}

/**
 * Creates a secret from the credentials
 *
 */
export function getAutomaticSecret(credentials: ICredentialDataDecryptedObject) {
	const data = `${credentials.consumerKey},${credentials.consumerSecret}`;
	return createHash('md5').update(data).digest('hex');
}

export function setMetadata(data: IShoppingLine[] | IFeeLine[] | ILineItem[] | ICouponLine[]) {
	for (let i = 0; i < data.length; i++) {
		//@ts-ignore\
		if (data[i].metadataUi?.metadataValues) {
			//@ts-ignore
			data[i].meta_data = data[i].metadataUi.metadataValues;
			//@ts-ignore
			delete data[i].metadataUi;
		} else {
			//@ts-ignore
			delete data[i].metadataUi;
		}
	}
}

export function toSnakeCase(
	data: IShoppingLine[] | IFeeLine[] | ILineItem[] | ICouponLine[] | IDataObject,
) {
	if (!Array.isArray(data)) {
		data = [data];
	}
	let remove = false;
	for (let i = 0; i < data.length; i++) {
		for (const key of Object.keys(data[i])) {
			//@ts-ignore
			if (data[i][snakeCase(key)] === undefined) {
				remove = true;
			}
			//@ts-ignore
			data[i][snakeCase(key)] = data[i][key];
			if (remove) {
				//@ts-ignore
				delete data[i][key];
				remove = false;
			}
		}
	}
}

export function setFields(fieldsToSet: IDataObject, body: IDataObject) {
	for (const fields in fieldsToSet) {
		if (fields === 'tags') {
			body.tags = (fieldsToSet[fields] as string[]).map((tag) => ({ id: parseInt(tag, 10) }));
		} else {
			body[snakeCase(fields.toString())] = fieldsToSet[fields];
		}
	}
}

export function adjustMetadata(fields: IDataObject & Metadata) {
	if (!fields.meta_data) return fields;

	return {
		...omit(fields, ['meta_data']),
		meta_data: fields.meta_data.meta_data_fields,
	};
}

type Metadata = {
	meta_data?: {
		meta_data_fields: Array<{ key: string; value: string }>;
	};
};
