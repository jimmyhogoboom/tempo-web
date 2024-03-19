<script lang="ts">
	import EntryTime from '$components/EntryTime.svelte';
	import Entries from '$lib/Entries';

	export let entry: TimeEntry | undefined;
  export let onStart: () => void;
	export let onStop:  () => void;

	$: entryIsOpen = entry && Entries.entryOpen(entry);

	const onClick = () => {
		entryIsOpen ? onStop() : onStart();
	};
</script>

<div>
	<EntryTime {entry} />

	<button on:click={onClick}>{entryIsOpen ? 'Stop' : 'Start'}</button>
</div>
