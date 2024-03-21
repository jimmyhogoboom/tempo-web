<script lang="ts">
	import { unwrapOr } from 'true-myth/result';
	import { entries } from '$stores/stores';
	import Entries, { type NewTimeEntry, type TimeEntryUpdate, isUpdate } from '$lib/Entries';
	import Timer from '$components/Timer.svelte';
	import EntryListItem from '$components/EntryListItem.svelte';
	import EntryEdit from '$components/EntryEdit.svelte';

	const { addEntry, openEntry, updateEntry, deleteEntry } = Entries;

	const existingOpenEntry = unwrapOr(undefined, openEntry($entries));

	let currentEntry: TimeEntry | undefined;
	$: currentEntry = existingOpenEntry;

	$: open = false;
	let selectedEntry: TimeEntry | undefined;
	$: selectedEntry = undefined;

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

	const handleEntryClick = (entry: TimeEntry) => () => {
		if (open && entry.id === selectedEntry?.id) {
			open = false;
			selectedEntry = undefined;
		} else {
			open = true;
			selectedEntry = entry;
		}
	};

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
			selectedEntry = undefined;
			open = false;
		}
	};
</script>

<div class="full background-dark">
	<div class="head-wrapper">
		<div class="timer">
			<Timer
				entry={currentEntry}
				onStart={handleStartClick}
				onStop={handleStopClick}
				onTitleChange={handleTitleChange}
			/>
		</div>
	</div>

	<div class="wrapper {open && 'open'}">
		<div class="left">
			<ul>
				{#each $entries as entry}
					<EntryListItem
						{entry}
						onClick={handleEntryClick(entry)}
						selected={selectedEntry?.id === entry.id}
					/>
				{/each}
			</ul>
		</div>
		<div class="right">
			<div>
				{#if selectedEntry}
					<EntryEdit
						entry={selectedEntry}
						onCopyClick={handleCopyClick(selectedEntry)}
						onDeleteClick={handleDeleteClick(selectedEntry)}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../styles/colors';

	.head-wrapper {
		position: relative;
		background-color: darken(colors.$surface-100, 4);
		box-shadow: 0px -5px 5px 5px black;
		z-index: 10;
	}

	.wrapper {
		position: relative;
		display: flex;
		margin: 0 auto;
		max-width: 800px;
		overflow-x: hidden;
		z-index: 1;

		.right {
			width: 0;
			background-color: darken(colors.$background-color, 3);
			transition: width 0.6s;
		}

		&.open .right {
			width: 400px;
		}
	}

	ul {
		max-width: 800px;
		margin: 0 auto;
		margin-top: 1rem;
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
