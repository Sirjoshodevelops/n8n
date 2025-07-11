import { NodeTestHarness } from '@nodes-testing/node-test-harness';
import nock from 'nock';

const API_RESPONSE = {
	object: 'page',
	id: '15bfb9cb-4cf0-81c7-aab4-c5855b8cb6c3',
	created_time: '2024-12-13T04:45:00.000Z',
	last_edited_time: '2024-12-13T05:52:00.000Z',
	created_by: {
		object: 'user',
		id: 'f215e49c-4677-40c0-9adc-87440d341324',
	},
	last_edited_by: {
		object: 'user',
		id: 'f215e49c-4677-40c0-9adc-87440d341324',
	},
	cover: null,
	icon: {
		type: 'emoji',
		emoji: '😗',
	},
	parent: {
		type: 'database_id',
		database_id: '138fb9cb-4cf0-804c-8663-d8ecdd5e692f',
	},
	archived: true,
	in_trash: true,
	properties: {
		Tags: {
			id: '%40~Tp',
			type: 'multi_select',
			multi_select: [],
		},
		Name: {
			id: 'title',
			type: 'title',
			title: [
				{
					type: 'text',
					text: {
						content: 'Updated Name',
						link: null,
					},
					annotations: {
						bold: false,
						italic: false,
						strikethrough: false,
						underline: false,
						code: false,
						color: 'default',
					},
					plain_text: 'Updated Name',
					href: null,
				},
			],
		},
	},
	url: 'https://www.notion.so/Updated-Name-15bfb9cb4cf081c7aab4c5855b8cb6c3',
	public_url: null,
	request_id: 'ce91abaa-261f-43c3-9237-57c0f28af682',
};

describe('Test NotionV2, page => archive', () => {
	nock('https://api.notion.com')
		.patch('/v1/pages/15bfb9cb4cf081c7aab4c5855b8cb6c3', { archived: true })
		.reply(200, API_RESPONSE);

	new NodeTestHarness().setupTests({
		workflowFiles: ['archive.workflow.json'],
	});
});
