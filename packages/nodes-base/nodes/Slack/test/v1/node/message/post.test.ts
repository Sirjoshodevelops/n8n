import { NodeTestHarness } from '@nodes-testing/node-test-harness';
import nock from 'nock';

const API_RESPONSE = {
	ok: true,
	channel: 'C08514ZPKB8',
	message: {
		user: 'U0362BXQYJW',
		type: 'message',
		ts: '1734322671.726339',
		bot_id: 'B0382SHFM46',
		app_id: 'A037UTP0Z39',
		text: 'test message',
		team: 'T0364MSFHV2',
		bot_profile: {
			id: 'B0382SHFM46',
			app_id: 'A037UTP0Z39',
			name: 'blocks-test',
			icons: {
				image_36: 'https://a.slack-edge.com/80588/img/plugins/app/bot_36.png',
				image_48: 'https://a.slack-edge.com/80588/img/plugins/app/bot_48.png',
				image_72: 'https://a.slack-edge.com/80588/img/plugins/app/service_72.png',
			},
			deleted: false,
			updated: 1648028754,
			team_id: 'T0364MSFHV2',
		},
	},
	message_timestamp: '1734322671.726339',
};

describe('Test SlackV1, message => post', () => {
	const slackNock = nock('https://slack.com')
		.post('/api/chat.postMessage', {
			channel: 'C08514ZPKB8',
			text: 'test message',
			attachments: [],
			icon_emoji: '😁',
			link_names: true,
			mrkdwn: true,
			unfurl_links: true,
			unfurl_media: true,
		})
		.reply(200, API_RESPONSE);

	afterAll(() => slackNock.done());
	new NodeTestHarness().setupTests({
		workflowFiles: ['post.workflow.json'],
	});
});
