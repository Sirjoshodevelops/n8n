import { Logger } from '@n8n/backend-common';
import { GlobalConfig } from '@n8n/config';
import { Service } from '@n8n/di';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { deepCopy, jsonParse } from 'n8n-workflow';

import { CredentialTypes } from '@/credential-types';
import type { ICredentialsOverwrite } from '@/interfaces';

@Service()
export class CredentialsOverwrites {
	private overwriteData: ICredentialsOverwrite = {};

	private resolvedTypes: string[] = [];

	constructor(
		globalConfig: GlobalConfig,
		private readonly credentialTypes: CredentialTypes,
		private readonly logger: Logger,
	) {
		const data = globalConfig.credentials.overwrite.data;
		const overwriteData = jsonParse<ICredentialsOverwrite>(data, {
			errorMessage: 'The credentials-overwrite is not valid JSON.',
		});

		this.setData(overwriteData);
	}

	setData(overwriteData: ICredentialsOverwrite) {
		// If data gets reinitialized reset the resolved types cache
		this.resolvedTypes.length = 0;

		this.overwriteData = overwriteData;

		for (const type in overwriteData) {
			const overwrites = this.getOverwrites(type);

			if (overwrites && Object.keys(overwrites).length) {
				this.overwriteData[type] = overwrites;
			}
		}
	}

	applyOverwrite(type: string, data: ICredentialDataDecryptedObject) {
		const overwrites = this.get(type);

		if (overwrites === undefined) {
			return data;
		}

		const returnData = deepCopy(data);
		// Overwrite only if there is currently no data set
		for (const key of Object.keys(overwrites)) {
			// @ts-ignore
			if ([null, undefined, ''].includes(returnData[key])) {
				returnData[key] = overwrites[key];
			}
		}

		return returnData;
	}

	getOverwrites(type: string): ICredentialDataDecryptedObject | undefined {
		if (this.resolvedTypes.includes(type)) {
			// Type got already resolved and can so returned directly
			return this.overwriteData[type];
		}

		if (!this.credentialTypes.recognizes(type)) {
			this.logger.warn(`Unknown credential type ${type} in Credential overwrites`);
			return;
		}

		const credentialTypeData = this.credentialTypes.getByName(type);

		if (credentialTypeData.extends === undefined) {
			this.resolvedTypes.push(type);
			return this.overwriteData[type];
		}

		const overwrites: ICredentialDataDecryptedObject = {};
		for (const credentialsTypeName of credentialTypeData.extends) {
			Object.assign(overwrites, this.getOverwrites(credentialsTypeName));
		}

		if (this.overwriteData[type] !== undefined) {
			Object.assign(overwrites, this.overwriteData[type]);
		}

		this.resolvedTypes.push(type);

		return overwrites;
	}

	private get(name: string): ICredentialDataDecryptedObject | undefined {
		const parentTypes = this.credentialTypes.getParentTypes(name);
		return [name, ...parentTypes]
			.reverse()
			.map((type) => this.overwriteData[type])
			.filter((type) => !!type)
			.reduce((acc, current) => Object.assign(acc, current), {});
	}

	getAll(): ICredentialsOverwrite {
		return this.overwriteData;
	}
}
