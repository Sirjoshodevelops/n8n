import type { StoryFn } from '@storybook/vue3';

import N8nCard from './Card.vue';
import N8nButton from '../N8nButton/Button.vue';
import N8nIcon from '../N8nIcon/Icon.vue';
import N8nText from '../N8nText/Text.vue';

export default {
	title: 'Atoms/Card',
	component: N8nCard,
};

export const Default: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nCard,
	},
	template: '<n8n-card v-bind="args">This is a card.</n8n-card>',
});

export const Hoverable: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nCard,
		N8nIcon,
		N8nText,
	},
	template: `<div style="width: 140px; text-align: center;">
		<n8n-card v-bind="args">
			<n8n-icon icon="plus" size="xlarge" />
			<n8n-text size="large" class="mt-2xs">Add</n8n-text>
		</n8n-card>
	</div>`,
});

Hoverable.args = {
	hoverable: true,
};

export const WithSlots: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nCard,
		N8nButton,
		N8nIcon,
		N8nText,
	},
	template: `<n8n-card v-bind="args">
		<template #prepend>
			<n8n-icon icon="check" size="large" />
		</template>
		<template #header>
			<strong>Card header</strong>
		</template>
		<n8n-text color="text-light" size="medium" class="mt-2xs mb-2xs">
			This is the card body.
		</n8n-text>
		<template #footer>
			<n8n-text size="medium">
				Card footer
			</n8n-text>
		</template>
		<template #append>
			<n8n-button>Click me</n8n-button>
		</template>
	</n8n-card>`,
});
