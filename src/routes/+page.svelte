<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { addEntry, openEntry } from '$lib/Entries';
	import { entries } from '$stores/stores';
	import { format, interval, intervalToDuration, type Duration } from 'date-fns/fp';

	const zeroPad = (num: number = 0) => String(num).padStart(2, '0');
	const timerFormat = (duration: Duration) =>
		`${zeroPad(duration.hours)}:${zeroPad(duration.minutes)}:${zeroPad(duration.seconds)}`;
	const dateFormat = (date?: Date) => (date ? format('h:m aa', date) : '');

	let currentTime = new Date();
	let intervalTimeout: NodeJS.Timeout | null = null;

	$: currentEntry = openEntry($entries);
	$: elapsed = currentEntry
		? intervalToDuration(interval(currentTime, currentEntry.startTime))
		: {};
	$: formatted = timerFormat(elapsed);

	onMount(() => {
		intervalTimeout = setInterval(() => {
			currentTime = new Date();
		}, 1000);
	});
	onDestroy(() => {
		if (intervalTimeout != null) {
			clearInterval(intervalTimeout);
		}
	});

	const handleStartClick = () =>
		entries.update((es: TimeEntry[]) => {
			const r = addEntry(es);
			if (r.ok) return r.ok;

			// TODO: better error message handling
			console.error(r.err);

			return es;
		});
</script>

<div>
	<div>{formatted}</div>

	<button on:click={handleStartClick}>Start</button>

	<ul>
		{#each $entries as entry}
			<li>{entry.title} {dateFormat(entry.startTime)} {dateFormat(entry.endTime)} {formatted}</li>
		{/each}
	</ul>
</div>
