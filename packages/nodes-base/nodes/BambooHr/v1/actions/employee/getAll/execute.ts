import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';

import { apiRequest } from '../../../transport';

export async function getAll(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const body: IDataObject = {};
	const requestMethod = 'GET';
	const endpoint = 'employees/directory';

	//limit parameters
	const returnAll = this.getNodeParameter('returnAll', 0, false);
	const limit = this.getNodeParameter('limit', 0, 0);

	//response
	const responseData = await apiRequest.call(this, requestMethod, endpoint, body);

	//return limited result
	if (!returnAll && responseData.employees.length > limit) {
		return this.helpers.returnJsonArray(responseData.employees.slice(0, limit) as IDataObject[]);
	}

	//return all result
	return this.helpers.returnJsonArray(responseData.employees as IDataObject[]);
}
