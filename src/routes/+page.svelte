<script lang="ts">
	import { entries } from '$stores/stores';
	import { dateFormat } from '$lib/utils/dateUtils';
	import Entries, { type NewTimeEntry, type TimeEntryUpdate, isUpdate } from '$lib/Entries';
	import Timer from '$components/Timer.svelte';
	import EntryTime from '$components/EntryTime.svelte';
	import { unwrapOr } from 'true-myth/result';

	const { addEntry, openEntry, updateEntry, deleteEntry, entryOpen } = Entries;

	const existingOpenEntry = unwrapOr(undefined, openEntry($entries));

	let currentEntry: TimeEntry | undefined;
	$: currentEntry = existingOpenEntry;

	const addOrUpdate = (newEntry?: NewTimeEntry | TimeEntryUpdate) => {
		const id = isUpdate(newEntry) ? newEntry.id : undefined;
		entries.update((es) => {
			const r = id ? updateEntry(es, { id, ...newEntry }) : addEntry(es, newEntry ?? undefined);

			if (r.isOk) {
				currentEntry = r.value.entry;
				return r.value.entries;
			}

			// TODO: better error message handling
			console.error(r.error);

			return es;
		});
	};

	const handleStartClick = () => {
		const isClosed = currentEntry && !!currentEntry.endTime;

		const arg: TimeEntryUpdate | undefined = isClosed
			? ({ ...currentEntry, endTime: null } as TimeEntryUpdate) // Closed task will be re-opened (endTime removed)
			: currentEntry
				? { ...currentEntry, startTime: currentEntry?.startTime ?? new Date() } // Task without start is given one
				: undefined;

		addOrUpdate(arg);
	};

	const handleStopClick = () => {
		addOrUpdate({ ...currentEntry, endTime: new Date() });
		currentEntry = undefined;
	};

	const handleTitleChange = (text: string) => {
		addOrUpdate({ ...currentEntry, title: text });
	};
</script>

<div class="full background-dark">
	<div class="wrapper">
		<Timer
			entry={currentEntry}
			onStart={handleStartClick}
			onStop={handleStopClick}
			onTitleChange={handleTitleChange}
		/>

		<ul>
			{#each $entries as entry}
				<li>
					<button on:click={() => (currentEntry = entry)}>
						{entry.title}
						{dateFormat(entry.startTime)}
						{dateFormat(entry.endTime)}
						<EntryTime {entry} />
					</button>
					{#if entry && !!entry.endTime}
						<button
							on:click={() =>
								addOrUpdate({
									...entry,
									startTime: undefined,
									endTime: undefined,
									id: undefined
								})}>Copy</button
						>
					{/if}
					{#if entry && !entryOpen(entry)}
						<button
							on:click={() => {
								if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
									if (currentEntry?.id === entry.id) {
										currentEntry = undefined;
									}
									entries.update((es) => {
										return deleteEntry(es, entry.id);
									});
								}
							}}>Delete</button
						>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
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

	.wrapper {
		max-width: 800px;
		margin: 0 auto;
	}
</style>
