<script lang="ts">
	import EntryTime from '$components/EntryTime.svelte';
	import { entryOpen } from '$lib/Entries';

	export let entry;
	export let onStart;
	export let onStop;

	$: entryIsOpen = entryOpen(entry);

	const onClick = () => {
		entryIsOpen ? onStop() : onStart();
	};
</script>

<div>
	<EntryTime {entry} />

	<button on:click={onClick}>{entryIsOpen ? 'Stop' : 'Start'}</button>
</div>
