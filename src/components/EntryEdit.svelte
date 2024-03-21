<script lang="ts">
	import { dateFormat } from '$lib/utils/dateUtils';
	import EntryTime from '$components/EntryTime.svelte';
	import Entries from '$lib/Entries';

	const { entryOpen } = Entries;

	export let onCopyClick: () => void;
	export let onDeleteClick: () => void;
	export let entry: TimeEntry | undefined;
	$: entry;
</script>

<div class="edit">
	<div class="flex">
		<div class="nowrap">{dateFormat(entry?.startTime)}</div>
		<span style="padding: 0 0.3rem;">→</span>
		<div class="nowrap">{dateFormat(entry?.endTime)}</div>
	</div>
	<div class="time"><EntryTime {entry} /></div>

	<div class="flex controls">
		{#if entry && !!entry.endTime}
			<button on:click={onCopyClick}>Copy</button>
		{/if}
		{#if entry && !entryOpen(entry)}
			<button on:click={onDeleteClick}>Delete</button>
		{/if}
	</div>
</div>

<style lang="scss">
	@use '../styles/colors';

	.edit {
		font-family: sans-serif;
	}

	.flex {
		position: relative;
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;
	}

	.nowrap {
		white-space: nowrap;
	}

	.time {
		font-size: 1rem;
	}
</style>
