<script lang="ts">
	import { dateFormat } from '$lib/utils/dateUtils';
	import EntryTime from '$components/EntryTime.svelte';
	import Entries from '$lib/Entries';

	const { entryOpen } = Entries;

	export let entry: TimeEntry;
	export let onClick: () => void;
	export let onCopyClick: () => void;
	export let onDeleteClick: () => void;
</script>

<li class="flex">
	<button on:click={onClick} class="flex main">
		<div class="title">{entry.title}</div>
		<div>{dateFormat(entry.startTime)} - {dateFormat(entry.endTime)}</div>
		<div class="time"><EntryTime {entry} /></div>
	</button>

	<!-- TODO: move these controls into a modal -->
	<div class="flex controls">
		{#if entry && !!entry.endTime}
			<button on:click={onCopyClick}>Copy</button>
		{/if}
		{#if entry && !entryOpen(entry)}
			<button on:click={onDeleteClick}>Delete</button>
		{/if}
	</div>
</li>

<style lang="scss">
	@use '../styles/colors';

	.flex {
		position: relative;
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;
	}

	li {
		overflow: hidden;
		list-style: none;
		padding: 0;
		gap: 1rem;
		justify-content: space-evenly;
		border-top: 1px solid colors.$surface-500;
	}

	$border-radius: 0.3rem;
	li:first-child {
		border-top: none;
		border-radius: $border-radius $border-radius 0 0;
	}

	li:last-child {
		border-radius: 0 0 $border-radius $border-radius;
	}

	.main {
		margin: 0px;
		width: 100%;
		height: 100%;
		color: inherit;
		border: none;
		padding: 1rem 2rem;
		background: transparent;
		cursor: pointer;
	}

	li:hover {
		background-color: colors.$surface-200;
	}

	li:hover .main {
		color: colors.$text;
	}

	.title {
		font-weight: bold;
		width: 100%;
		text-align: start;
	}

	.time {
		font-size: 1rem;
	}
</style>
