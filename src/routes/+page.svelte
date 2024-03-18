<script lang="ts">
	import { entries } from '$stores/stores';
	import { dateFormat } from '$lib/utils/dateUtils';
	import { addEntry, openEntry } from '$lib/Entries';
	import Timer from '$components/Timer.svelte';
	import EntryTime from '$components/EntryTime.svelte';

	$: currentEntry = openEntry($entries);

	const handleStartClick = () =>
		entries.update((es: TimeEntry[]) => {
			// TODO: get reference to new entry to allow for updating on stop
			const r = addEntry(es);

			if (r.isOk) return r.value.entries;

			// TODO: better error message handling
			console.error(r.error);

			return es;
		});

	const handleStopClick = () => {};
</script>

<div>
	<Timer entry={currentEntry} onStart={handleStartClick} onStop={handleStopClick} />

	<ul>
		{#each $entries as entry}
			<li>
				{entry.title}
				{dateFormat(entry.startTime)}
				{dateFormat(entry.endTime)}
				<EntryTime {entry} />
			</li>
		{/each}
	</ul>
</div>
