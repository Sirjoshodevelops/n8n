<script lang="ts" setup>
import type { LabelItemProps } from '@/Interface';

export interface Props {
	item: LabelItemProps;
}
defineProps<Props>();
</script>

<template>
	<div :class="$style.label">
		<span :class="$style.name" v-text="item.key" />
	</div>
</template>

<style lang="scss" module>
.label {
	margin-left: var(--spacing-s);
	margin-right: var(--spacing-s);
	margin-bottom: var(--spacing-4xs);
	letter-spacing: 1px;
	padding-top: var(--spacing-s);
	font-style: normal;
	font-weight: var(--font-weight-bold);
	font-size: 10px;
	line-height: 12px;
	text-transform: uppercase;
	color: var(--color-text-base);
	cursor: default;
}
</style>
