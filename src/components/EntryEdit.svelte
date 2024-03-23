<script lang="ts">
	import { dateFormat } from '$lib/utils/dateUtils';
	import { formatEntryDuration } from '$lib/utils/entryUtils';
	import { time } from '$stores/stores';
	import Entries from '$lib/Entries';

	const { entryOpen } = Entries;

	export let onCopyClick: () => void;
	export let onDeleteClick: () => void;
	// TODO: Wait to call onChange until a save button is clicked, to allow the user to back out of changes
	export let onChange: (title: string, entry?: TimeEntry) => void;
	export let entry: TimeEntry | undefined;
	$: entry;
	$: title = entry?.title;
</script>

<div class="edit flex-col">
	<div class="flex">
		<input
			class="title"
			type="text"
			placeholder="Entry description"
			bind:value={title}
			on:input={(e) => onChange(e.currentTarget.value, entry)}
		/>
	</div>
	<div class="flex">
		<div class="flex nowrap">
			<input type="text" value={dateFormat(entry?.startTime)} />
			<span style="padding: 0 0.3rem;">→</span>
			<input type="text" value={dateFormat(entry?.endTime)} />
		</div>
		<input type="text" value={formatEntryDuration($time, entry)} />

		<div class="flex controls">
			{#if entry && !!entry.endTime}
				<button on:click={onCopyClick}>Copy</button>
			{/if}
			{#if entry && !entryOpen(entry)}
				<button on:click={onDeleteClick}>Delete</button>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@use '../styles/colors';

	.edit {
		font-family: sans-serif;
		background-color: darken(colors.$surface-100, 4);
		height: 100%;
	}

	.flex {
		position: relative;
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;
	}

	.flex-col {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.nowrap {
		white-space: nowrap;
	}

	.time {
		font-size: 1rem;
	}

	input {
		font-size: 1rem;
		border: none;
		margin: 0;
		padding: 1rem;
		background: darken(colors.$surface-100, 6);
		color: inherit;
		text-align: center;
	}

	.title {
		display: block;
		width: 100%;
		padding: 1.3rem;
	}
</style>
