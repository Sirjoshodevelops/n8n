<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { ITemplatesCategory } from '@/Interface';
import { useI18n } from '@n8n/i18n';

interface Props {
	categories?: ITemplatesCategory[];
	sortOnPopulate?: boolean;
	expandLimit?: number;
	loading?: boolean;
	selected?: ITemplatesCategory[];
}

const props = withDefaults(defineProps<Props>(), {
	categories: () => [],
	sortOnPopulate: false,
	expandLimit: 12,
	loading: false,
	selected: () => [],
});

const emit = defineEmits<{
	clearAll: [];
	select: [category: ITemplatesCategory];
	clear: [category: ITemplatesCategory];
}>();

const i18n = useI18n();

const collapsed = ref(true);
const sortedCategories = ref<ITemplatesCategory[]>([]);

const allSelected = computed((): boolean => {
	return props.selected.length === 0;
});

function sortCategories() {
	if (!props.sortOnPopulate) {
		sortedCategories.value = props.categories;
	} else {
		const selected = props.selected || [];
		const selectedCategories = props.categories.filter((cat) => selected.includes(cat));
		const notSelectedCategories = props.categories.filter((cat) => !selected.includes(cat));
		sortedCategories.value = selectedCategories.concat(notSelectedCategories);
	}
}
function collapseAction() {
	collapsed.value = false;
}

function handleCheckboxChanged(value: boolean, selectedCategory: ITemplatesCategory) {
	if (value) {
		emit('select', selectedCategory);
	} else {
		emit('clear', selectedCategory);
	}
}

function isSelected(category: ITemplatesCategory) {
	return props.selected.includes(category);
}

function resetCategories() {
	emit('clearAll');
}

watch(
	() => props.sortOnPopulate,
	(value: boolean) => {
		if (value) {
			sortCategories();
		}
	},
	{
		immediate: true,
	},
);

watch(
	() => props.categories,
	(categories: ITemplatesCategory[]) => {
		if (categories.length > 0) {
			sortCategories();
		}
	},
	{
		immediate: true,
	},
);
</script>

<template>
	<div :class="$style.filters" class="template-filters" data-test-id="templates-filter-container">
		<div :class="$style.title" v-text="i18n.baseText('templates.categoriesHeading')" />
		<div v-if="loading" :class="$style.list">
			<n8n-loading :loading="loading" :rows="expandLimit" />
		</div>
		<ul v-if="!loading" :class="$style.categories">
			<li :class="$style.item" data-test-id="template-filter-all-categories">
				<el-checkbox :model-value="allSelected" @update:model-value="() => resetCategories()">
					{{ i18n.baseText('templates.allCategories') }}
				</el-checkbox>
			</li>
			<li
				v-for="(category, index) in collapsed
					? sortedCategories.slice(0, expandLimit)
					: sortedCategories"
				:key="index"
				:class="$style.item"
				:data-test-id="`template-filter-${category.name.toLowerCase().replaceAll(' ', '-')}`"
			>
				<el-checkbox
					:model-value="isSelected(category)"
					@update:model-value="(value: boolean) => handleCheckboxChanged(value, category)"
				>
					{{ category.name }}
				</el-checkbox>
			</li>
		</ul>
		<div
			v-if="sortedCategories.length > expandLimit && collapsed && !loading"
			:class="$style.button"
			data-test-id="expand-categories-button"
			@click="collapseAction"
		>
			<n8n-text size="small" color="primary">
				+ {{ `${sortedCategories.length - expandLimit} more` }}
			</n8n-text>
		</div>
	</div>
</template>

<style lang="scss" module>
.title {
	font-size: var(--font-size-2xs);
	color: var(--color-text-base);
}

.categories {
	padding-top: var(--spacing-xs);
	list-style-type: none;
}

.item {
	margin-top: var(--spacing-xs);

	&:nth-child(1) {
		margin-top: 0;
	}
}

.button {
	padding-top: var(--spacing-2xs);
	cursor: pointer;
}
</style>

<style lang="scss">
.template-filters {
	.el-checkbox {
		display: flex;
		white-space: unset;
	}

	.el-checkbox__label {
		top: -2px;
		position: relative;
		font-size: var(--font-size-xs);
		line-height: var(--font-line-height-loose);
		color: var(--color-text-dark);
		padding-left: var(--spacing-2xs);
	}
}
</style>
