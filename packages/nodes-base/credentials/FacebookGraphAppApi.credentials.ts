import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class FacebookGraphAppApi implements ICredentialType {
	name = 'facebookGraphAppApi';

	displayName = 'Facebook Graph API (App)';

	documentationUrl = 'facebookapp';

	extends = ['facebookGraphApi'];

	properties: INodeProperties[] = [
		{
			displayName: 'App Secret',
			name: 'appSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'(Optional) When the app secret is set the node will verify this signature to validate the integrity and origin of the payload',
		},
	];
}
