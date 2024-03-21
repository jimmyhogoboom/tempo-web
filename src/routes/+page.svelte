<script lang="ts">
	import { unwrapOr } from 'true-myth/result';
	import { entries } from '$stores/stores';
	import Entries, { type NewTimeEntry, type TimeEntryUpdate, isUpdate } from '$lib/Entries';
	import Timer from '$components/Timer.svelte';
	import EntryListItem from '$components/EntryListItem.svelte';

	const { addEntry, openEntry, updateEntry, deleteEntry } = Entries;

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

	// TODO: open a modal instead
	const handleEntryClick = (entry: TimeEntry) => () => (currentEntry = entry);

	const handleCopyClick = (entry: TimeEntry) => () =>
		addOrUpdate({
			...entry,
			startTime: undefined,
			endTime: undefined,
			id: undefined
		});
	const handleDeleteClick = (entry: TimeEntry) => () => {
		if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
			if (currentEntry?.id === entry.id) {
				currentEntry = undefined;
			}
			entries.update((es) => {
				return deleteEntry(es, entry.id);
			});
		}
	};
</script>

<div class="full background-dark">
	<div class="wrapper">
		<div class="timer">
			<Timer
				entry={currentEntry}
				onStart={handleStartClick}
				onStop={handleStopClick}
				onTitleChange={handleTitleChange}
			/>
		</div>
	</div>

	<ul>
		{#each $entries as entry}
			<EntryListItem
				{entry}
				onClick={handleEntryClick(entry)}
				onCopyClick={handleCopyClick(entry)}
				onDeleteClick={handleDeleteClick(entry)}
			/>
		{/each}
	</ul>
</div>

<style lang="scss">
	@use '../styles/colors';

	.wrapper {
		background-color: darken(colors.$surface-100, 4);
		margin-bottom: 1rem;
		box-shadow: 0px -5px 5px 5px black;
	}

	ul {
		margin-top: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.full {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}

	.background-dark {
		background-color: colors.$background-color;
		color: colors.$text-dim;
	}
</style>
