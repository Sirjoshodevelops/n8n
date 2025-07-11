<script setup lang="ts">
import AssistantAvatar from '../AskAssistantAvatar/AssistantAvatar.vue';

withDefaults(
	defineProps<{
		message: string;
		animationType?: 'slide-vertical' | 'slide-horizontal' | 'fade';
	}>(),
	{
		animationType: 'slide-vertical',
	},
);
</script>

<template>
	<div :class="$style.container">
		<div :class="$style.avatar">
			<AssistantAvatar size="mini" />
		</div>
		<div :class="$style['message-container']">
			<transition :name="animationType" mode="out-in">
				<span v-if="message" :key="message" :class="$style.message">{{ message }}</span>
			</transition>
		</div>
	</div>
</template>

<style module lang="scss">
.container {
	display: flex;
	align-items: center;
	gap: var(--spacing-3xs);
	user-select: none;
}

.avatar {
	height: var(--spacing-m);
	animation: pulse 1.5s infinite;
	position: relative;
}

.message-container {
	display: inline-flex;
	position: relative;
	overflow: hidden;
	line-height: 1.4rem;
	height: var(--spacing-xl);
	align-items: center;
}
.message {
	margin: 0;
	padding: 0;
	font-weight: var(--font-weight-bold);
	font-size: var(--font-size-2xs);
	color: var(--color-text-base);
	text-align: left;
}

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.7;
	}
	50% {
		transform: scale(1.2);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0.7;
	}
}
</style>

<style lang="scss" scoped>
// Vertical Slide transition
.slide-vertical-enter-active,
.slide-vertical-leave-active {
	transition:
		transform 0.5s ease,
		opacity 0.5s ease;
}

.slide-vertical-enter {
	transform: translateY(100%);
	opacity: 0;
}

.slide-vertical-leave-to {
	transform: translateY(-100%);
	opacity: 0;
}

// Horizontal Slide transition
.slide-horizontal-enter-active,
.slide-horizontal-leave-active {
	transition:
		transform 0.5s ease,
		opacity 0.5s ease;
}

.slide-horizontal-enter {
	transform: translateX(100%);
	opacity: 0;
}

.slide-horizontal-leave-to {
	transform: translateX(-100%);
	opacity: 0;
}

// Fade transition
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}

.fade-enter {
	opacity: 0;
}

.fade-leave-to /* .fade-leave-active in <2.1.8 */ {
	opacity: 0;
}
</style>
