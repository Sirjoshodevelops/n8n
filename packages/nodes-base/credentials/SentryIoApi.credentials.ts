import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SentryIoApi implements ICredentialType {
	name = 'sentryIoApi';

	displayName = 'Sentry.io API';

	documentationUrl = 'sentryIo';

	properties: INodeProperties[] = [
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
