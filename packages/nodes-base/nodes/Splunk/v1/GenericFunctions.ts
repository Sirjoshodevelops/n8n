import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	JsonObject,
	IRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';
import { parseString } from 'xml2js';

import {
	SPLUNK,
	type SplunkError,
	type SplunkFeedResponse,
	type SplunkResultResponse,
	type SplunkSearchResponse,
} from './types';

// ----------------------------------------
//            entry formatting
// ----------------------------------------

function compactEntryContent(splunkObject: any): any {
	if (typeof splunkObject !== 'object') {
		return {};
	}

	if (Array.isArray(splunkObject)) {
		return splunkObject.reduce((acc, cur) => {
			acc = { ...acc, ...compactEntryContent(cur) };
			return acc;
		}, {});
	}

	if (splunkObject[SPLUNK.DICT]) {
		const obj = splunkObject[SPLUNK.DICT][SPLUNK.KEY];
		return { [splunkObject.$.name]: compactEntryContent(obj) };
	}

	if (splunkObject[SPLUNK.LIST]) {
		const items = splunkObject[SPLUNK.LIST][SPLUNK.ITEM];
		return { [splunkObject.$.name]: items };
	}

	if (splunkObject._) {
		return {
			[splunkObject.$.name]: splunkObject._,
		};
	}

	return {
		[splunkObject.$.name]: '',
	};
}

function formatEntryContent(content: any): any {
	return content[SPLUNK.DICT][SPLUNK.KEY].reduce((acc: any, cur: any) => {
		acc = { ...acc, ...compactEntryContent(cur) };
		return acc;
	}, {});
}

function formatEntry(entry: any): any {
	const { content, link, ...rest } = entry;
	const formattedEntry = { ...rest, ...formatEntryContent(content) };

	if (formattedEntry.id) {
		formattedEntry.entryUrl = formattedEntry.id;
		formattedEntry.id = formattedEntry.id.split('/').pop();
	}

	return formattedEntry;
}

// ----------------------------------------
//            search formatting
// ----------------------------------------

export function formatSearch(responseData: SplunkSearchResponse) {
	const { entry: entries } = responseData;

	if (!entries) return [];

	return Array.isArray(entries) ? entries.map(formatEntry) : [formatEntry(entries)];
}

// ----------------------------------------
//                 utils
// ----------------------------------------

export async function parseXml(xml: string) {
	return await new Promise((resolve, reject) => {
		parseString(xml, { explicitArray: false }, (error, result) => {
			error ? reject(error) : resolve(result);
		});
	});
}

export function extractErrorDescription(rawError: SplunkError) {
	const messages = rawError.response?.messages;
	return messages ? { [messages.msg.$.type.toLowerCase()]: messages.msg._ } : rawError;
}

export function toUnixEpoch(timestamp: string) {
	return Date.parse(timestamp) / 1000;
}

export async function splunkApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const { baseUrl, allowUnauthorizedCerts } = await this.getCredentials('splunkApi');

	const options: IRequestOptions = {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		method,
		form: body,
		qs,
		uri: `${baseUrl}${endpoint}`,
		json: true,
		rejectUnauthorized: !allowUnauthorizedCerts,
		useQuerystring: true, // serialize roles array as `roles=A&roles=B`
	};

	if (!Object.keys(body).length) {
		delete options.body;
	}

	if (!Object.keys(qs).length) {
		delete options.qs;
	}

	let result;
	try {
		let attempts = 0;

		do {
			try {
				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'splunkApi',
					options,
				);
				result = await parseXml(response);
				return result;
			} catch (error) {
				if (attempts >= 5) {
					throw error;
				}
				await sleep(1000);
				attempts++;
			}
		} while (true);
	} catch (error) {
		if (result === undefined) {
			throw new NodeOperationError(this.getNode(), 'No response from API call', {
				description: "Try to use 'Retry On Fail' option from node's settings",
			});
		}
		if (error?.cause?.code === 'ECONNREFUSED') {
			throw new NodeApiError(this.getNode(), { ...(error as JsonObject), code: 401 });
		}

		const rawError = (await parseXml(error.error as string)) as SplunkError;
		error = extractErrorDescription(rawError);

		if ('fatal' in error) {
			error = { error: error.fatal };
		}

		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

// ----------------------------------------
//            feed formatting
// ----------------------------------------

export function formatFeed(responseData: SplunkFeedResponse) {
	const { entry: entries } = responseData.feed;

	if (!entries) return [];

	return Array.isArray(entries) ? entries.map(formatEntry) : [formatEntry(entries)];
}

// ----------------------------------------
//            result formatting
// ----------------------------------------
function compactResult(splunkObject: any): any {
	if (typeof splunkObject !== 'object') {
		return {};
	}

	if (Array.isArray(splunkObject?.value) && splunkObject?.value[0]?.text) {
		return {
			[splunkObject.$.k]: splunkObject.value.map((v: { text: string }) => v.text).join(','),
		};
	}

	if (!splunkObject?.$?.k || !splunkObject?.value?.text) {
		return {};
	}

	return {
		[splunkObject.$.k]: splunkObject.value.text,
	};
}

function formatResult(field: any): any {
	return field.reduce((acc: any, cur: any) => {
		acc = { ...acc, ...compactResult(cur) };
		return acc;
	}, {});
}

export function formatResults(responseData: SplunkResultResponse) {
	const results = responseData.results.result;
	if (!results) return [];

	return Array.isArray(results)
		? results.map((r) => formatResult(r.field))
		: [formatResult(results.field)];
}

// ----------------------------------------
//             param loaders
// ----------------------------------------

/**
 * Set count of entries to retrieve.
 */
export function setCount(this: IExecuteFunctions, qs: IDataObject) {
	qs.count = this.getNodeParameter('returnAll', 0) ? 0 : this.getNodeParameter('limit', 0);
}

export function populate(source: IDataObject, destination: IDataObject) {
	if (Object.keys(source).length) {
		Object.assign(destination, source);
	}
}

/**
 * Retrieve an ID, with tolerance when contained in an endpoint.
 * The field `id` in Splunk API responses is a full link.
 */
export function getId(
	this: IExecuteFunctions,
	i: number,
	idType: 'userId' | 'searchJobId' | 'searchConfigurationId',
	endpoint: string,
) {
	const id = this.getNodeParameter(idType, i) as string;

	return id.includes(endpoint) ? id.split(endpoint).pop() : id;
}
