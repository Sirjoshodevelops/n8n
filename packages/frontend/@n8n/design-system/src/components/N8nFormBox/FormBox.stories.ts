import { action } from '@storybook/addon-actions';
import type { StoryFn } from '@storybook/vue3';

import N8nFormBox from './FormBox.vue';

export default {
	title: 'Modules/FormBox',
	component: N8nFormBox,
	argTypes: {},
	parameters: {
		backgrounds: { default: '--color-background-light' },
	},
};

const methods = {
	onSubmit: action('submit'),
	onChange: action('update'),
};

const Template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nFormBox,
	},
	template: '<n8n-form-box v-bind="args" @submit="onSubmit" @update="onUpdate" />',
	methods,
});

export const FormBox = Template.bind({});
FormBox.args = {
	title: 'Form title',
	inputs: [
		{
			name: 'email',
			properties: {
				label: 'Your Email',
				type: 'email',
				required: true,
				validationRules: [{ name: 'VALID_EMAIL' }],
			},
		},
		{
			name: 'message',
			properties: {
				label: 'Please contact someone someday.',
				type: 'text',
			},
		},
		{
			name: 'password',
			properties: {
				label: 'Your Password',
				type: 'password',
				required: true,
				validationRules: [{ name: 'DEFAULT_PASSWORD_RULES' }],
			},
		},
		{
			name: 'nickname',
			properties: {
				label: 'Your Nickname',
				placeholder: 'Monty',
			},
		},
	],
	buttonText: 'Action',
	redirectText: 'Go somewhere',
	redirectLink: 'https://n8n.io',
};
