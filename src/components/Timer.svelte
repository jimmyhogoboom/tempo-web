<script lang="ts">
	import EntryTime from '$components/EntryTime.svelte';
	import Entries from '$lib/Entries';

	export let entry: TimeEntry | undefined;
	export let onStart: () => void;
	export let onStop: () => void;
	export let onTitleChange: (text: string) => void;

	let title: string = entry?.title ?? '';

	$: entryIsOpen = entry && Entries.entryOpen(entry);

	const onClick = () => {
		entryIsOpen ? onStop() : onStart();
	};
</script>

<div class="timer">
	<input type="text" bind:value={title} on:input={() => onTitleChange(title)} />

	<EntryTime {entry} />

	<button on:click={onClick}>{entryIsOpen ? 'Stop' : 'Start'}</button>
</div>

<style>
	.timer {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
	}
</style>
