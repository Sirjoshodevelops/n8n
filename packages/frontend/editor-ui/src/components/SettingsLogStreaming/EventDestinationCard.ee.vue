<script lang="ts" setup>
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { MODAL_CONFIRM } from '@/constants';
import { useMessage } from '@/composables/useMessage';
import { useLogStreamingStore } from '@/stores/logStreaming.store';
import type { MessageEventBusDestinationOptions } from 'n8n-workflow';
import { deepCopy, defaultMessageEventBusDestinationOptions } from 'n8n-workflow';
import type { BaseTextKey } from '@n8n/i18n';
import type { EventBus } from '@n8n/utils/event-bus';
import { useI18n } from '@n8n/i18n';
import { assert } from '@n8n/utils/assert';

const DESTINATION_LIST_ITEM_ACTIONS = {
	OPEN: 'open',
	DELETE: 'delete',
};

const { confirm } = useMessage();
const i18n = useI18n();
const logStreamingStore = useLogStreamingStore();

const nodeParameters = ref<MessageEventBusDestinationOptions>({});
const cardActions = ref<HTMLDivElement | null>(null);

const props = withDefaults(
	defineProps<{
		eventBus: EventBus;
		destination: MessageEventBusDestinationOptions;
		readonly: boolean;
	}>(),
	{
		destination: () => deepCopy(defaultMessageEventBusDestinationOptions),
	},
);

const emit = defineEmits<{
	edit: [id: string | undefined];
	remove: [id: string | undefined];
}>();

onMounted(() => {
	nodeParameters.value = Object.assign(
		deepCopy(defaultMessageEventBusDestinationOptions),
		props.destination,
	);
	props.eventBus?.on('destinationWasSaved', onDestinationWasSaved);
});

onBeforeMount(() => {
	props.eventBus?.off('destinationWasSaved', onDestinationWasSaved);
});

const actions = computed((): Array<{ label: string; value: string }> => {
	const actionList = [
		{
			label: i18n.baseText('workflows.item.open'),
			value: DESTINATION_LIST_ITEM_ACTIONS.OPEN,
		},
	];
	if (!props.readonly) {
		actionList.push({
			label: i18n.baseText('workflows.item.delete'),
			value: DESTINATION_LIST_ITEM_ACTIONS.DELETE,
		});
	}
	return actionList;
});

const typeLabelName = computed((): BaseTextKey => {
	return `settings.log-streaming.${props.destination.__type}` as BaseTextKey;
});

function onDestinationWasSaved() {
	assert(props.destination.id);
	const updatedDestination = logStreamingStore.getDestination(props.destination.id);
	if (updatedDestination) {
		nodeParameters.value = Object.assign(
			deepCopy(defaultMessageEventBusDestinationOptions),
			props.destination,
		);
	}
}

async function onClick(event: Event) {
	const target = event.target as HTMLDivElement | null;
	if (
		cardActions.value === target ||
		cardActions.value?.contains(target) ||
		target?.contains(cardActions.value)
	) {
		return;
	}

	emit('edit', props.destination.id);
}

function onEnabledSwitched(state: boolean) {
	nodeParameters.value.enabled = state;
	void saveDestination();
}

async function saveDestination() {
	await logStreamingStore.saveDestination(nodeParameters.value);
}

async function onAction(action: string) {
	if (action === DESTINATION_LIST_ITEM_ACTIONS.OPEN) {
		emit('edit', props.destination.id);
	} else if (action === DESTINATION_LIST_ITEM_ACTIONS.DELETE) {
		const deleteConfirmed = await confirm(
			i18n.baseText('settings.log-streaming.destinationDelete.message', {
				interpolate: { destinationName: props.destination.label ?? '' },
			}),
			i18n.baseText('settings.log-streaming.destinationDelete.headline'),
			{
				type: 'warning',
				confirmButtonText: i18n.baseText(
					'settings.log-streaming.destinationDelete.confirmButtonText',
				),
				cancelButtonText: i18n.baseText(
					'settings.log-streaming.destinationDelete.cancelButtonText',
				),
			},
		);

		if (deleteConfirmed !== MODAL_CONFIRM) {
			return;
		}

		emit('remove', props.destination.id);
	}
}
</script>

<template>
	<n8n-card :class="$style.cardLink" data-test-id="destination-card" @click="onClick">
		<template #header>
			<div>
				<n8n-heading tag="h2" bold :class="$style.cardHeading">
					{{ destination.label }}
				</n8n-heading>
				<div :class="$style.cardDescription">
					<n8n-text color="text-light" size="small">
						<span>{{ i18n.baseText(typeLabelName) }}</span>
					</n8n-text>
				</div>
			</div>
		</template>
		<template #append>
			<div ref="cardActions" :class="$style.cardActions">
				<div :class="$style.activeStatusText" data-test-id="destination-activator-status">
					<n8n-text v-if="nodeParameters.enabled" :color="'success'" size="small" bold>
						{{ i18n.baseText('workflowActivator.active') }}
					</n8n-text>
					<n8n-text v-else color="text-base" size="small" bold>
						{{ i18n.baseText('workflowActivator.inactive') }}
					</n8n-text>
				</div>

				<el-switch
					class="mr-s"
					:disabled="readonly"
					:model-value="nodeParameters.enabled"
					:title="
						nodeParameters.enabled
							? i18n.baseText('workflowActivator.deactivateWorkflow')
							: i18n.baseText('workflowActivator.activateWorkflow')
					"
					active-color="#13ce66"
					inactive-color="#8899AA"
					data-test-id="workflow-activate-switch"
					@update:model-value="onEnabledSwitched($event)"
				>
				</el-switch>

				<n8n-action-toggle :actions="actions" theme="dark" @action="onAction" />
			</div>
		</template>
	</n8n-card>
</template>

<style lang="scss" module>
.cardLink {
	transition: box-shadow 0.3s ease;
	cursor: pointer;
	padding: 0 0 0 var(--spacing-s);
	align-items: stretch;

	&:hover {
		box-shadow: 0 2px 8px rgba(#441c17, 0.1);
	}
}

.activeStatusText {
	width: 64px; // Required to avoid jumping when changing active state
	padding-right: var(--spacing-2xs);
	box-sizing: border-box;
	display: inline-block;
	text-align: right;
}

.cardHeading {
	font-size: var(--font-size-s);
	word-break: break-word;
	padding: var(--spacing-s) 0 0 var(--spacing-s);
}

.cardDescription {
	min-height: 19px;
	display: flex;
	align-items: center;
	padding: 0 0 var(--spacing-s) var(--spacing-s);
}

.cardActions {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 0 var(--spacing-s) 0 0;
	cursor: default;
}
</style>
