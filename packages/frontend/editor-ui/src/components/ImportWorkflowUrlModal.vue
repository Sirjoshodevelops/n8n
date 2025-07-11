<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@n8n/i18n';
import { useUIStore } from '@/stores/ui.store';
import { nodeViewEventBus } from '@/event-bus';
import { VALID_WORKFLOW_IMPORT_URL_REGEX, IMPORT_WORKFLOW_URL_MODAL_KEY } from '@/constants';

const i18n = useI18n();
const uiStore = useUIStore();

const url = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const isValid = computed(() => {
	return url.value ? VALID_WORKFLOW_IMPORT_URL_REGEX.test(url.value) : true;
});

const closeModal = () => {
	uiStore.closeModal(IMPORT_WORKFLOW_URL_MODAL_KEY);
};

const confirm = () => {
	nodeViewEventBus.emit('importWorkflowUrl', { url: url.value });
	closeModal();
};

const focusInput = async () => {
	if (inputRef.value) {
		inputRef.value.focus();
	}
};
</script>

<template>
	<Modal
		:name="IMPORT_WORKFLOW_URL_MODAL_KEY"
		:title="i18n.baseText('mainSidebar.prompt.importWorkflowFromUrl')"
		:show-close="true"
		:center="true"
		width="420px"
		@opened="focusInput"
	>
		<template #content>
			<div :class="$style.noScrollbar">
				<n8n-input
					ref="inputRef"
					v-model="url"
					:placeholder="i18n.baseText('mainSidebar.prompt.workflowUrl')"
					:state="isValid ? 'default' : 'error'"
					data-test-id="workflow-url-import-input"
					@keyup.enter="confirm"
				/>
				<p :class="$style['error-text']" :style="{ visibility: isValid ? 'hidden' : 'visible' }">
					{{ i18n.baseText('mainSidebar.prompt.invalidUrl') }}
				</p>
			</div>
		</template>
		<template #footer>
			<div :class="$style.footer">
				<n8n-button
					type="primary"
					float="right"
					:disabled="!url || !isValid"
					data-test-id="confirm-workflow-import-url-button"
					@click="confirm"
				>
					{{ i18n.baseText('mainSidebar.prompt.import') }}
				</n8n-button>
				<n8n-button
					type="secondary"
					float="right"
					data-test-id="cancel-workflow-import-url-button"
					@click="closeModal"
				>
					{{ i18n.baseText('mainSidebar.prompt.cancel') }}
				</n8n-button>
			</div>
		</template>
	</Modal>
</template>

<style lang="scss" module>
.error-text {
	color: var(--color-danger);
	font-size: var(--font-size-2xs);
	margin-top: var(--spacing-2xs);
	height: var(--spacing-s);
	visibility: hidden;
}
.footer {
	> * {
		margin-left: var(--spacing-3xs);
	}
}
.noScrollbar {
	overflow: hidden;
}
</style>
