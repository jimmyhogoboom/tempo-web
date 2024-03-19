<script lang="ts">
	import { entries } from '$stores/stores';
	import { dateFormat } from '$lib/utils/dateUtils';
	import Entries from '$lib/Entries';
	import Timer from '$components/Timer.svelte';
	import EntryTime from '$components/EntryTime.svelte';
	import { unwrapOr } from 'true-myth/result';

	const { addEntry, openEntry, updateEntry } = Entries;

	$: currentEntry = unwrapOr(undefined, openEntry($entries));

	const handleStartClick = () =>
		entries.update((es) => {
			// TODO: get reference to new entry to allow for updating on stop
			const r = addEntry(es);

			if (r.isOk) return r.value.entries;

			// TODO: better error message handling
			console.error(r.error);

			return es;
		});

	const handleStopClick = () => {
		if (currentEntry) {
      const id = currentEntry.id;
			entries.update((es) => {
				const r = updateEntry(es, { id, endTime: new Date() });

				if (r.isOk) return r.value.entries;

				// TODO: better error message handling
				console.error(r.error);

				return es;
			});
		}
	};
</script>

<div class="full background-dark">
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

<style lang="scss">
	/** SCSS DARK THEME PRIMARY COLORS */

	$primary-100: #f2591d;
	$primary-200: #f86e38;
	$primary-300: #fc8250;
	$primary-400: #ff9468;
	$primary-500: #ffa680;
	$primary-600: #ffb899;
	$primary-700: #fff2ed;

	/** SCSS DARK THEME SURFACE COLORS */

	$surface-100: #222831;
	$surface-200: #373c45;
	$surface-300: #4d525a;
	$surface-400: #64686f;
	$surface-500: #7c8086;
	$surface-600: #95989d;

	/** SCSS DARK THEME MIXED SURFACE COLORS */

	$surface-mixed-100: #382e31;
	$surface-mixed-200: #4b4245;
	$surface-mixed-300: #605759;
	$surface-mixed-400: #756d6f;
	$surface-mixed-500: #8a8486;

	.full {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}

	.background-dark {
		background-color: $surface-100;
		color: $primary-700;
	}
</style>
